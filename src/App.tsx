import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { useSelector } from 'react-redux';

// Components
import MainLayout from "./layout/MainLayout";
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

// API
import {
  fetchArea,
  fetchAgency,
  fetchBh,
  fetchBk,
  fetchOrg,
  fetchProject,
  fetchProvince,
  fetchDeviceStatus,
  fetchTitle,
  fetchLprRegion,
  fetchPoliceStation,
} from "./features/dropdown/api/DropdownSlice";

// i18n
import { useTranslation } from 'react-i18next';

// Store
import { useAppDispatch } from "./store/hooks";

// Utils
import { useSse } from "./utils/useSse";

// Store
import type { RootState } from "./store/store";

function App() {

  const dispatch = useAppDispatch();

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

    dispatch(fetchArea());
    dispatch(fetchAgency());
    dispatch(fetchBh());
    dispatch(fetchBk());
    dispatch(fetchOrg());
    dispatch(fetchProject());
    dispatch(fetchProvince());
    dispatch(fetchDeviceStatus());
    dispatch(fetchTitle());
    dispatch(fetchLprRegion());
    dispatch(fetchPoliceStation());
  }, [user, dispatch])

  const enabled = Boolean(localStorage.getItem("accessToken") ?? false);

  const handleSseMessage = (data: any) => {
  };

  useSse(
    "",
    "",
    "",
    handleSseMessage,
    enabled
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
          {/* Chart Internal police */}
          <Route path="chart-internal-police" element={<ChartInternalPolice />} />
          <Route path="chart-internal-nsb" element={<ChartInternalNsb />} />
          <Route path="chart-external-police" element={<ChartExternalPolice />} />
          <Route path="chart-top-users" element={<ChartTopUsers />} />
          {/* Statistic Access */}
          <Route path="statistic-access-agency" element={<StatisticAccessAgency />} />
          <Route path="statistic-access-person" element={<StatisticAccessPerson />} />
          <Route path="statistic-access-log" element={<StatisticAccessLog />} />
          {/* Statistic Search Plate */}
          <Route path="statistic-search-agency-plate" element={<StatisticSearchAgencyPlate />} />
          <Route path="statistic-search-person-plate" element={<StatisticSearchPersonPlate />} />
          <Route path="statistic-search-log-plate" element={<StatisticSearchLogPlate />} />
          {/* Statistic Usage */}
          <Route path="statistic-usage-agency" element={<StatisticUsageAgency />} />
          <Route path="statistic-usage-person" element={<StatisticUsagePerson />} />
          <Route path="statistic-usage-log" element={<StatisticUsageLog />} />
          {/* Overall */}
          <Route path="overall-checkpoints" element={<OverallCheckpoints />} />
          <Route path="overall-map" element={<OverallMap />} />
          <Route path="overall-report" element={<OverallReport />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;