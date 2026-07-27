import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

// Env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SERVICE_CHANNEL = import.meta.env.VITE_API_SERVICE_CHANNEL;

const ACCESS_TOKEN_KEY = "accessToken";

export function useSse(
  eventName: string,
  onMessage: (data: any) => void,
  enabled: boolean,
  isPgNotify: boolean = true,
  onError?: (err: any) => void
) {
  const callbackRef = useRef(onMessage);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!eventName || !enabled) return;

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const controller = new AbortController();

    abortControllerRef.current = controller;

    const finalUrl = `${API_BASE_URL}/events`;

    fetchEventSource(finalUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
      openWhenHidden: true,

      async onopen(response) {
        if (!response.ok) {
          throw new Error(`SSE failed with status ${response.status}`);
        }

        console.log("SSE Connection Opened");
      },

      onmessage(event) {
        if (event.event !== eventName) return;

        try {
          const data = JSON.parse(event.data);
          if (data.serviceChannel !== SERVICE_CHANNEL) return;
          callbackRef.current(data);
        } catch (err) {
          console.error("Failed to parse SSE data:", err);
        }
      },

      onerror(err) {
        console.error("SSE Error:", err);
        onError?.(err);

        throw err;
      },
    });

    return () => {
      controller.abort();
      abortControllerRef.current = null;
      console.log("SSE Connection Closed");
    };
  }, [eventName, enabled, isPgNotify, onError]);
}