import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import { useSelector } from 'react-redux';

// Components
import MainLayout from "./layout/MainLayout";
import PermissionRoute from "./components/permission-route/PermissionRoute";
// import CustomCursor from "./components/custom-cursor/CustomCursor";

// Pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import ChartInternalPolice from "./pages/ChartInternalPolice";
import ChartExternalPolice from "./pages/ChartExternalPolice";
import ChartInternalNsb from "./pages/ChartInternalNsb";
import ChartTopUsers from "./pages/ChartTopUsers";
import StatisticUsageAgency from "./pages/StatisticUsageAgency";
import StatisticUsagePerson from "./pages/StatisticUsagePerson";
import StatisticUsageLog from "./pages/StatisticUsageLog";
import StatisticAccessAgency from "./pages/StatisticAccessAgency";
import StatisticAccessPerson from "./pages/StatisticAccessPerson";
import StatisticAccessLog from "./pages/StatisticAccessLog";
import StatisticSearchAgencyPlate from "./pages/StatisticSearchAgencyPlate";
import StatisticSearchPersonPlate from "./pages/StatisticSearchPersonPlate";
import StatisticSearchLogPlate from "./pages/StatisticSearchLogPlate";
import OverallCheckpoints from "./pages/OverallCheckpoints";
import OverallMap from "./pages/OverallMap";
import OverallReport from "./pages/OverallReport";
import NotFound from "./pages/NotFound";

// API
import {
  fetchArea,
  fetchAgency,
  fetchBh,
  fetchProvince,
  fetchDeviceStatus,
  fetchTitle,
  fetchLprRegion,
} from "./features/dropdown/api/DropdownSlice";
import { getUserApi } from "./features/users/api/UsersApi";
import {
  setAuthPermission,
  resolveAuthPermission,
} from "./features/auth-user/api/AuthUserSlice";
import { restoreSession } from "./api/fetchClient";

// i18n
import { useTranslation } from 'react-i18next';

// Store
import { useAppDispatch } from "./store/hooks";

// Utils
import { useSse } from "./utils/useSse";
import { setLogoutReason } from "./utils/logoutReason";
import { getAccessToken } from "./utils/tokenStore";

// Store
import type { RootState } from "./store/store";

