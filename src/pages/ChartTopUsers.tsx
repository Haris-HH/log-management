import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { SelectChangeEvent } from '@mui/material';

import SettingsIcon from '@mui/icons-material/Settings';

// Components
import MainTitle from '../components/main-title/MainTitle';
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";
import TopUsersDisplaySetting from '../components/top-users-display-setting/TopUsersDisplaySetting';
import PaginationBelowTableComponent from "../components/pagination/PaginationBelowTable";

// Hooks
import usePageTitle from '../hooks/usePageTitle';

// Types
import type { TopUsersType } from "../types/common";

// API
import { getTopUsersChart } from "../features/usage-chart/api/UsageChartApi";

// i18n
import { useTranslation } from 'react-i18next';

// Constants
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

interface FormData {
  month_year: Date | null;
}

const ChartTopUsers = () => {
  // i18n
  const { t, i18n } = useTranslation();
  
  usePageTitle(t("pages.chart-top-users"));

  // State
  const [policeState, setPoliceState] = useState<"internal" | "external">("internal");
  const [displaySettingOpen, setDisplaySettingOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [topUsersData, setTopUsersData] = useState<TopUsersType[]>([]);
  const [topInternalValue, setTopInternalValue] = useState<number>(5000);
  const [topExternalValue, setTopExternalValue] = useState<number>(3000);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageInput, setPageInput] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    ROWS_PER_PAGE_OPTIONS[0],
  );
  const [rowsPerPageOptions] = useState(ROWS_PER_PAGE_OPTIONS);

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    month_year: dayjs().toDate(),
  });

  useEffect(() => {
    if (!formData.month_year) return;

    fetchData(dayjs(formData.month_year).format("YYYY-MM-DD"), policeState);
  }, [formData.month_year, policeState]);

  const fetchData = useCallback(
    async (monthYear: string, policeState: "internal" | "external") => {
      setIsLoading(true);
      const res = await getTopUsersChart(monthYear, policeState);
      setTopUsersData(res.results);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    },
    []
  );

  const handleStateChange = (value: "internal" | "external") => {
    setPoliceState(value);
  };

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    const limit = parseInt(event.target.value)
    setRowsPerPage(limit);
  };

  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    event.preventDefault();
    setPage(value);
  };

  const handlePageInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      setPage(pageInput);
    }
  };

  const handlePageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const cleaned = input.replace(/\D/g, '');

    if (cleaned) {
      const numberInput = Number(cleaned);
      if (numberInput > 0 && numberInput <= totalPages) {
        setPageInput(numberInput);
      }
    }
    else if (cleaned === "") {
      setPageInput(1);
    }
    return cleaned;
  }

  const handleDisplaySettingChange = (topInternal: number, topExternal: number) => {
    setDisplaySettingOpen(false);
    setTopInternalValue(topInternal);
    setTopExternalValue(topExternal);
  }

  const handleDateTimeChange = (key: keyof typeof formData, date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: date,
    }));
  };

  return (
    <section id='chart-top-users' className="flex flex-col h-full w-full p-2">
      {/* Main Title */}
      <MainTitle title={t("pages.chart-top-users")} />
      <div className='p-2 bg-(--main-bg-color)/80 flex-1 min-h-0 w-full rounded-lg border border-(--primary-color) overflow-hidden'>
        {/* Chart */}
        <Box 
          className="w-full bg-(--secondary-color) p-4 flex flex-col gap-4"
          sx={{
            boxShadow: "-2px 3px 2px rgba(var(--secondary-color-rgb),0.1)"
          }}
        >
          <Box className="flex flex-col gap-2">
            <Box className='flex justify-between gap-2'>
              <Box className='flex gap-2 w-50'>
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
                  id="month-year"
                  onChange={(value) =>
                    handleDateTimeChange("month_year", value)
                  }

                  label={t('component.main-month')}
                  labelFontSize="14px"
                  views={["year", "month"]}
                  openTo="month"
                  format='MMMM YYYY'
                  maxDate={dayjs()}
                />
              </Box>
              <Box className="-mt-1">
                <IconButton 
                  sx={{
                    backgroundColor: displaySettingOpen ? "var(--primary-color)" : "var(--secondary-color)",
                    border: "1px solid var(--primary-color)",
                    "&:hover": {
                      backgroundColor: "rgba(var(--primary-color-rgb), 0.2)",
                    },
                    borderRadius: "5px",
                    padding: "5px",
                  }}
                  onClick={() => setDisplaySettingOpen(true)}
                >
                  <SettingsIcon sx={{ color: displaySettingOpen ? "var(--tertiary-color)" : "var(--primary-color)" }} />
                </IconButton>
              </Box>
            </Box>
            <Box className='flex justify-between mt-5'>
              <Box className='flex gap-3 items-center'>
                <Button
                  variant="contained"
                  sx={{
                    width: 170,
                    height: 40,
                    backgroundColor: policeState === "internal" ? "var(--primary-color)" : "var(--secondary-color)",
                    color: policeState === "internal" ? "var(--tertiary-color)" : "var(--primary-color)",
                    border: policeState === "internal" ? "none" : "1px solid var(--primary-color)",
                    "&:hover": {
                      backgroundColor: policeState === "internal" ? "rgba(var(--primary-color-rgb), 0.8)" : "rgba(var(--primary-color-rgb), 0.2)",
                    },
                    fontWeight: 700,
                    textTransform: "capitalize",
                  }}
                  onClick={() => handleStateChange("internal")}
                >
                  {t('button.internal-police')}
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    width: 170,
                    height: 40,
                    backgroundColor: policeState === "external" ? "var(--primary-color)" : "var(--secondary-color)",
                    color: policeState === "external" ? "var(--tertiary-color)" : "var(--primary-color)",
                    border: policeState === "external" ? "none" : "1px solid var(--primary-color)",
                    "&:hover": {
                      backgroundColor: policeState === "external" ? "rgba(var(--primary-color-rgb), 0.8)" : "rgba(var(--primary-color-rgb), 0.2)",
                    },
                    fontWeight: 700,
                    textTransform: "capitalize",
                  }}
                  onClick={() => handleStateChange("external")}
                >
                  {t('button.external-police')}
                </Button>
              </Box>
              <Box className='flex items-end'>
                <Typography className="text-(--primary-color)" sx={{ fontSize: "14px" }}>
                  {t("text.usage-count-more-than")} :{" "}
                  <span className="font-bold">{policeState === "internal" ? topInternalValue.toLocaleString() : topExternalValue.toLocaleString()}</span>{" "}
                  {t("text.time")}
                </Typography>
              </Box>
            </Box>

            {/* Table */}
            <TableContainer
              component={Paper}
              className="mt-3 flex-1"
              sx={{
                backgroundColor: "transparent",
                overflow: "auto"
              }}
            >
              <Table
                size="small"
                sx={{ minWidth: 650, backgroundColor: "var(--secondary-color)" }}
              >
                {/* ================= HEADER ================= */}
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "var(--primary-color)",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      height: 40,
                      "& th": {
                        color: "var(--tertiary-color)",
                        border: "1px solid rgba(var(--primary-color-rgb), 0.5)",
                        padding: "6px 8px",
                      },
                    }}
                  >
                    <TableCell align="center" sx={{ width: "3%", fontWeight: 700 }}>
                      {t("table.header.order")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%", fontWeight: 700 }}>
                      {t("table.header.pid")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%", fontWeight: 700 }}>
                      {t("table.header.name")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%", fontWeight: 700 }}>
                      {t("table.header.phone")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%", fontWeight: 700 }}>
                      {t("table.header.agency")}
                    </TableCell>

                    {topUsersData[0]?.usageData
                    .sort((a, b) =>
                      dayjs(a.usageMonthYear).valueOf() -
                      dayjs(b.usageMonthYear).valueOf()
                    )
                    .map((usage, index) => (
                      <TableCell
                        key={`header-${index}`}
                        align="center"
                        sx={{ width: "8%", fontWeight: 700 }}
                      >
                        {dayjs(usage.usageMonthYear)
                          .locale("th")
                          .format(i18n.language === "th" ? "MMMM BBBB" : "MMMM YYYY")}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                {/* ================= BODY ================= */}
                <TableBody>
                  {topUsersData.map((item, index) => {
                    
                    return (
                      <TableRow
                        key={index}
                        sx={{
                          "& td": {
                            border: "1px solid rgba(var(--primary-color-rgb), 0.5)",
                            padding: "6px 8px",
                            color: "var(--primary-color)",
                          },
                        }}
                      >
                        <TableCell align="center">
                          {index + 1}
                        </TableCell>

                        <TableCell align="center">
                          {item.nation_number}
                        </TableCell>

                        <TableCell align="center">
                          {`${item.prename_id}${item.fullname}`}
                        </TableCell>

                        <TableCell align="center">
                          {item.phone}
                        </TableCell>

                        <TableCell align="center">
                          {item.ad_ou}
                        </TableCell>

                        {item.usageData
                        .sort((a, b) =>
                          dayjs(a.usageMonthYear).valueOf() -
                          dayjs(b.usageMonthYear).valueOf()
                        )
                        .map((usage, usageIndex) => (
                          <TableCell
                            key={`row-${index}-${usageIndex}`}
                            sx={{
                              backgroundColor: dayjs(formData.month_year).format("YYYY-MM") === usage.usageMonthYear ? "rgba(var(--primary-color-rgb), 0.5)" : "rgba(var(--primary-color-rgb), 0.2)",
                              fontWeight: dayjs(formData.month_year).format("YYYY-MM") === usage.usageMonthYear ? "bold" : "normal",
                              color: dayjs(formData.month_year).format("YYYY-MM") === usage.usageMonthYear ? "var(--tertiary-color) !important" : "var(--primary-color)",
                            }}
                            align="center"
                          >
                            {usage.usageCount?.toLocaleString()}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        <Box className={`${topUsersData.length > 0 ? "flex" : "hidden"} items-center justify-between py-3 pl-1 mt-auto`}>
          <PaginationBelowTableComponent 
            page={page} 
            onChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            handleRowsPerPageChange={handleRowsPerPageChange}
            totalPages={totalPages}
            pageInput={pageInput.toString()}
            handlePageInputKeyDown={handlePageInputKeyDown}
            handlePageInputChange={handlePageInputChange}
          />
        </Box>

        {/* Display Setting */}
        {
          displaySettingOpen && (
            <TopUsersDisplaySetting
              open={displaySettingOpen}
              handleClose={() => setDisplaySettingOpen(false)}
              dialogTitle={t("modal.monitor-setting")}
              onSave={handleDisplaySettingChange}
            />
          )
        }
      </div>
    </section>
  )
}

export default ChartTopUsers;