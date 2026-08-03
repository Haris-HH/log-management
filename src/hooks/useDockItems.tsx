// Material UI
import HomeIcon from "@mui/icons-material/Home";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import SearchIcon from "@mui/icons-material/Search";

// i18n
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useSelector } from "react-redux";

// Types
import type { Permissions } from "../types/common";

// Hooks
import { resolvePermission } from "./usePermission";

// Constants
import { PAGE_PERMISSIONS } from "../constants/permissions";

// Store
import type { RootState } from "../store/store";

export type DockSubMenuItem = {
  label: string;
  path: string;
};

export type DockItem = {
  icon: React.ReactNode;
  label: string;
  path?: string;
  subMenu?: DockSubMenuItem[];
};

/*
  A menu entry is active when it *is* the current page, or when it owns it.
  Shared by every navigation shape (dock, sidebar, top menu) so they agree on
  which entry to highlight.
*/
export const isDockItemActive = (item: DockItem, pathname: string): boolean => {
  return (
    item.path === pathname || !!item.subMenu?.some((sub) => sub.path === pathname)
  );
};

/*
  A destination is shown when the user may open it. Anything absent from
  PAGE_PERMISSIONS is ungated by design (Home), so it always shows; anything
  listed there follows its grant, and an unknown permission tree hides it —
  failing closed for the moment before the refresh in `App.tsx` lands.
*/
const isPathVisible = (
  path: string | undefined,
  permission: Permissions | null | undefined
): boolean => {
  if (!path) return false;

  const groupKey = PAGE_PERMISSIONS[path];

  if (!groupKey) return true;

  return resolvePermission(permission, groupKey).canView;
};

export const useDockItems = (): DockItem[] => {
  const { t, i18n } = useTranslation();

  const permission = useSelector(
    (state: RootState) => state.authUser.user?.permission
  );

  return useMemo(
    () => [
      {
        icon: <HomeIcon sx={{ color: "var(--primary-color)" }} />,
        label: t("dock.home"),
        path: "/",
      },
      {
        icon: <AccountTreeIcon sx={{ color: "var(--primary-color)" }} />,
        label: t("dock.internal-chart"),
        subMenu: [
          { label: t("menu.chart-internal-police"), path: "/chart-internal-police" },
          { label: t("menu.chart-internal-nsb"), path: "/chart-internal-nsb" },
          { label: t("menu.chart-external-police"), path: "/chart-external-police" },
          { label: t("menu.chart-top-users"), path: "/chart-top-users" },
        ],
      },
      {
        icon: <AssessmentIcon sx={{ color: "var(--primary-color)" }} />,
        label: t("dock.overview"),
        subMenu: [
          { label: t("menu.overall-checkpoints"), path: "/overall-checkpoints" },
          { label: t("menu.overall-map"), path: "/overall-map" },
          { label: t("menu.overall-report"), path: "/overall-report" },
        ],
      },
      {
        icon: <BarChartIcon sx={{ color: "var(--primary-color)" }} />,
        label: t("dock.access-statistics"),
        subMenu: [
          { label: t("menu.statistic-access-agency"), path: "/statistic-access-agency" },
          { label: t("menu.statistic-access-person"), path: "/statistic-access-person" },
          { label: t("menu.statistic-access-log"), path: "/statistic-access-log" },
        ],
      },
      {
        icon: <SearchIcon sx={{ color: "var(--primary-color)" }} />,
        label: t("dock.search-statistics"),
        subMenu: [
          {
            label: t("menu.statistic-search-agency-plate"),
            path: "/statistic-search-agency-plate",
          },
          {
            label: t("menu.statistic-search-person-plate"),
            path: "/statistic-search-person-plate",
          },
          {
            label: t("menu.statistic-search-log-plate"),
            path: "/statistic-search-log-plate",
          },
        ],
      },
      {
        icon: <BarChartIcon sx={{ color: "var(--primary-color)" }} />,
        label: t("dock.statistics"),
        subMenu: [
          { label: t("menu.statistic-usage-agency"), path: "/statistic-usage-agency" },
          { label: t("menu.statistic-usage-person"), path: "/statistic-usage-person" },
          { label: t("menu.statistic-usage-log"), path: "/statistic-usage-log" },
        ],
      },
    ]
      /*
        Drop what the user cannot open, then drop any group left with nothing
        under it — an expandable heading over an empty list is a dead end, and
        worse, it advertises pages the user is not allowed to know about.
      */
      .map((item) =>
        item.subMenu
          ? {
              ...item,
              subMenu: item.subMenu.filter((sub) =>
                isPathVisible(sub.path, permission)
              ),
            }
          : item
      )
      .filter((item) =>
        item.subMenu
          ? item.subMenu.length > 0
          : isPathVisible(item.path, permission)
      ),
    [t, i18n.language, permission]
  )
};