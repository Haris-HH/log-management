import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';

// Store
import type { RootState } from "../store/store";

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from '@mui/material/MenuItem';
import Menu from "@mui/material/Menu";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// Components
import MainTitle from '../components/main-title/MainTitle';
import LoadingScreen from '../components/loading-screen/LoadingScreen';
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
import type { OverallPieChart, OverallLineChart } from "../types/chart";
import type { OverallReportType, OverallReportDetail } from "../types/common";
import type { OverallReportPdfData } from "../types/pdf";

// Utils
import { exportExcel } from "../utils/exportData";
import { buildOptions } from "../utils/commonFunctions";

// PDF
import {
  downloadOverallReportPdf,
} from "../pdf/OverallReportPdf";

// API
import { 
  getOverallDayReport, 
  getOverallReport,
} from "../features/overall/api/OverallApi";

// i18n
import { useTranslation } from 'react-i18next';

interface FormData {
  area_id: string;
  province_id: string;
  project_id: string;
  date_time: Date | null;
  start_date_time: Date | null;
  end_date_time: Date | null;
  month_year: Date | null;
}

const OverallReport = () => {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // i18n
  const { t, i18n } = useTranslation();

  // State
  const [reportRange, setReportRange] = useState<"day" | "week" | "month">("day");
  const [isLoading, setIsLoading] = useState(false);

  // Options
  const [provinceOptions, setProvinceOptions] = useState<{ label: string, value: string }[]>([]);
  const [projectOptions, setProjectOptions] = useState<{ label: string, value: string }[]>([]);
  const [areaOptions, setAreaOptions] = useState<{ label: string, value: string }[]>([]);

  // Data
  const [dayReportData, setDayReportData] = useState<OverallReportType[]>([]);
  const [weekReportData, setWeekReportData] = useState<OverallReportType[]>([]);
  const [monthReportData, setMonthReportData] = useState<OverallReportType[]>([]);
  const [dayReport, setDayReport] = useState<OverallPieChart[]>([]);
  const [weekReport, setWeekReport] = useState<OverallLineChart[]>([]);
  const [monthReport, setMothReport] = useState<OverallLineChart[]>([]);
  const [excelData, setExcelData] = useState<OverallReportDetail[]>([]);

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    area_id: "0",
    province_id: "0",
    project_id: "0",
    date_time: dayjs().toDate(),
    start_date_time: dayjs().subtract(6, "day").toDate(),
    end_date_time: dayjs().toDate(),
    month_year: dayjs().toDate(),
  });

  // Slice
  const { area, province, project } = useSelector((state: RootState) => state.dropdown);

  useEffect(() => {
    setAreaOptions(buildOptions(area, t('dropdown.all-area')));
    setProvinceOptions(buildOptions(province, t('dropdown.all-province')));
    setProjectOptions(buildOptions(project, t('dropdown.all-project')));
  }, [area, province, project, t, i18n, i18n.language, i18n.isInitialized]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (reportRange === "day") {
          const res = await getOverallDayReport();
          const data = res.data;

          setDayReportData(data);

          const totalData = data.find(
            (report: any) =>
              report.police_division?.toLowerCase() === "total"
          );

          const reportData = [
            {
              name: "normal",
              label: t('status.normal-status'),
              value: totalData?.normal ?? 0,
              percent_value: totalData?.normal_percent ?? 0,
              fill: "var(--status-device-normal)",
            },
            {
              name: "device",
              label: t('status.device-outage'),
              value: totalData?.device ?? 0,
              percent_value: totalData?.device_percent ?? 0,
              fill: "var(--status-device-outage)",
            },
            {
              name: "network",
              label: t('status.network-outage'),
              value: totalData?.network ?? 0,
              percent_value: totalData?.network_percent ?? 0,
              fill: "var(--status-network-outage)",
            },
            {
              name: "disable",
              label: t('status.device-disable'),
              value: totalData?.disable ?? 0,
              percent_value: totalData?.disable_percent ?? 0,
              fill: "var(--status-device-disable)",
            },
          ];

          setDayReport(reportData);
        }

        if (reportRange === "week") {
          const res = await getOverallReport("week");
          const rows = res.data.rows;

          setWeekReportData(rows);
          setWeekReport(res.data.charts);
        }

        if (reportRange === "month") {
          const res = await getOverallReport("month");
          const rows = res.data.rows;

          setMonthReportData(rows);
          setMothReport(res.data.charts);
        }
      } 
      catch (error) {
        console.error(`${t('message.error.fetch-overall-report-error')}:`, error);
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    };

    fetchData();
  }, [reportRange]);

  const handleStateChange = (value: "day" | "week" | "month") => {
    setReportRange(value);
  };

  const handleDateTimeChange = (key: keyof typeof formData, date: Date | null) => {
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

    setFormData((prevState) => ({
      ...prevState,
      [key]: date,
    }));
  };

  const handleDropdownChange = (
    event: React.SyntheticEvent,
    key: keyof typeof formData,
    value: { value: any ,label: string } | null,
  ) => {
    event.preventDefault();
    setFormData((prev) => ({ ...prev, [key]: value?.value ?? 0 }));
  };

  const handleClear = () => {
    setFormData({
      area_id: "0",
    province_id: "0",
    project_id: "0",
      date_time: dayjs().toDate(),
      start_date_time: dayjs().subtract(6, "day").toDate(),
      end_date_time: dayjs().toDate(),
      month_year: dayjs().toDate(),
    });
  }

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleExport = (type: "pdf" | "excel") => {
    handleCloseMenu();
    if (type === "pdf") {
      handleExportPdf();
    }
    else if (type === "excel") {
      handleExportExcel();
    }
  }

  const handleExportPdf = async () => {
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
      area: formData.area_id === "0" ? t('text.all') : areaOptions.find((item) => item.value === formData.area_id)?.label ?? "-",
      province: formData.province_id === "0" ? t('text.all') : provinceOptions.find((item) => item.value === formData.province_id)?.label ?? "-",
      project: formData.project_id === "0" ? t('text.all') : projectOptions.find((item) => item.value === formData.project_id)?.label ?? "-",
      overallReport: reportRange === "day" ? dayReportData : reportRange === "week" ? weekReportData : monthReportData,
      overallReportDetail: excelData,
    }
    await downloadOverallReportPdf(
      pdfData,
      pdfName,
      t,
      i18n
    );
  }

  const handleExportExcel = async () => {
    const dateFormat = i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD";
    const sheetName = reportRange === "day" ? t('file-name.daily-report') : reportRange === "week" ? t('file-name.monthly-report') : t('file-name.yearly-report');
    const date = reportRange === "week" ? `${dayjs(formData.start_date_time).format(dateFormat)}_${dayjs(formData.end_date_time).format(dateFormat)}` : 
                `${dayjs(formData.date_time).format(dateFormat)}`
    await exportExcel({
      sheetName: sheetName,
      fileName: `${sheetName}_${date}.xlsx`,
      headers: [
        t('table.header.no'),
        t('table.header.camera-checkpoint'),
        t('table.header.checkpoint'),
        t('table.header.station'),
        t('table.header.area'),
        t('table.header.province'),
        t('table.header.project'),
        t('table.header.status'),
        t('table.header.problem-date'),
        t('table.header.problem-percent'),
        t('table.header.remark'),
      ],
      data: excelData,
      mapRow: (data, index) => [
        index + 1,
        data.checkpoint_name,
        data.camera_name,
        data.station_name,
        data.area_name,
        data.province_name,
        data.project,
        data.status_id === 1 ? t('text.enable') : t('text.disable'),
        data.date_count_error,
        data.date_count_error_percent.toFixed(1),
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
  };

  return (
    <section id='overall-report' className="flex flex-col h-full w-full p-2">
      { isLoading && <LoadingScreen /> }
      {/* Main Title */}
      <MainTitle title={t("pages.overall-report")} />
      <div className='p-4 bg-(--main-bg-color)/80 flex flex-1 flex-col gap-4 min-h-0 w-full rounded-lg border border-(--primary-color) overflow-y-auto'>
        {/* Search Filters */}
        <Box className="flex flex-col gap-4 bg-(--secondary-color) p-4">
          <Box className="flex gap-4">
            <Button
              variant="contained"
              sx={{
                width: 200,
                height: 38,
                backgroundColor: reportRange === "day" ? "var(--primary-color)" : "var(--secondary-color)",
                color: reportRange === "day" ? "var(--tertiary-color)" : "var(--primary-color)",
                border: reportRange === "day" ? "none" : "1px solid var(--primary-color)",
                "&:hover": {
                  backgroundColor: reportRange === "day" ? "var(--primary-color)" : "var(--range-button-color-hover)",
                },
                fontWeight: 700,
                textTransform: "capitalize",
              }}
              onClick={() => handleStateChange("day")}
            >
              {t('button.daily-report')}
            </Button>
            <Button
              variant="contained"
              sx={{
                width: 200,
                height: 38,
                backgroundColor: reportRange === "week" ? "var(--primary-color)" : "var(--secondary-color)",
                color: reportRange === "week" ? "var(--tertiary-color)" : "var(--primary-color)",
                border: reportRange === "week" ? "none" : "1px solid var(--primary-color)",
                "&:hover": {
                  backgroundColor: reportRange === "week" ? "var(--primary-color)" : "var(--range-button-color-hover)",
                },
                fontWeight: 700,
                textTransform: "capitalize",
              }}
              onClick={() => handleStateChange("week")}
            >
              {t('button.weekly-report')}
            </Button>
            <Button
              variant="contained"
              sx={{
                width: 200,
                height: 38,
                backgroundColor: reportRange === "month" ? "var(--primary-color)" : "var(--secondary-color)",
                color: reportRange === "month" ? "var(--tertiary-color)" : "var(--primary-color)",
                border: reportRange === "month" ? "none" : "1px solid var(--primary-color)",
                "&:hover": {
                  backgroundColor: reportRange === "month" ? "var(--primary-color)" : "var(--range-button-color-hover)",
                },
                fontWeight: 700,
                textTransform: "capitalize",
              }}
              onClick={() => handleStateChange("month")}
            >
              {t('button.monthly-report')}
            </Button>
          </Box>
          <Box 
            className="border border-(--primary-color) rounded-[10px] p-4 bg-(--secondary-color)"
            sx={{
              boxShadow: "0px 2px 8px rgba(var(--secondary-color-rgb),0.1)",
              "& h6": {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
              display: "grid",
              gap: 2,
              gridTemplateColumns:
                reportRange === 'week'
                  ? 'repeat(5, minmax(0, 1fr)) 130px'
                  : 'repeat(4, minmax(0, 1fr)) 130px',
            }}
          >
            {
              reportRange === "day" && (
                <DatePickerBuddhist
                  value={formData.date_time}
                  sx={{
                    marginTop: "5px",
                    borderRadius: "5px",
                    backgroundColor: "white",
                    "& .MuiTextField-root": {
                      height: "fit-content",
                    },
                    "& .MuiOutlinedInput-input": {
                      fontSize: 14,
                    },
                  }}
                  className="w-full"
                  id="date-time"
                  onChange={(value) =>
                    handleDateTimeChange("date_time", value)
                  }
                  label={t('component.date')}
                  labelFontSize="14px"
                  maxDate={dayjs()}
                />
              )
            }

            {
              reportRange === "week" && (
                <>
                  <DatePickerBuddhist
                    value={formData.start_date_time}
                    sx={{
                      marginTop: "5px",
                      borderRadius: "5px",
                      backgroundColor: "white",
                      "& .MuiTextField-root": {
                        height: "fit-content",
                      },
                      "& .MuiOutlinedInput-input": {
                        fontSize: 14,
                      },
                    }}
                    className="w-full"
                    id="start-date-time"
                    onChange={(value) =>
                      handleDateTimeChange("start_date_time", value)
                    }
                    label={t('component.from-date')}
                    labelFontSize="14px"
                    maxDate={dayjs()}
                  />
                  <DatePickerBuddhist
                    value={formData.end_date_time}
                    sx={{
                      marginTop: "5px",
                      borderRadius: "5px",
                      backgroundColor: "white",
                      "& .MuiTextField-root": {
                        height: "fit-content",
                      },
                      "& .MuiOutlinedInput-input": {
                        fontSize: 14,
                      },
                    }}
                    className="w-full"
                    id="start-date-time"
                    onChange={(value) =>
                      handleDateTimeChange("end_date_time", value)
                    }
                    label={t('component.to-date')}
                    labelFontSize="14px"
                    maxDate={dayjs()}
                  />
                </>
              )
            }

            {
              reportRange === "month" && (
                <DatePickerBuddhist
                  value={formData.month_year}
                  sx={{
                    marginTop: "5px",
                    borderRadius: "5px",
                    backgroundColor: "white",
                    "& .MuiTextField-root": {
                      height: "fit-content",
                    },
                    "& .MuiOutlinedInput-input": {
                      fontSize: 14,
                    },
                  }}
                  className="w-full"
                  id="date-time"
                  onChange={(value) =>
                    handleDateTimeChange("month_year", value)
                  }
                  label={t('component.month')}
                  labelFontSize="14px"
                  views={["year", "month"]}
                  openTo="month"
                  format='MMMM YYYY'
                  maxDate={dayjs()}
                />
              )
            }

            <AutoComplete 
              id="area-select"
              sx={{ marginTop: "5px" }}
              value={formData.area_id}
              onChange={(event, value) => handleDropdownChange(event, "area_id", value)}
              options={areaOptions}
              label={t('component.area')}
              placeholder={t('placeholder.area')}
              labelFontSize="14px"
            />

            <AutoComplete 
              id="province-select"
              sx={{ marginTop: "5px" }}
              value={formData.province_id}
              onChange={(event, value) => handleDropdownChange(event, "province_id", value)}
              options={provinceOptions}
              label={t('component.province')}
              placeholder={t('placeholder.province')}
              labelFontSize="14px"
            />

            <AutoComplete 
              id="project-select"
              sx={{ marginTop: "5px" }}
              value={formData.project_id}
              onChange={(event, value) => handleDropdownChange(event, "project_id", value)}
              options={projectOptions}
              label={t('component.province')}
              placeholder={t('placeholder.province')}
              labelFontSize="14px"
            />

            <Box className="flex gap-2 items-end">
              <Button 
                variant="contained" 
                startIcon={<ClearIcon className="h-6 w-6" style={{ color: "var(--tertiary-color)" }} />} 
                sx={{ 
                  backgroundColor: "var(--primary-color)", 
                  fontSize: "14px", 
                  width: t('button.clear-width'),
                  height: "40px",
                  ":hover": {
                    backgroundColor: "rgba(var(--primary-color-rgb), 0.5)",
                  },
                  textTransform: "capitalize",
                  "& .MuiButton-startIcon": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "6px",
                    marginLeft: "0",
                    marginTop: "-3px"
                  },
                }}
                onClick={handleClear}
              >
                {t('button.clear')}
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
                <DownloadIcon className="h-5 w-5" style={{ color: "var(--primary-color)" }} />
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
                    backgroundColor: "var(--secondary-color)",
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
                  "& .MuiSvgIcon-root": {
                    fontSize: 20,
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

        <Box className="grid grid-cols-2 gap-4">
          {/* Chart */}
          <Box className="flex flex-col gap-4 bg-(--secondary-color) p-4">
            <Box className="flex gap-2">
              <ChartIcon className="w-6 h-6" style={{ color: "var(--primary-color)" }} />
              <Typography variant="body1" sx={{ fontSize: "1.1rem", fontWeight: "semi-bold", color: "var(--primary-color)" }}>
                {
                  reportRange === "day"
                    ? `${t('text.daily-status')} ${dayjs(formData.date_time).locale(i18n.language === "th" ? "th" : "en").format(i18n.language === "th" ? "DD MMMM BBBB" : "DD MMMM YYYY")}`
                    : reportRange === "week"
                      ? `${t('text.weekly-status')} ${dayjs(formData.start_date_time).locale(i18n.language === "th" ? "th" : "en").format("D")}-${dayjs(formData.end_date_time).locale(i18n.language === "th" ? "th" : "en").format(i18n.language === "th" ? "D MMMM BBBB" : "D MMMM YYYY")}`
                      : `${t('text.monthly-status')}${dayjs(formData.month_year).locale(i18n.language === "th" ? "th" : "en").format(i18n.language === "th" ? "MMMM BBBB" : "MMMM YYYY")}`
                }
              </Typography>
            </Box>
            {
              reportRange === "day" && (
                <PieChartComponent
                  data={dayReport}
                />
              )
            }
            {
              reportRange === "week" && (
                <LineChartComponent
                  data={weekReport}
                />
              )
            }
            {
              reportRange === "month" && (
                <LineChartComponent
                  data={monthReport}
                  isMonth={true}
                />
              )
            }
          </Box>
          {/* Table */}
          <Box className="flex flex-col gap-4 bg-(--secondary-color) p-4">
            <Box className="flex gap-2">
              <TableIcon className="w-6 h-6" style={{ color: "var(--primary-color)" }} />
              <Typography variant="body1" sx={{ fontSize: "1.1rem", fontWeight: "semi-bold", color: "var(--primary-color)" }}>
                {
                  reportRange === "day"
                    ? `${t('text.daily-performance-report')} ${dayjs(formData.date_time).locale(i18n.language === "th" ? "th" : "en").format(i18n.language === "th" ? "DD MMMM BBBB" : "DD MMMM YYYY")}`
                    : reportRange === "week"
                      ? `${t('text.weekly-performance-report')} ${dayjs(formData.start_date_time).locale(i18n.language === "th" ? "th" : "en").format("D")}-${dayjs(formData.end_date_time).locale(i18n.language === "th" ? "th" : "en").format(i18n.language === "th" ? "D MMMM BBBB" : "D MMMM YYYY")}`
                      : `${t('text.monthly-performance-report')} ${dayjs(formData.month_year).locale(i18n.language === "th" ? "th" : "en").format(i18n.language === "th" ? "MMMM BBBB" : "MMMM YYYY")}`
                }
              </Typography>
            </Box>
            <TableContainer
              component={Paper}
              className="mt-2"
              sx={{
                backgroundColor: "transparent",
                overflow: "auto"
              }}
            >
              <Table
                stickyHeader
              >
                {/* ================= HEADER ================= */}
                <TableHead>
                  <TableRow
                    sx={{
                      height: 50,
                      "& .MuiTableCell-head": {
                        color: "white",
                        backgroundColor: "var(--primary-color)",
                      },
                      "& th": {
                        color: "#FFFFFF",
                        border: "1px solid #DBDCDE",
                        padding: "6px 8px",
                      },
                    }}
                  >
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t('table.header.area')}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t('table.header.all-checkpoint')}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t('table.header.normal-status')}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t('table.header.device-outage')}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t('table.header.network-outage')}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      {t('table.header.disable')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                {/* ================= BODY ================= */}
                <TableBody>
                  {
                    (reportRange === "day" ? dayReportData : 
                      reportRange === "week" ? weekReportData : monthReportData
                    )?.map((data, index) => {
                      const isTotal = data.police_division?.toLowerCase() === "total";

                      const cellStyle = {
                        color: "var(--primary-color) !important",
                        fontSize: "16px",
                        backgroundColor: isTotal ? "var(--total-bg-color)" : "",
                      };

                      const renderCell = (
                        colorClass: string,
                        value: number,
                        percent?: number
                      ) => (
                        <Box className="flex gap-2 items-center justify-start px-3">
                          <Box className={`w-4 h-4 ${colorClass} rounded-full`} />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "16px", color: "var(--primary-color)", p: 0 }}
                          >
                            {value.toLocaleString()}
                            {percent !== undefined && (
                              <span className="text-(--percent-text-color) text-[12px] ml-1">
                                ({percent.toFixed(1)}%)
                              </span>
                            )}
                          </Typography>
                        </Box>
                      );

                      return (
                        <TableRow
                          key={index}
                          sx={{
                            "& td": {
                              border: "1px solid var(--border-chart-color)",
                              padding: "8.5px 8px",
                              color: "#124692",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              ...cellStyle,
                              fontWeight: 600,
                            }}
                          >
                            {data.police_division_name}
                          </TableCell>

                          <TableCell sx={cellStyle}>
                            {renderCell("bg-(--status-all)", data.total)}
                          </TableCell>

                          <TableCell sx={cellStyle}>
                            {renderCell(
                              "bg-(--status-device-normal)",
                              data.normal,
                              data.normal_percent
                            )}
                          </TableCell>

                          <TableCell sx={cellStyle}>
                            {renderCell(
                              "bg-(--status-device-outage)",
                              data.device,
                              data.device_percent
                            )}
                          </TableCell>

                          <TableCell sx={cellStyle}>
                            {renderCell(
                              "bg-(--status-network-outage)",
                              data.network,
                              data.network_percent
                            )}
                          </TableCell>

                          <TableCell sx={cellStyle}>
                            {renderCell(
                              "bg-(--status-device-disable)",
                              data.disable,
                              data.disable_percent
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>      
      </div>
    </section>
  )
}

export default OverallReport;