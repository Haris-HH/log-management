import { Navigate } from "react-router-dom";

// Hooks
import { usePermission } from "../../hooks/usePermission";

type Props = {
  /** Page key inside this service — `permissions.ui["log-management"].groups[groupKey]`. */
  groupKey: string;
  children: React.ReactNode;
};

/*
  Route-level half of the permission model: "none" has to mean the page cannot
  be reached, not merely that its menu entry is hidden, so a hand-typed or
  bookmarked URL lands back on the home page instead of rendering a screen full
  of data the user is not allowed to see.

  While the permission tree is still unknown (a session persisted before
  permissions were stored, waiting on the refetch in `App.tsx`) this renders
  nothing rather than redirecting — bouncing to home on every reload and only
  then discovering the user was allowed in would be worse than a blank frame.

  The redirect is `replace` so the blocked URL does not stay in history and
  bounce the user again when they press Back.
*/
const PermissionRoute = ({ groupKey, children }: Props) => {
  const { canView, isResolved } = usePermission(groupKey);

  if (!isResolved) return null;

  if (!canView) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default PermissionRoute;
