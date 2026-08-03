/*
  Permission wiring for this console.

  The server keeps one permission tree per service; this app only reads its own
  entry, `permissions.ui["log-management"]`. Everything under `ui` for other
  services ("user-management", "lpr-center", …) is granted and edited elsewhere.
*/
export const LOG_MANAGEMENT_UI_KEY = "log-management";

/*
  Route path -> permission group key.

  One table shared by the router (`PermissionRoute`) and the navigation
  (`useDockItems`) so a page cannot be hidden from the menu while its URL still
  renders, or vice versa. Keys must match `groups`/`prints` on the server
  verbatim.

  `/chart-external-police` has no key of its own: the backend grants the two
  police charts together, so it rides on `chart-internal-police`.

  `/` (Home) is deliberately absent — it is the landing page every authenticated
  user falls back to, including the redirect target for a blocked route, so
  gating it would leave nowhere to land.
*/
export const PAGE_PERMISSIONS: Record<string, string> = {
  "/chart-internal-police": "chart-internal-police",
  "/chart-external-police": "chart-internal-police",
  "/chart-internal-nsb": "chart-internal-nsb",
  "/chart-top-users": "chart-top-users",
  "/overall-checkpoints": "overall-checkpoints",
  "/overall-map": "overall-map",
  "/overall-report": "overall-report",
  "/statistic-access-agency": "statistic-access-agency",
  "/statistic-access-person": "statistic-access-person",
  "/statistic-access-log": "statistic-access-log",
  "/statistic-search-agency-plate": "statistic-search-agency-plate",
  "/statistic-search-person-plate": "statistic-search-person-plate",
  "/statistic-search-log-plate": "statistic-search-log-plate",
  "/statistic-usage-agency": "statistic-usage-agency",
  "/statistic-usage-person": "statistic-usage-person",
  "/statistic-usage-log": "statistic-usage-log",
};
