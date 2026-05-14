export interface FetchOptions extends RequestInit {
  queryParams?: Record<string, string>;
  skipAuth?: boolean;
  isFormData?: boolean;
  isStream?: boolean;
  retryCount?: number;
}

// Env
const API = import.meta.env.VITE_API;

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach(p => {
    error ? p.reject(error) : p.resolve(token!);
  });
  failedQueue = [];
};

// Refresh Token
const refreshTokenRequest = async () => {
  const refreshToken = localStorage.getItem("token");

  if (!refreshToken) throw new Error("refresh token missing");

  const res = await fetch(`${API}/users/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("cannot refresh token");

  return res.json();
};

// Handle Refresh Queue
const handleAuthError = async () => {
  if (!isRefreshing) {
    isRefreshing = true;

    try {
      const result = await refreshTokenRequest();
      const newToken = result.accessToken;

      localStorage.setItem("token", newToken);

      processQueue(null, newToken);
      return newToken;
    } catch (err) {
      processQueue(err);
      throw err;
    } finally {
      isRefreshing = false;
    }
  } else {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }
};

// Main
export const fetchClient = async <T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { queryParams, ...fetchOptions } = options;

  const baseURL = API;

  const makeRequest = async (token?: string): Promise<T> => {
    const headers: HeadersInit = {
      ...(options.isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token && !options.skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const queryString = queryParams
      ? "?" + new URLSearchParams(queryParams).toString()
      : "";

    let response: Response;

    try {
      response = await fetch(`${baseURL}${endpoint}${queryString}`, {
        ...fetchOptions,
        credentials: "include",
        headers,
      });
    } catch (err) {
      console.error("Network error:", err);

      if (!options.skipAuth && localStorage.getItem("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userUid");
        window.location.href = "/login";
      }

      throw err;
    }

    // Unauthorized
    if (response.status === 401 || response.status === 403) {
      if (endpoint.includes("login")) {
        const t = await response.text();
        const err = new Error(t || response.statusText);
        (err as any).status = response.status;
        throw err;
      }

      if ((options.retryCount ?? 0) > 1) {
        throw new Error("Too many retries");
      }

      try {
        const newToken = await handleAuthError();

        return fetchClient<T>(endpoint, {
          ...options,
          retryCount: (options.retryCount ?? 0) + 1,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("userUid");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        throw err;
      }
    }

    if (!response.ok) {
      const t = await response.text();
      const err = new Error(t || response.statusText);
      (err as any).status = response.status;
      throw err;
    }

    if (options.isStream) return response as unknown as T;

    return response.json();
  };

  const token = localStorage.getItem("token") || undefined;
  return makeRequest(token);
};

export const combineURL = (url: string, endpoint: string) =>
  `${url}${endpoint}`;