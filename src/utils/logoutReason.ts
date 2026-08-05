/*
  Why the operator is back at /login, held for exactly one read.

  Module scope rather than localStorage: the reason is meaningless after a
  reload, and a stale one would accuse the operator of something that did not
  happen this time. Only ever holds one of the values below - never a server
  message, an id or a channel name - so nothing about another session can leak
  onto the sign-in page.
*/
export type LogoutReason = "signed-in-elsewhere";

let reason: LogoutReason | null = null;

export function setLogoutReason(next: LogoutReason) {
  reason = next;
}

/*
  Reading clears it, so the notice does not reappear the next time the login
  page is visited.
*/
export function consumeLogoutReason(): LogoutReason | null {
  const current = reason;

  reason = null;

  return current;
}