// Hooks
import { useForceLogout } from "./hooks/useForceLogout";

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { forceLogout } = useForceLogout();

  // i18n
  const { i18n } = useTranslation();

  // Slice
  const { user } = useSelector((state: RootState) => state.authUser);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      i18n.changeLanguage(JSON.parse(savedLanguage).code);
    }

    if (savedTheme) {
      const theme = JSON.parse(savedTheme);

      document.documentElement.style.setProperty(
        "--theme-accent",
        theme.primary
      );

      document.documentElement.style.setProperty(
        "--primary-color-rgb",
        theme.rgb
      );
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    dispatch(fetchArea({
      limit: "100",
    }));
    dispatch(fetchAgency({
      limit: "100",
    }));
    dispatch(fetchBh({
      limit: "100",
    }));
    dispatch(fetchProvince({
      limit: "100",
    }));
    dispatch(fetchDeviceStatus({
      limit: "100",
    }));
    dispatch(fetchTitle({
      limit: "100",
    }));
    dispatch(fetchLprRegion({
      limit: "100",
    }));
  }, [user, dispatch])

  /*
    Re-read the permission tree on every load rather than trusting the copy
    redux-persist restored. Revoking a page server-side otherwise would not
    reach the user until their next login, and sessions persisted before
    permissions were stored at all carry none.

    Keyed on the id, not the user object, so writing the result back does not
    re-trigger the fetch.
  */
  const userId = user?.user_id;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const refreshPermission = async () => {
      try {
        const response = await getUserApi({ filter: `user_id=${userId}` });

        if (cancelled) return;

        dispatch(setAuthPermission(response.data[0]?.permissions ?? null));
      } catch {
        // A failed refresh keeps whatever is already persisted; it only settles
        // the "not known yet" case so the UI stops waiting on it.
        if (!cancelled) dispatch(resolveAuthPermission());
      }
    };

    refreshPermission();

    return () => {
      cancelled = true;
    };
  }, [userId, dispatch]);

  /*
    The access token lives in memory only (src/utils/tokenStore.ts) and does
    not survive a reload, so a hard refresh always starts with no token even
    for a still-valid session. restoreSession() re-mints one from the httpOnly
    refresh cookie before the guard below decides whether to log the user out
    - without this every reload would bounce a logged-in user to /login.
  */
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    /*
      No in-memory token here doesn't necessarily mean the session is dead -
      restoreSession's one boot-time attempt can also fail on a transient
      network hiccup. When redux-persist has already rehydrated a user, trust
      it and let a real API call's own 401 -> refresh -> force-logout cycle
      (fetchClient.ts) confirm the session is actually gone, instead of
      speculatively wiping a still-good profile on a boot blip.
    */
    if (!getAccessToken() && !user && location.pathname !== "/login") {
      forceLogout(false);
    }
  }, [authChecked, user, location.pathname, forceLogout]);

  useEffect(() => {
    const handleForceLogout = () => {
      forceLogout(false);
    };

    window.addEventListener("force-logout", handleForceLogout);

    return () => {
      window.removeEventListener("force-logout", handleForceLogout);
    };
  }, [forceLogout]);

  const enabled = authChecked && Boolean(getAccessToken());

  /*
    The server has already discarded this session, so there is nothing left to
    log out from - calling the API would only fail. Clear locally and record
    why, so the login page can say what happened instead of leaving the
    operator to read it as an unexplained session timeout.
  */
  const handleAutoLogout = async () => {
    setLogoutReason("signed-in-elsewhere");

    await forceLogout(false);
  }

  useSse(
    "force-logout",
    handleAutoLogout,
    enabled,
    { closeOnEvent: true }
  );

  return (
    <>
      {/* Custom Cursor overlays entire app */}
      {/* <CustomCursor /> */}

      {/* App Routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          {/*
            Every page below is wrapped in PermissionRoute so a route the user
            has no grant for cannot be reached by URL, not just hidden from the
            menu. The group keys come from PAGE_PERMISSIONS, which useDockItems
            reads too — the two stay in step by construction.
          */}
          {/* Chart Internal police */}
          <Route
            path="chart-internal-police"
            element={
              <PermissionRoute groupKey="chart-internal-police">
                <ChartInternalPolice />
              </PermissionRoute>
            }
          />
          <Route
            path="chart-internal-nsb"
            element={
              <PermissionRoute groupKey="chart-internal-nsb">
                <ChartInternalNsb />
              </PermissionRoute>
            }
          />
          {/* No key of its own — granted together with the internal police chart. */}
          <Route
            path="chart-external-police"
            element={
              <PermissionRoute groupKey="chart-internal-police">
                <ChartExternalPolice />
              </PermissionRoute>
            }
          />
          <Route
            path="chart-top-users"
            element={
              <PermissionRoute groupKey="chart-top-users">
                <ChartTopUsers />
              </PermissionRoute>
            }
          />
          {/* Statistic Access */}
          <Route
            path="statistic-access-agency"
            element={
              <PermissionRoute groupKey="statistic-access-agency">
                <StatisticAccessAgency />
              </PermissionRoute>
            }
          />
          <Route
            path="statistic-access-person"
            element={
              <PermissionRoute groupKey="statistic-access-person">
                <StatisticAccessPerson />
              </PermissionRoute>
            }
          />
          <Route
            path="statistic-access-log"
            element={
              <PermissionRoute groupKey="statistic-access-log">
                <StatisticAccessLog />
              </PermissionRoute>
            }
          />
          {/* Statistic Search Plate */}
          <Route
            path="statistic-search-agency-plate"
            element={
              <PermissionRoute groupKey="statistic-search-agency-plate">
                <StatisticSearchAgencyPlate />
              </PermissionRoute>
            }
          />
          <Route
            path="statistic-search-person-plate"
            element={
              <PermissionRoute groupKey="statistic-search-person-plate">
                <StatisticSearchPersonPlate />
              </PermissionRoute>
            }
          />
          <Route
            path="statistic-search-log-plate"
            element={
              <PermissionRoute groupKey="statistic-search-log-plate">
                <StatisticSearchLogPlate />
              </PermissionRoute>
            }
          />
          {/* Statistic Usage */}
          <Route
            path="statistic-usage-agency"
            element={
              <PermissionRoute groupKey="statistic-usage-agency">
                <StatisticUsageAgency />
              </PermissionRoute>
            }
          />
          <Route
            path="statistic-usage-person"
            element={
              <PermissionRoute groupKey="statistic-usage-person">
                <StatisticUsagePerson />
              </PermissionRoute>
            }
          />
          <Route
            path="statistic-usage-log"
            element={
              <PermissionRoute groupKey="statistic-usage-log">
                <StatisticUsageLog />
              </PermissionRoute>
            }
          />
          {/* Overall */}
          <Route
            path="overall-checkpoints"
            element={
              <PermissionRoute groupKey="overall-checkpoints">
                <OverallCheckpoints />
              </PermissionRoute>
            }
          />
          <Route
            path="overall-map"
            element={
              <PermissionRoute groupKey="overall-map">
                <OverallMap />
              </PermissionRoute>
            }
          />
          <Route
            path="overall-report"
            element={
              <PermissionRoute groupKey="overall-report">
                <OverallReport />
              </PermissionRoute>
            }
          />
          {/* Catch-all — sits inside MainLayout so an unknown URL still has the
              navbar and the menu to get out with. `/login` is matched by its own
              route above, and a request with no token is redirected there by the
              guard effect before this ever renders. */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;