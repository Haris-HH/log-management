import { useSelector } from "react-redux";

// Types
import type { Permissions, PermissionMode } from "../types/common";

// Constants
import { LOG_MANAGEMENT_UI_KEY } from "../constants/permissions";

// Store
import type { RootState } from "../store/store";

export type ResolvedPermission = {
  /** Raw grant for the page: "none" when the server never sent the key. */
  mode: PermissionMode;
  /** May open the page at all — "active" or "edit". */
  canView: boolean;
  /** May use create/edit controls — "edit" only. */
  canEdit: boolean;
  /** May export/print. A separate axis from `mode`, not implied by "edit". */
  canPrint: boolean;
  /** Page opens, but every mutating control is hidden. */
  isReadOnly: boolean;
  /** Page must not be reachable at all. */
  noPermission: boolean;
};

/*
  Pure resolver so callers that need many keys at once (the navigation) can read
  the permission tree from the store once and ask about each page, instead of
  running a hook per menu entry.
*/
export const resolvePermission = (
  permission: Permissions | null | undefined,
  groupKey: string,
  uiKey: string = LOG_MANAGEMENT_UI_KEY
): ResolvedPermission => {
  const ui = permission?.ui?.[uiKey];

  // `enabled: false` retires the whole service; the per-page grants below it
  // stay in the payload but stop meaning anything.
  const isServiceEnabled = ui?.enabled === true;

  const mode = ui?.groups?.[groupKey] ?? "none";

  const canView = isServiceEnabled && (mode === "active" || mode === "edit");

  /*
    `prints` is its own axis — "active" may export and "edit" may not — but it
    is still bounded by access: a page the user cannot open cannot be exported
    from, however the print flag was left behind.
  */
  const canPrint = canView && ui?.prints?.[groupKey] === true;

  return {
    mode,
    canView,
    canEdit: isServiceEnabled && mode === "edit",
    canPrint,
    isReadOnly: mode === "active",
    noPermission: !isServiceEnabled || mode === "none",
  };
};

/**
 * Grants for one page of this console.
 *
 * `isResolved` is false only while the permission tree is still unknown — a
 * session persisted before permissions were stored, between the app mounting
 * and `App.tsx` refetching the user. Callers that would otherwise redirect or
 * hide should wait on it rather than act on an empty tree, or a reload lands
 * the user on the home page instead of the page they were reading.
 */
export const usePermission = (
  groupKey: string,
  uiKey: string = LOG_MANAGEMENT_UI_KEY
) => {
  const permission = useSelector(
    (state: RootState) => state.authUser.user?.permission
  );

  return {
    ...resolvePermission(permission, groupKey, uiKey),
    isResolved: permission !== undefined,
  };
};
