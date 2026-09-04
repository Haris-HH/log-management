/*
  Access token lives in a module-level variable, not localStorage - an XSS
  payload that can run JS in this page can still read it while it runs, but
  it cannot pull it out of storage after the fact, from another tab, or after
  the browser is closed and reopened. It does not survive a reload; callers
  that need the session to persist across reloads use restoreSession() in
  fetchClient.ts, which re-mints it from the httpOnly refresh cookie.
*/
let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const clearAccessToken = (): void => {
  accessToken = null;
};
