import React, { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

// Store
import type { RootState } from "../store/store";

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// Components
import MainTitle from "../components/main-title/MainTitle";
import LoadingScreen from "../components/loading-screen/LoadingScreen";
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";
import AutoComplete from "../components/auto-complete/AutoComplete";
import PieChartComponent from "../components/pie-chart/PieChart";
import LineChartComponent from "../components/line-chart/LineChart";

// Icons
import ClearIcon from "../assets/svg/clear.svg?react";
import DownloadIcon from "../assets/svg/download.svg?react";
import ChartIcon from "../assets/svg/chart.svg?react";
import TableIcon from "../assets/svg/table.svg?react";

// Types
import type { OverallPieChart } from "../types/chart";
import type { OverallReportType, Summary, Series } from "../types/common";
import type { OverallReportPdfData } from "../types/pdf"

// Utils
import { exportExcel } from "../utils/exportData";
import { buildOptions, getPercent, formatNumber, formatPercent } from "../utils/commonFunctions";

// API
import { getOverallReport, searchOverallProblemReport } from "../features/overall/api/OverallApi";

// i18n
import { useTranslation } from "react-i18next";

// PDF
import {
  downloadOverallReportPdf,
} from "../pdf/OverallReportPdf";

type ReportRange = "day" | "week" | "month";

interface FormData {
  area_id: string;
  province_id: string;
  project_id: string;
  date_time: Date | null;
  start_date_time: Date | null;
  end_date_time: Date | null;
  month_year: Date | null;
}

const defaultFormData = (): FormData => ({
  area_id: "0",
  province_id: "0",
  project_id: "0",
  date_time: dayjs().toDate(),
  start_date_time: dayjs().subtract(6, "day").toDate(),
  end_date_time: dayjs().toDate(),
  month_year: dayjs().toDate(),
});

const OverallReport = () => {
  const { t, i18n } = useTranslation();

  const { area, province, project } = useSelector(
    (state: RootState) => state.dropdown
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // State
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [reportRange, setReportRange] = useState<ReportRange>("day");
  const [reportData, setReportData] = useState<OverallReportType[]>([]);
  const [summaryValue, setSummaryValue] = useState<Summary | null>(null);
  const [dayReport, setDayReport] = useState<OverallPieChart[]>([]);
  const [weekReport, setWeekReport] = useState<Series[]>([]);
  const [monthReport, setMonthReport] = useState<Series[]>([]);

  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const datePickerSx = {
    marginTop: "5px",
    borderRadius: "5px",
    backgroundColor: "white",
    "& .MuiTextField-root": {
      height: "fit-content",
    },
    "& .MuiOutlinedInput-input": {
      fontSize: 14,
    },
  };

  const areaOptions = useMemo(() => {
    const langKeyArea = i18n.language === "th" ? "title_th" : "title_en";
    return buildOptions(area, t("dropdown.all-area"), langKeyArea, "id");
  }, [area, t, i18n.language]);

  const provinceOptions = useMemo(() => {
    const langKeyProvince = i18n.language === "th" ? "name_th" : "name_en";

    const filteredProvince =
      formData.area_id !== "0"
        ? province.filter(
            (item) => item.police_region_id === Number(formData.area_id)
          )
        : province;

    return buildOptions(
      filteredProvince,
      t("dropdown.all-province"),
      langKeyProvince,
      "province_code"
    );
  }, [province, formData.area_id, t, i18n.language]);

  const projectOptions = useMemo(() => {
    const filteredProject =
      formData.province_id !== "0"
        ? project.filter((item) => item.province_code === formData.province_id)
        : project;

    return buildOptions(
      filteredProject,
      t("dropdown.all-project"),
      "project_name",
      "project_id"
    );
  }, [project, formData.province_id, t]);

  // Map
  const areaMap = new Map(
    area.map(item => [item.id, item])
  );

  const provinceMap = new Map(
    province.map(item => [item.province_code, item])
  );

  const projectMap = new Map(
    project.map(item => [item.project_id, item])
  );

  const getFilters = useCallback((data: FormData, range: ReportRange) => {
    const filters: Record<string, string> = {
      device_category: "camera",
      device_type: "lpr",
      page: "1",
      limit: "10",
      report_range: range,
    };

    if (range === "day") {
      filters.start_date = dayjs(data.date_time).format("YYYY-MM-DD");
    }

    if (range === "week") {
      filters.start_date = dayjs(data.start_date_time).format("YYYY-MM-DD");
      filters.end_date = dayjs(data.end_date_time).format("YYYY-MM-DD");
    }

    if (range === "month") {
      filters.start_date = dayjs(data.month_year).format("YYYY-MM-DD");
    }

    if (data.area_id !== "0") {
      filters.police_region_id = data.area_id;
    }

    if (data.province_id !== "0") {
      filters.province_code = data.province_id;
    }

    if (data.project_id !== "0") {
      filters.project_id = data.project_id;
    }

    return filters;
  }, []);

  const fetchData = useCallback(
    async (filterData: FormData = formData, range: ReportRange = reportRange) => {
      setIsLoading(true);

      try {
        const res = await getOverallReport({
          ...getFilters(filterData, range),
        });

        const updated = res.data.map((item: OverallReportType) => ({
          ...item,
          online_percent: getPercent(item.online ?? 0, item.total ?? 0),
          offline_percent: getPercent(item.offline ?? 0, item.total ?? 0),
          maintenance_percent: getPercent(item.maintenance ?? 0, item.total ?? 0),
          suspended_percent: getPercent(item.suspended ?? 0, item.total ?? 0),
          others_percent: getPercent(item.others ?? 0, item.total ?? 0),
        }));

        setReportData(updated);

        if (res.summary) {
          const updatedSummary = {
            ...res.summary,
            online_percent: getPercent(res.summary.online ?? 0, res.summary.total ?? 0),
            offline_percent: getPercent(res.summary.offline ?? 0, res.summary.total ?? 0),
            maintenance_percent: getPercent(res.summary.maintenance ?? 0, res.summary.total ?? 0),
            suspended_percent: getPercent(res.summary.suspended ?? 0, res.summary.total ?? 0),
            others_percent: getPercent(res.summary.others ?? 0, res.summary.total ?? 0),
          }
          setSummaryValue(updatedSummary);
        }

        if (reportRange === "week" && res.series) {
          setWeekReport(res.series)
        }
        else if (reportRange === "month" && res.series) {
          setMonthReport(res.series)
        }
      } 
      catch (error) {
        console.error(`${t("message.error.fetch-overall-report-error")}:`, error);
        setReportData([]);
      } 
      finally {
        setIsLoading(false);
      }
    },
    [formData, reportRange, getFilters, t]
  );

  useEffect(() => {
    fetchData(formData, reportRange);
  }, [fetchData, formData, reportRange]);

  useEffect(() => {
    const pieData: OverallPieChart[] = [
      {
        name: "normal",
        label: t("status.normal-status"),
        value: summaryValue?.online ?? 0,
        percent_value: summaryValue?.online_percent ?? 0,
        fill: "var(--status-device-normal)",
      },
      {
        name: "device",
        label: t("status.device-outage"),
        value: summaryValue?.offline ?? 0,
        percent_value: summaryValue?.offline_percent ?? 0,
        fill: "var(--status-device-outage)",
      },
      {
        name: "network",
        label: t("status.network-outage"),
        value: summaryValue?.others ?? 0,
        percent_value: summaryValue?.others_percent ?? 0,
        fill: "var(--status-network-outage)",
      },
      {
        name: "disable",
        label: t("status.device-disable"),
        value: summaryValue?.maintenance ?? 0,
        percent_value: summaryValue?.maintenance_percent ?? 0,
        fill: "var(--status-device-disable)",
      },
    ];

    setDayReport(pieData);
  }, [summaryValue, t]);

  const handleStateChange = (value: ReportRange) => {
    setReportRange(value);
  };

  const handleDateTimeChange = (key: keyof FormData, date: Date | null) => {
    if (!date) return;

    if (reportRange === "week") {
      if (key === "start_date_time") {
        const start = dayjs(date);
        const end = start.add(6, "day");

        setFormData((prev) => ({
          ...prev,
          start_date_time: start.toDate(),
          end_date_time: end.toDate(),
        }));
        return;
      }

      if (key === "end_date_time") {
        const end = dayjs(date);
        const start = end.subtract(6, "day");

        setFormData((prev) => ({
          ...prev,
          start_date_time: start.toDate(),
          end_date_time: end.toDate(),
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [key]: date,
    }));
  };

  const handleDropdownChange = (
    event: React.SyntheticEvent,
    key: keyof FormData,
    value: { value: string; label: string } | null
  ) => {
    event.preventDefault();

    setFormData((prev) => {
      const next: FormData = {
        ...prev,
        [key]: value?.value ?? "0",
      };

      if (key === "area_id") {
        next.province_id = "0";
        next.project_id = "0";
      }

      if (key === "province_id") {
        next.project_id = "0";
      }

      return next;
    });
  };

  const handleClear = () => {
    setFormData(defaultFormData());
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const fetchProblemReportData = async (filterData: FormData = formData, range: ReportRange = reportRange) => {
    try {
      const res = await searchOverallProblemReport({
        ...getFilters(filterData, range),
      });
      return res.data;
    } 
    catch (error) {
      console.error(`${t("message.error.fetch-overall-report-error")}:`, error);
      return [];
    } 
  };

  const handleExport = (type: "pdf" | "excel") => {
    handleCloseMenu();

    if (type === "pdf") {
      handleExportPdf();
      return;
    }

    handleExportExcel();
  };

  const handleExportPdf = async () => {
    setIsLoading(true);

    const problemReportData = await fetchProblemReportData();

    const areaData =
      formData.area_id !== "0"
        ? areaMap.get(Number(formData.area_id))
        : undefined;

    const provinceData =
      formData.province_id !== "0"
        ? provinceMap.get(formData.province_id)
        : undefined;

    const projectData =
      formData.project_id !== "0"
        ? projectMap.get(formData.project_id)
        : undefined;

    const areaName =
      formData.area_id === "0"
        ? t("text.all")
        : i18n.language === "th"
          ? areaData?.title_abbr_th ?? "-"
          : areaData?.title_abbr_en ?? "-";

    const provinceName =
      formData.province_id === "0"
        ? t("text.all")
        : i18n.language === "th"
          ? provinceData?.name_th ?? "-"
          : provinceData?.name_en ?? "-";

    const projectName =
      formData.project_id === "0"
        ? t("text.all")
        : projectData?.project_name ?? "-";

    const dateFormat = i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD";
    const reportDateFormat = i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY";
    const name = reportRange === "day" ? t('file-name.daily-report') : reportRange === "week" ? t('file-name.weekly-report') : t('file-name.monthly-report');
    const dateName = reportRange === "week" ? `${dayjs(formData.start_date_time).format(dateFormat)}_${dayjs(formData.end_date_time).format(dateFormat)}` : 
                `${dayjs(formData.date_time).format(dateFormat)}`
    const date = reportRange === "week" ? `${dayjs(formData.start_date_time).format(reportDateFormat)} - ${dayjs(formData.end_date_time).format(reportDateFormat)}` : 
                `${dayjs(formData.date_time).format(reportDateFormat)}`
    const pdfName = `${name}_${dateName}.pdf`;
    const pdfData: OverallReportPdfData = {
      title: reportRange === "day" ? t('text.daily-report-and-checkpoint-problem') : reportRange === "week" ? t('text.weekly-report-and-checkpoint-problem') : t('text.monthly-report-and-checkpoint-problem'),
      date: date,
      area: areaName,
      province: provinceName,
      project: projectName,
      summary: summaryValue,
      overallReport: reportData,
      overallReportDetail: problemReportData,
    }
    await downloadOverallReportPdf(
      pdfData,
      pdfName,
      t,
      i18n
    );
    setIsLoading(false);
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    const problemReportData = await fetchProblemReportData();
    const dateFormat = i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD";

    const sheetName =
      reportRange === "day"
        ? t("file-name.daily-report")
        : reportRange === "week"
          ? t("file-name.weekly-report")
          : t("file-name.monthly-report");

    const date =
      reportRange === "week"
        ? `${dayjs(formData.start_date_time).format(dateFormat)}_${dayjs(
            formData.end_date_time
          ).format(dateFormat)}`
        : reportRange === "month"
          ? dayjs(formData.month_year).format(
              i18n.language === "th" ? "BBBB-MM" : "YYYY-MM"
            )
          : dayjs(formData.date_time).format(dateFormat);

    await exportExcel({
      sheetName,
      fileName: `${sheetName}_${date}.xlsx`,
      headers: [
        t("table.header.no"),
        t("table.header.camera-checkpoint"),
        t("table.header.checkpoint"),
        t("table.header.station"),
        t("table.header.area"),
        t("table.header.province"),
        t("table.header.project"),
        t("table.header.status"),
        t("table.header.problem-date"),
        t("table.header.problem-percent"),
        t("table.header.remark"),
      ],
      data: problemReportData,
      mapRow: (data, index) => [
        index + 1,
        data.device_name,
        data.checkpoint_name,
        data.station_name,
        data.police_region,
        data.province_name,
        data.project_name,
        data.device_status_code === "online" ? t("text.enable") : t("text.disable"),
        formatNumber(data.problem_days),
        `${formatPercent(data.problem_pct)}%`,
        data.remark,
      ],
      columnStyles: {
        1: { alignment: { horizontal: "center" } },
        7: { alignment: { horizontal: "center" } },
        8: { alignment: { horizontal: "center" } },
        9: { alignment: { horizontal: "center" } },
        10: { alignment: { horizontal: "center" } },
      },
    });
    setIsLoading(false);
  };

  const getDisplayDate = () => {
    const locale = i18n.language === "th" ? "th" : "en";

    if (reportRange === "day") {
      return dayjs(formData.date_time)
        .locale(locale)
        .format(i18n.language === "th" ? "DD MMMM BBBB" : "DD MMMM YYYY");
    }

    if (reportRange === "week") {
      return `${dayjs(formData.start_date_time).locale(locale).format("D")}-${dayjs(
        formData.end_date_time
      )
        .locale(locale)
        .format(i18n.language === "th" ? "D MMMM BBBB" : "D MMMM YYYY")}`;
    }

    return dayjs(formData.month_year)
      .locale(locale)
      .format(i18n.language === "th" ? "MMMM BBBB" : "MMMM YYYY");
  };

  const renderCell = (colorClass: string, value: number, percent?: number, isTotal?: boolean) => (
    <Box className="flex gap-2 items-center justify-start px-3">
      <Box className={`w-4 h-4 ${colorClass} rounded-full`} />
      <Typography
        variant="body2"
        sx={{
          fontSize: "16px",
          color: "var(--primary-color)",
          p: 0,
        }}
      >
        {(value ?? 0).toLocaleString()}
        {percent !== undefined && (
          <span className={`${isTotal ? "text-(--tertiary-color)" : "text-(--secondary-color)"} text-[12px] ml-1`}>
            ({percent.toFixed(1)}%)
          </span>
        )}
      </Typography>
    </Box>
  );

  return (
    <section id="overall-report" className="flex flex-col h-full w-full p-2">
      {isLoading && <LoadingScreen />}

      <MainTitle title={t("pages.overall-report")} />

      <div className="p-4 bg-(--main-bg-color) flex flex-1 flex-col gap-4 min-h-0 w-full rounded-lg border border-(--primary-color) overflow-y-auto">
        <Box className="flex flex-col gap-4 bg-(--tertiary-color) p-4">
          <Box className="flex gap-4">
            {(["day", "week", "month"] as ReportRange[]).map((range) => (
              <Button
                key={range}
                variant="contained"
                sx={{
                  width: 200,
                  height: 38,
                  backgroundColor:
                    reportRange === range
                      ? "var(--primary-color)"
                      : "var(--tertiary-color)",
                  color:
                    reportRange === range
                      ? "var(--tertiary-color)"
                      : "var(--primary-color)",
                  border:
                    reportRange === range
                      ? "none"
                      : "1px solid var(--primary-color)",
                  "&:hover": {
                    backgroundColor:
                      reportRange === range
                        ? "rgba(var(--primary-color-rgb), 0.5)"
                        : "rgba(var(--primary-color-rgb), 0.2)",
                  },
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
                onClick={() => handleStateChange(range)}
              >
                {range === "day"
                  ? t("button.daily-report")
                  : range === "week"
                    ? t("button.weekly-report")
                    : t("button.monthly-report")}
              </Button>
            ))}
          </Box>

          <Box
            className="border border-(--primary-color) rounded-[10px] p-4 bg-(--tertiary-color)"
            sx={{
              boxShadow: "0px 2px 8px rgba(var(--tertiary-color-rgb),0.1)",
              "& h6": {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
              display: "grid",
              gap: 2,
              gridTemplateColumns:
                reportRange === "week"
                  ? "repeat(5, minmax(0, 1fr)) 130px"
                  : "repeat(4, minmax(0, 1fr)) 130px",
            }}
          >
            {reportRange === "day" && (
              <DatePickerBuddhist
                value={formData.date_time}
                sx={datePickerSx}
                className="w-full"
                id="date-time"
                onChange={(value) => handleDateTimeChange("date_time", value)}
                label={t("component.date")}
                labelFontSize="14px"
                maxDate={dayjs()}
              />
            )}

            {reportRange === "week" && (
              <>
                <DatePickerBuddhist
                  value={formData.start_date_time}
                  sx={datePickerSx}
                  className="w-full"
                  id="start-date-time"
                  onChange={(value) =>
                    handleDateTimeChange("start_date_time", value)
                  }
                  label={t("component.from-date")}
                  labelFontSize="14px"
                  maxDate={dayjs()}
                />

                <DatePickerBuddhist
                  value={formData.end_date_time}
                  sx={datePickerSx}
                  className="w-full"
                  id="end-date-time"
                  onChange={(value) =>
                    handleDateTimeChange("end_date_time", value)
                  }
                  label={t("component.to-date")}
                  labelFontSize="14px"
                  maxDate={dayjs()}
                />
              </>
            )}

            {reportRange === "month" && (
              <DatePickerBuddhist
                value={formData.month_year}
                sx={datePickerSx}
                className="w-full"
                id="month-year"
                onChange={(value) => handleDateTimeChange("month_year", value)}
                label={t("component.month")}
                labelFontSize="14px"
                views={["year", "month"]}
                openTo="month"
                format="MMMM YYYY"
                maxDate={dayjs()}
              />
            )}

            <AutoComplete
              id="area-select"
              sx={{ marginTop: "5px" }}
              value={formData.area_id}
              onChange={(event, value) =>
                handleDropdownChange(event, "area_id", value)
              }
              options={areaOptions}
              label={t("component.area")}
              placeholder={t("placeholder.area")}
              labelFontSize="14px"
            />

            <AutoComplete
              id="province-select"
              sx={{ marginTop: "5px" }}
              value={formData.province_id}
              onChange={(event, value) =>
                handleDropdownChange(event, "province_id", value)
              }
              options={provinceOptions}
              label={t("component.province")}
              placeholder={t("placeholder.province")}
              labelFontSize="14px"
            />

            <AutoComplete
              id="project-select"
              sx={{ marginTop: "5px" }}
              value={formData.project_id}
              onChange={(event, value) =>
                handleDropdownChange(event, "project_id", value)
              }
              options={projectOptions}
              label={t("component.project")}
              placeholder={t("placeholder.project")}
              labelFontSize="14px"
            />

            <Box className="flex gap-2 items-end">
              <Button
                variant="contained"
                startIcon={
                  <ClearIcon
                    className="h-6 w-6"
                    style={{ color: "var(--tertiary-color)" }}
                  />
                }
                sx={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--tertiary-color)",
                  fontSize: "14px",
                  width: t("button.clear-width"),
                  height: "40px",
                  ":hover": {
                    backgroundColor: "rgba(var(--primary-color-rgb), 0.8)",
                  },
                  textTransform: "capitalize",
                  "& .MuiButton-startIcon": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "6px",
                    marginLeft: "0",
                    marginTop: "-3px",
                  },
                }}
                onClick={handleClear}
              >
                {t("button.clear")}
              </Button>

              <IconButton
                sx={{
                  border: "1px solid var(--primary-color)",
                  width: "40px",
                  height: "40px",
                  borderRadius: "5px",
                  ":hover": {
                    backgroundColor: "rgba(var(--primary-color-rgb), 0.2)",
                  },
                }}
                onClick={handleOpenMenu}
              >
                <DownloadIcon
                  className="h-5 w-5"
                  style={{ color: "var(--primary-color)" }}
                />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleCloseMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                sx={{
                  "& .MuiPaper-root": {
                    backgroundColor: "var(--tertiary-color)",
                    border: "1px solid var(--primary-color)",
                    borderRadius: "8px",
                    overflow: "hidden",
                  },
                  "& .MuiMenu-list": {
                    p: 0,
                  },
                  "& .MuiMenuItem-root": {
                    px: "20px",
                    py: "8px",
                    "&:not(:last-of-type)": {
                      borderBottom: "1px solid var(--primary-color)",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(var(--primary-color-rgb), 0.2)",
                    },
                  },
                  "& .MuiTypography-root": {
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--primary-color)",
                  },
                }}
              >
                <MenuItem onClick={() => handleExport("pdf")}>
                  <ListItemText primary="PDF" />
                </MenuItem>

                <MenuItem onClick={() => handleExport("excel")}>
                  <ListItemText primary="Excel" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>

        <Box className="grid grid-cols-2 gap-4 flex-1">
          <Box className="flex flex-col gap-4 bg-(--tertiary-color) p-4">
            <Box className="flex gap-2">
              <ChartIcon
                className="w-6 h-6"
                style={{ color: "var(--primary-color)" }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--primary-color)",
                }}
              >
                {reportRange === "day"
                  ? `${t("text.daily-status")} ${getDisplayDate()}`
                  : reportRange === "week"
                    ? `${t("text.weekly-status")} ${getDisplayDate()}`
                    : `${t("text.monthly-status")} ${getDisplayDate()}`}
              </Typography>
            </Box>

            {reportRange === "day" && <PieChartComponent data={dayReport} />}

            {reportRange === "week" && (
              <LineChartComponent data={weekReport} />
            )}

            {reportRange === "month" && (
              <LineChartComponent data={monthReport} isMonth />
            )}
          </Box>

          <Box className="flex flex-col gap-4 bg-(--tertiary-color) p-4">
            <Box className="flex gap-2">
              <TableIcon
                className="w-6 h-6"
                style={{ color: "var(--primary-color)" }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--primary-color)",
                }}
              >
                {reportRange === "day"
                  ? `${t("text.daily-performance-report")} ${getDisplayDate()}`
                  : reportRange === "week"
                    ? `${t("text.weekly-performance-report")} ${getDisplayDate()}`
                    : `${t("text.monthly-performance-report")} ${getDisplayDate()}`}
              </Typography>
            </Box>

            <TableContainer
              component={Paper}
              className="mt-2"
              sx={{
                backgroundColor: "transparent",
                overflow: "auto",
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      height: 50,
                      "& .MuiTableCell-head": {
                        color: "var(--tertiary-color)",
                        backgroundColor: "var(--primary-color)",
                      },
                      "& th": {
                        color: "var(--tertiary-color)",
                        border: "1px solid rgba(var(--secondary-color-rgb), 0.3)",
                        padding: "6px 8px",
                      },
                    }}
                  >
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t("table.header.area")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t("table.header.all-checkpoint")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t("table.header.normal-status")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t("table.header.device-outage")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t("table.header.network-outage")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t("table.header.disable")}
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {reportData.map((data, index) => {
                    const policeRegion =
                      i18n.language === "th"
                        ? data.police_region?.title_abbr_th ?? "-"
                        : data.police_region?.title_abbr_en ?? "-";

                    return (
                      <TableRow
                        key={`${data.police_region_id ?? index}`}
                        sx={{
                          "& td": {
                            border: "1px solid rgba(var(--secondary-color-rgb), 0.3)",
                            padding: "8.5px 8px",
                            color: "#124692",
                          },
                          "& .MuiTableCell-root": {
                            color: "var(--primary-color) !important",
                            fontSize: "16px",
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>
                          {policeRegion}
                        </TableCell>

                        <TableCell>
                          {renderCell("bg-(--status-all)", data.total)}
                        </TableCell>

                        <TableCell>
                          {renderCell(
                            "bg-(--status-device-normal)",
                            data.online,
                            data.online_percent
                          )}
                        </TableCell>

                        <TableCell>
                          {renderCell(
                            "bg-(--status-device-outage)",
                            data.offline,
                            data.offline_percent
                          )}
                        </TableCell>

                        <TableCell>
                          {renderCell(
                            "bg-(--status-network-outage)",
                            data.others,
                            data.others_percent
                          )}
                        </TableCell>

                        <TableCell>
                          {renderCell(
                            "bg-(--status-device-disable)",
                            data.maintenance,
                            data.maintenance_percent
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {reportData.length > 0 && (
                    <TableRow
                      sx={{
                        "& td": {
                          border: "1px solid rgba(var(--secondary-color-rgb), 0.3)",
                          padding: "8.5px 8px",
                          color: "#124692",
                          fontWeight: 700,
                          backgroundColor: "var(--total-bg-color)",
                        },
                        "& .MuiTableCell-root": {
                          color: "var(--primary-color) !important",
                          fontSize: "16px",
                        },
                      }}
                    >
                      <TableCell>{t("table.header.total")}</TableCell>

                      <TableCell>
                        {renderCell("bg-(--status-all)", summaryValue.total)}
                      </TableCell>

                      <TableCell>
                        {renderCell(
                          "bg-(--status-device-normal)",
                          summaryValue.online,
                          summaryValue.online_percent,
                          true
                        )}
                      </TableCell>

                      <TableCell>
                        {renderCell(
                          "bg-(--status-device-outage)",
                          summaryValue.offline,
                          summaryValue.offline_percent,
                          true
                        )}
                      </TableCell>

                      <TableCell>
                        {renderCell(
                          "bg-(--status-network-outage)",
                          summaryValue.others,
                          summaryValue.others_percent,
                          true
                        )}
                      </TableCell>

                      <TableCell>
                        {renderCell(
                          "bg-(--status-device-disable)",
                          summaryValue.maintenance,
                          summaryValue.maintenance_percent,
                          true
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                  {
                    reportData.length === 0 && (
                      <TableRow
                        sx={{
                          "& td": {
                            border: "1px solid rgba(var(--secondary-color-rgb), 0.1)",
                            padding: "8.5px 8px",
                            color: "var(--tertiary-color)",
                            fontWeight: 700,
                            backgroundColor: "var(--secondary-color)",
                          },
                        }}
                      >
                        <TableCell colSpan={6} align="center">{t("text.data-not-found")}</TableCell>
                      </TableRow>
                    )
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </div>
    </section>
  );
};

export default OverallReport;