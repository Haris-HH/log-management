import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

// Env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SERVICE_CHANNEL = import.meta.env.VITE_API_SERVICE_CHANNEL;

const ACCESS_TOKEN_KEY = "accessToken";

/*
  A dropped stream is ordinary - a proxy timeout, a sleeping laptop, a service
  restart - so it reconnects with a backoff that grows to a cap rather than
  hammering a service that is down. Giving up instead would silently end
  force-logout coverage for the rest of the session.
*/
const RETRY_BASE_MS = 2_000;
const RETRY_MAX_MS = 30_000;

interface SseEnvelope {
  serviceChannel?: string;
  [key: string]: unknown;
}

interface UseSseOptions {
  onError?: (err: unknown) => void;
  /*
    Close the stream for good after the first matching event. For
    "force-logout" the session is over, so nothing further on the stream can
    matter and a repeat event must not fire the handler again mid-navigation.
  */
  closeOnEvent?: boolean;
}

/*
  The route is not deployed on this host. Rethrown from onerror to stop
  fetch-event-source permanently - retrying a 404 forever is console noise
  with nothing to gain.
*/
class FatalSseError extends Error {}

export function useSse(
  eventName: string,
  onMessage: (data: SseEnvelope) => void,
  enabled: boolean,
  options: UseSseOptions = {}
) {
  const { onError, closeOnEvent = false } = options;

  const callbackRef = useRef(onMessage);
  const errorCallbackRef = useRef(onError);

  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  /*
    Both callbacks are held in refs so that callers passing inline arrow
    functions do not re-trigger the effect on every render — that would
    tear down and re-open the SSE connection continuously.
  */
  useEffect(() => {
    errorCallbackRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!eventName || !enabled) return;

    const controller = new AbortController();

    const finalUrl = `${API_BASE_URL}/events`;

    /*
      Mutated in place before each retry rather than read once: a failure here
      is usually an access token that fetchClient has refreshed since, and
      reconnecting with the stale one would keep failing.
    */
    const headers: Record<string, string> = {
      Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_KEY)}`,
      "x-service-channel": SERVICE_CHANNEL,
    };

    let attempt = 0;

    fetchEventSource(finalUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
      openWhenHidden: true,

      async onopen(response) {
        if (response.status === 404) {
          throw new FatalSseError("SSE route is not available on this host");
        }

        if (!response.ok) {
          throw new Error(`SSE failed with status ${response.status}`);
        }

        // Connected, so the next drop retries promptly instead of at the cap.
        attempt = 0;

        console.log("SSE Connection Opened");
      },

      onmessage(event) {
        if (event.event !== eventName) return;

        let data: SseEnvelope;

        try {
          data = JSON.parse(event.data) as SseEnvelope;
        } catch (err) {
          console.error("Failed to parse SSE data:", err);
          return;
        }

        /*
          The stream is scoped per user, not per channel. An event naming a
          DIFFERENT channel belongs to another of this user's clients, so
          ignoring it keeps their sign-in on another service from evicting
          this app. A payload naming no channel is treated as ours: it reached
          us, and ignoring it would leave the tab running against a session the
          server has already discarded.
        */
        if (data.serviceChannel && data.serviceChannel !== SERVICE_CHANNEL) return;

        callbackRef.current(data);

        if (closeOnEvent) controller.abort();
      },

      onerror(err) {
        errorCallbackRef.current?.(err);

        if (err instanceof FatalSseError) {
          console.error("SSE stopped:", err);

          // Rethrowing stops fetch-event-source from retrying.
          throw err;
        }

        headers.Authorization = `Bearer ${localStorage.getItem(ACCESS_TOKEN_KEY)}`;

        const delay = Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS);

        attempt += 1;

        console.error(`SSE Error - reconnecting in ${delay}ms:`, err);

        // Returning a number tells fetch-event-source to retry after it.
        return delay;
      },
    }).catch((err: unknown) => {
      /*
        onerror rethrows to stop fetch-event-source from retrying, which
        rejects this promise. Without a handler that surfaces as an
        unhandled rejection; aborting on unmount lands here too.
      */
      if (controller.signal.aborted) return;

      console.error("SSE Connection Closed With Error:", err);
    });

    return () => {
      controller.abort();
      console.log("SSE Connection Closed");
    };
  }, [eventName, enabled, closeOnEvent]);
}
