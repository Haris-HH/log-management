// Material UI
import HomeIcon from "@mui/icons-material/Home";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import SearchIcon from "@mui/icons-material/Search";

// i18n
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

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

export const useDockItems = (): DockItem[] => {
  const { t, i18n } = useTranslation();

  return useMemo(
    () => [
      {
        icon: <HomeIcon />,
        label: t("dock.home"),
        path: "/",
      },
      {
        icon: <AccountTreeIcon />,
        label: t("dock.internal-chart"),
        subMenu: [
          { label: t("menu.chart-internal-police"), path: "/chart-internal-police" },
          { label: t("menu.chart-internal-nsb"), path: "/chart-internal-nsb" },
          { label: t("menu.chart-external-police"), path: "/chart-external-police" },
          { label: t("menu.chart-top-users"), path: "/chart-top-users" },
        ],
      },
      {
        icon: <AssessmentIcon />,
        label: t("dock.overview"),
        subMenu: [
          { label: t("menu.overall-checkpoints"), path: "/overall-checkpoints" },
          { label: t("menu.overall-map"), path: "/overall-map" },
          { label: t("menu.overall-report"), path: "/overall-report" },
        ],
      },
      {
        icon: <BarChartIcon />,
        label: t("dock.access-statistics"),
        subMenu: [
          { label: t("menu.statistic-access-agency"), path: "/statistic-access-agency" },
          { label: t("menu.statistic-access-person"), path: "/statistic-access-person" },
          { label: t("menu.statistic-access-log"), path: "/statistic-access-log" },
        ],
      },
      {
        icon: <SearchIcon />,
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
        icon: <BarChartIcon />,
        label: t("dock.statistics"),
        subMenu: [
          { label: t("menu.statistic-usage-agency"), path: "/statistic-usage-agency" },
          { label: t("menu.statistic-usage-person"), path: "/statistic-usage-person" },
          { label: t("menu.statistic-usage-log"), path: "/statistic-usage-log" },
        ],
      },
    ],
    [t, i18n.language]
  )
};