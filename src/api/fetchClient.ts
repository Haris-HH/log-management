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

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_UID_KEY = "userUid";

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const clearAuthStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_UID_KEY);
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

const getLocationHeaders = async (): Promise<HeadersInit> => {
  if (!navigator.geolocation) {
    return {};
  }

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

    const latitude = position.coords.latitude.toString();
    const longitude = position.coords.longitude.toString();

    return {
      "x-latitude": latitude,
      "x-longitude": longitude,
    };
  } 
  catch (error) {
    console.error("Cannot get location:", error);

    return {};
  }
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

    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

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

      if (!skipAuth && localStorage.getItem(ACCESS_TOKEN_KEY)) {
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

  const accessToken =
    localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;

  return makeRequest(accessToken);
};

export const combineURL = (url: string, endpoint: string) => {
  return `${url}${endpoint}`;
};