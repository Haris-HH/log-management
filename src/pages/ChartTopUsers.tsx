import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { useSelector } from 'react-redux';

// Store
import type { RootState } from "../store/store";

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
import LoadingScreen from '../components/loading-screen/LoadingScreen';

// Hooks
import usePageTitle from '../hooks/usePageTitle';
import { usePermission } from '../hooks/usePermission';

// Types
import type { TopUsersResponse } from "../types/response";
import type { TopUsers } from "../types/common";

// API
import { getTopUsersChart } from "../features/usage-chart/api/UsageChartApi";
import { getUserApi } from "../features/users/api/UsersApi";

// i18n
import { useTranslation } from 'react-i18next';

// Constants
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

// Utils
import { formatPhone, formatThaiID } from "../utils/commonFunctions";

interface FormData {
  month_year: Date | null;
}

const ChartTopUsers = () => {
  // i18n
  const { t, i18n } = useTranslation();
  
  usePageTitle(t("pages.chart-top-users"));

  /*
    The display setting is the only control on this console that writes anything
    back, so it is the only one "active" (read-only) has to take away.
  */
  const { canEdit } = usePermission("chart-top-users");

  // State
  const [policeState, setPoliceState] = useState<"internal" | "external">("internal");
  const [displaySettingOpen, setDisplaySettingOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [topUsersData, setTopUsersData] = useState<TopUsersResponse | null>(null);
  const [topInternalValue, setTopInternalValue] = useState<number>(5000);
  const [topExternalValue, setTopExternalValue] = useState<number>(3000);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");
  const [rowsPerPage, setRowsPerPage] = useState(
    ROWS_PER_PAGE_OPTIONS[0],
  );
  const [rowsPerPageOptions] = useState(ROWS_PER_PAGE_OPTIONS);

  // Constants
  const MONTH_RANGE = 3;

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    month_year: dayjs().toDate(),
  });

  // Slice
  const { title, agency } = useSelector((state: RootState) => state.dropdown);

  useEffect(() => {
    if (!formData.month_year) return;

    fetchData();
  }, [
    formData.month_year, 
    policeState,
    topInternalValue,
    topExternalValue,
    page,
    rowsPerPage,
  ]);

  const getFilters = useCallback((): Record<string, string> => {
    const filters: Record<string, string> = {
      start_month: dayjs(formData.month_year).format("YYYY-MM"),
      ou_code: policeState === "internal" ? "00" : "05",
      event_type: "login",
      count_month: "3",
      min_count: policeState === "internal"
        ? topInternalValue.toString()
        : topExternalValue.toString(),
      page: page.toString(),
      limit: rowsPerPage.toString(),
    };

    return filters;
  }, [
    formData.month_year, 
    policeState,
    topInternalValue,
    topExternalValue,
    page,
    rowsPerPage,
  ]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await getTopUsersChart(getFilters());
      const topUsers = res.data ?? [];
      setTotalPages(res.pagination?.maxPage ?? 1);

      const userIds = [...new Set(topUsers.map((item) => item.user_id))];

      let userMap = new Map();

      if (userIds.length > 0) {
        const usersRes = await getUserApi({
          filter: `user_id=${userIds.join("|")}`,
        });

        userMap = new Map(
          usersRes.data?.map((user) => [user.user_id, user]) ?? []
        );
      }

      const updatedData: TopUsers[] = topUsers.map((user) => {
        const userInfo = userMap.get(user.user_id);

        const titleName = title.find(
          (titleItem) => titleItem.id === userInfo?.title_id
        );

        const agencyName = agency.find(
          (agencyItem) => agencyItem.ou_code === userInfo?.ou_code
        );

        return {
          ...user,
          title_id: userInfo?.title_id,
          title_name:
            i18n.language === "th"
              ? titleName?.title_abbr_th ?? ""
              : titleName?.title_abbr_en ?? "",
          firstname: userInfo?.firstname ?? "",
          lastname: userInfo?.lastname ?? "",
          idcard: userInfo?.idcard ?? "-",
          phone: userInfo?.phone ?? "-",
          ou_name:
            i18n.language === "th"
              ? agencyName?.ou_abbr_th ?? "-"
              : agencyName?.ou_abbr_en ?? "-",
        };
      });

      setTopUsersData({
        ...res,
        data: updatedData,
      });
    } catch (error) {
      setTopUsersData(null);
    } finally {
      setIsLoading(false);
    }
  }, [getFilters, title, agency, i18n.language]);

  const handleStateChange = (value: "internal" | "external") => {
    setPoliceState(value);
  };

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    const limit = parseInt(event.target.value)
    setRowsPerPage(limit);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    event.preventDefault();
    setPage(value);
    setPageInput(value.toString());
  };

  const handlePageInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const cleaned = event.target.value.replace(/\D/g, "");

    setPageInput(cleaned);
  };

  const handlePageInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const nextPage = Number(pageInput);

    if (!nextPage) {
      setPageInput(page.toString());
      return;
    }

    const validPage = Math.min(Math.max(nextPage, 1), totalPages);

    setPage(validPage);
    setPageInput(validPage.toString());
  };

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

  const monthKeys = Array.from({ length: MONTH_RANGE }, (_, index) =>
    dayjs(formData.month_year)
      .subtract(MONTH_RANGE - index - 1, "month")
      .format("YYYY-MM")
  );

  return (
    <section id='chart-top-users' className="flex flex-col h-full w-full p-2">
      { isLoading && <LoadingScreen /> }
      {/* Main Title */}
      <MainTitle title={t("pages.chart-top-users")} />
      <Box className='p-4 flex flex-col gap-2 bg-(--theme-bg-body) min-h-0 h-full w-full rounded-lg border border-(--theme-accent) overflow-y-auto'>
        {/* Chart */}
        <Box 
          className="w-full bg-(--theme-border-input) p-4 flex flex-col gap-4"
          sx={{
            boxShadow: "-2px 3px 2px rgba(0,0,0,0.1)"
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
              {canEdit && (
                <Box className="-mt-1">
                  <IconButton
                    sx={{
                      backgroundColor: displaySettingOpen ? "var(--theme-accent)" : "var(--theme-border-input)",
                      border: "1px solid var(--theme-accent)",
                      "&:hover": {
                        backgroundColor: "rgba(var(--theme-accent-rgb),0.2)",
                      },
                      borderRadius: "5px",
                      padding: "5px",
                    }}
                    onClick={() => setDisplaySettingOpen(true)}
                  >
                    <SettingsIcon sx={{ color: displaySettingOpen ? "var(--theme-border-input)" : "var(--theme-accent)" }} />
                  </IconButton>
                </Box>
              )}
            </Box>
            <Box className='flex justify-between mt-5'>
              <Box className='flex gap-3 items-center'>
                <Button
                  variant="contained"
                  sx={{
                    width: 180,
                    height: 40,
                    backgroundColor: policeState === "internal" ? "var(--theme-accent)" : "var(--theme-border-input)",
                    color: policeState === "internal" ? "var(--theme-border-input)" : "var(--theme-accent)",
                    border: policeState === "internal" ? "none" : "1px solid var(--theme-accent)",
                    "&:hover": {
                      backgroundColor: policeState === "internal" ? "rgba(var(--theme-accent-rgb),0.8)" : "rgba(var(--theme-accent-rgb),0.2)",
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
                    width: 180,
                    height: 40,
                    backgroundColor: policeState === "external" ? "var(--theme-accent)" : "var(--theme-border-input)",
                    color: policeState === "external" ? "var(--theme-border-input)" : "var(--theme-accent)",
                    border: policeState === "external" ? "none" : "1px solid var(--theme-accent)",
                    "&:hover": {
                      backgroundColor: policeState === "external" ? "rgba(var(--theme-accent-rgb),0.8)" : "rgba(var(--theme-accent-rgb),0.2)",
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
                <Typography className="text-(--theme-accent)" sx={{ fontSize: "14px" }}>
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
                mt: 3,
                flex: 1,
                minHeight: 0,
                overflow: "auto",
              }}
            >
              <Table
                size="small"
                sx={{ minWidth: 650, backgroundColor: "var(--theme-accent-soft)" }}
                stickyHeader
              >
                {/* ================= HEADER ================= */}
                <TableHead>
                  <TableRow
                    sx={{
                      height: 40,
                      "& th": {
                        padding: "6px 8px",
                      },
                      "& .MuiTableCell-root": {
                        backgroundColor: "var(--theme-accent)",
                        color: "var(--theme-border-input)",
                        border: "1px solid rgba(var(--theme-accent-soft-rgb),0.5)",
                        fontWeight: 700
                      },
                    }}
                  >
                    <TableCell align="center" sx={{ width: "3%" }}>
                      {t("table.header.order")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%" }}>
                      {t("table.header.pid")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%" }}>
                      {t("table.header.name")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%" }}>
                      {t("table.header.phone")}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%" }}>
                      {t("table.header.agency")}
                    </TableCell>

                    {monthKeys.map((month) => (
                      <TableCell key={month} align="center" sx={{ width: "8%" }}>
                        {dayjs(month)
                          .locale(i18n.language)
                          .format(i18n.language === "th" ? "MMMM BBBB" : "MMMM YYYY")}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                {/* ================= BODY ================= */}
                <TableBody
                  sx={{
                    backgroundColor: "var(--theme-border-input)",
                  }}
                >
                  {topUsersData?.data?.length ? (
                    topUsersData?.data?.map((item, index) => {
                    
                      return (
                        <TableRow
                          key={index}
                          sx={{
                            "& td": {
                              border: "1px solid rgba(var(--theme-accent-rgb),0.5)",
                              padding: "6px 8px",
                              color: "var(--theme-accent)",
                              whiteSpace: "nowrap",
                            },
                          }}
                        >
                          <TableCell align="center">
                            {item.rank}
                          </TableCell>

                          <TableCell align="center">
                            {formatThaiID(item.idcard) ?? "-"}
                          </TableCell>

                          <TableCell align="center">
                            {`${item.title ? item.title + " " : ""}${item.firstname} ${item.lastname}`}
                          </TableCell>

                          <TableCell align="center">
                            {formatPhone(item.phone) ?? "-"}
                          </TableCell>

                          <TableCell align="center">
                            {item.ou_name}
                          </TableCell>

                          {monthKeys.map((month) => {
                            const count = item.months?.[month] ?? 0;

                            const isCurrentMonth =
                              month === dayjs(formData.month_year).format("YYYY-MM");

                            return (
                              <TableCell
                                key={`${item.user_id}-${month}`}
                                align="center"
                                sx={{
                                  backgroundColor: isCurrentMonth
                                    ? "rgba(var(--theme-accent-rgb),0.5) !important"
                                    : "rgba(var(--theme-accent-rgb),0.2) !important",
                                  fontWeight: isCurrentMonth ? "700 !important" : "400 !important",
                                  color: isCurrentMonth
                                    ? "var(--theme-accent-soft) !important"
                                    : "var(--theme-accent) !important",
                                }}
                              >
                                {count.toLocaleString()}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow
                      sx={{
                        backgroundColor: "var(--theme-border-input)",
                      }}
                    >
                      <TableCell 
                        align="center" 
                        colSpan={5 + monthKeys.length}
                        sx={{ color: "var(--theme-accent-soft)" }}
                      >
                        {t("text.no-data")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        <Box className={`${(topUsersData?.data && topUsersData?.data?.length > 0) ? "flex" : "hidden"} items-center justify-between py-3 pl-1 mt-auto`}>
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
      </Box>
    </section>
  )
}

export default ChartTopUsers;