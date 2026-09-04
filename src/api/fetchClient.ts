import { getAccessToken, setAccessToken, clearAccessToken } from "../utils/tokenStore";

export interface FetchOptions extends RequestInit {
  queryParams?: Record<string, string>;
  skipAuth?: boolean;
  isFormData?: boolean;
  isStream?: boolean;
  retryCount?: number;
}

// Env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SERVICE_CHANNEL = import.meta.env.VITE_API_SERVICE_CHANNEL;

const REFRESH_TOKEN_KEY = "refreshToken";
const USER_UID_KEY = "userUid";
const PERSIST_ROOT_KEY = "persist:root";

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const clearAuthStorage = () => {
  clearAccessToken();
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_UID_KEY);
  // redux-persist keeps the authenticated user (name, hash_id, agency) here.
  // Leaving it behind means the next visitor sees the previous user's identity
  // in the navbar/watermark until a fresh login overwrites it.
  localStorage.removeItem(PERSIST_ROOT_KEY);
  clearLocationCache();
};

const redirectToLogin = () => {
  clearAuthStorage();

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });

  failedQueue = [];
};

const createHttpError = async (response: Response) => {
  const text = await response.text();

  const error = new Error(text || response.statusText);

  (error as Error & { status?: number }).status = response.status;

  return error;
};

// ==============================
// Location Headers
// ==============================

// How long a position fix may be reused across requests. Previously every single
// API call forced a fresh high-accuracy fix (maximumAge: 0), so a page issuing N
// requests paid N GPS acquisitions and up to N * 5s of added latency.
const LOCATION_TTL_MS = 30_000;

let cachedLocation: { headers: HeadersInit; expiresAt: number } | null = null;
let inFlightLocation: Promise<HeadersInit> | null = null;

const requestLocationHeaders = async (): Promise<HeadersInit> => {
  try {
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }
    );

    return {
      "x-latitude": position.coords.latitude.toString(),
      "x-longitude": position.coords.longitude.toString(),
    };
  }
  catch (error) {
    console.error("Cannot get location:", error);

    // Cache the failure too: a denied permission would otherwise re-prompt the
    // geolocation stack on every request for the rest of the session.
    return {};
  }
};

const getLocationHeaders = async (): Promise<HeadersInit> => {
  if (!navigator.geolocation) {
    return {};
  }

  if (cachedLocation && cachedLocation.expiresAt > Date.now()) {
    return cachedLocation.headers;
  }

  // Concurrent requests share one acquisition instead of each starting their own.
  if (!inFlightLocation) {
    inFlightLocation = requestLocationHeaders()
      .then((headers) => {
        cachedLocation = {
          headers,
          expiresAt: Date.now() + LOCATION_TTL_MS,
        };
        return headers;
      })
      .finally(() => {
        inFlightLocation = null;
      });
  }

  return inFlightLocation;
};

/** Drop any cached position — call on logout so a new session re-acquires. */
export const clearLocationCache = () => {
  cachedLocation = null;
};

// ==============================
// Refresh Token
// ==============================

const refreshTokenRequest = async (): Promise<{
  accessToken: string;
}> => {
  const response = await fetch(`${API_BASE_URL}/user-management/users/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw await createHttpError(response);
  }

  return response.json();
};

// ==============================
// Handle Refresh Queue
// ==============================

const handleAuthError = async (): Promise<string> => {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const result = await refreshTokenRequest();

    const newAccessToken = result.accessToken;

    setAccessToken(newAccessToken);

    processQueue(null, newAccessToken);

    return newAccessToken;
  }
  catch (error) {
    processQueue(error);
    throw error;
  }
  finally {
    isRefreshing = false;
  }
};

/*
  Re-mints an access token from the httpOnly refresh cookie on app load. The
  token store is memory-only and does not survive a reload, so without this
  every reload would look like a logged-out session even though the server
  still recognizes the refresh cookie. Reuses handleAuthError's single-flight
  guard so this coalesces with any refresh a concurrent 401 triggers.
*/
export const restoreSession = async (): Promise<boolean> => {
  try {
    await handleAuthError();
    return true;
  }
  catch {
    return false;
  }
};

// ==============================
// Main Fetch Client
// ==============================

export const fetchClient = async <T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> => {
  const {
    queryParams,
    skipAuth = false,
    isFormData = false,
    isStream = false,
    retryCount = 0,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const queryString = queryParams
    ? `?${new URLSearchParams(queryParams).toString()}`
    : "";

  const makeRequest = async (token?: string): Promise<T> => {
    const locationHeaders = await getLocationHeaders();

    const headers: HeadersInit = {
      "x-service-channel": SERVICE_CHANNEL,
      ...(isFormData
        ? {}
        : {
            "Content-Type": "application/json",
          }),
      ...locationHeaders,
      ...(token && !skipAuth
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...customHeaders,
    };

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}${endpoint}${queryString}`, {
        ...fetchOptions,
        credentials: "include",
        headers,
      });
    } 
    catch (error) {
      console.error("Network error:", error);

      if (!skipAuth && getAccessToken()) {
        redirectToLogin();
      }

      throw error;
    }

    // Unauthorized
    if ((response.status === 401 || response.status === 403) && !skipAuth) {
      if (retryCount >= 1) {
        window.dispatchEvent(new Event("force-logout"));
        throw new Error("Too many retries");
      }

      try {
        const newAccessToken = await handleAuthError();

        return fetchClient<T>(endpoint, {
          ...options,
          retryCount: retryCount + 1,
          headers: {
            ...customHeaders,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      } 
      catch (error) {
        window.dispatchEvent(new Event("force-logout"));
        throw error;
      }
    }

    if (!response.ok) {
      throw await createHttpError(response);
    }

    if (isStream) {
      return response as unknown as T;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  };

  const accessToken = getAccessToken() || undefined;

  return makeRequest(accessToken);
};

export const combineURL = (url: string, endpoint: string) => {
  return `${url}${endpoint}`;
};