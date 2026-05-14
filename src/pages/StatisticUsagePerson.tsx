import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { SelectChangeEvent } from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";

// Components
import MainTitle from '../components/main-title/MainTitle';
import AutoComplete from "../components/auto-complete/AutoComplete";
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";
import PaginationComponent from "../components/pagination/Pagination";
import DetailsDialog from "../components/details-dialog/DetailsDialog";
import LoadingScreen from '../components/loading-screen/LoadingScreen';
import TextBox from "../components/text-box/TextBox";

// Constants
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

// PDF
import {
  downloadStatisticUsagePersonPdf,
} from "../pdf/StatisticUsagePersonPdf";

// Types
import type { PersonUsage } from "../types/common";
import type { PersonUsagePdfData } from "../types/pdf";

// i18n
import { useTranslation } from 'react-i18next';

// Icons
import ClearIcon from "../assets/icons/clear.png";
import ExportExcelIcon from "../assets/icons/export-excel.png";
import ExportPdfIcon from "../assets/icons/export-pdf.png";
import InformationIcon from "../assets/icons/information.png";

// Utils
import { buildOptions } from "../utils/commonFunctions";
import { exportExcel } from "../utils/exportData";

// Hooks
import usePageTitle from "../hooks/usePageTitle";

// Store
import type { RootState } from "../store/store";

// API
import { getPersonUsage } from "../features/usage-data/api/UsageDataApi";

interface FormData {
  name: string;
  pid_or_water_mark: string;
  agency_id: string;
  bh_id: string;
  bk_id: string;
  org_id: string;
  start_date_time: Date | null;
  end_date_time: Date | null;
}

const StatisticUsagePerson = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // i18n
  const { t, i18n } = useTranslation();

  // State
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [rows, setRows] = useState<PersonUsage[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [selectedData, setSelectedData] = useState<PersonUsage | null>(null);

  // Options
  const [agencyOptions, setAgencyOptions] = useState<{ label: string, value: string }[]>([]);
  const [bhOptions, setBhOptions] = useState<{ label: string, value: string }[]>([]);
  const [bkOptions, setBkOptions] = useState<{ label: string, value: string }[]>([]);
  const [orgOptions, setOrgOptions] = useState<{ label: string, value: string }[]>([]);

  // Form Data
  const [formData, setFormData] = useState<FormData>(() => {
    if (location.state?.fromNavigate && location.state?.filters) {
      return {
        name: "",
        pid_or_water_mark: "",
        agency_id: location.state.filters.agency_id,
        bh_id: location.state.filters.bh_id,
        bk_id: location.state.filters.bk_id,
        org_id: location.state.filters.org_id,
        start_date_time: location.state.filters.start_date,
        end_date_time: location.state.filters.end_date,
      };
    }

    return {
      name: "",
      pid_or_water_mark: "",
      agency_id: "0",
      bh_id: "0",
      bk_id: "0",
      org_id: "0",
      start_date_time: dayjs().toDate(),
      end_date_time: dayjs().toDate(),
    };
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    ROWS_PER_PAGE_OPTIONS[0],
  );
  const [rowsPerPageOptions] = useState(
    ROWS_PER_PAGE_OPTIONS
  );

  // Slice
  const { agency, bh, bk, org } = useSelector((state: RootState) => state.dropdown);

  usePageTitle(t("pages.statistic-usage-person"));

  useEffect(() => {
    setAgencyOptions(buildOptions(agency, t("dropdown.all-agency")));
    setBhOptions(buildOptions(bh, t("dropdown.all-bh")));
    setBkOptions(buildOptions(bk, t("dropdown.all-bk")));
    setOrgOptions(buildOptions(org, t("dropdown.all-org")));
  }, [agency, bh, bk, t, i18n.language, i18n.isInitialized]);

  useEffect(() => {
    fetchData();
  }, [formData]);

  const fetchData = useCallback(
    async () => {
      setIsLoading(true);
      const res = await getPersonUsage();
      setRows(res.data);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    },
    []
  );

  const handleDropdownChange = (
    event: React.SyntheticEvent,
    key: keyof typeof formData,
    value: { value: any ,label: string } | null,
  ) => {
    event.preventDefault();
    setFormData((prev) => ({ ...prev, [key]: value?.value ?? "0" }));
  };

  const handleDateTimeChange = (key: keyof typeof formData, date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: date,
    }));
  };

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFormData({
      name: "",
      pid_or_water_mark: "",
      agency_id: "0",
      bh_id: "0",
      bk_id: "0",
      org_id: "0",
      start_date_time: dayjs().toDate(),
      end_date_time: dayjs().toDate(),
    });
  }

  const handleExportPdf = async () => {
    setIsLoading(true);
    const dateFormat = i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD";
    const pdfName = `${t('file-name.statistic-usage-person')}_${dayjs(formData.start_date_time).format(dateFormat)}_${dayjs(formData.end_date_time).format(dateFormat)}.pdf`;
    const pdfData: PersonUsagePdfData = {
      pid_or_water_mark: formData.pid_or_water_mark || "-",
      name: formData.name || "-",
      agency_id: formData.agency_id,
      agency_name: formData.agency_id === "0" ? t('text.all') : agencyOptions.find(option => option.value === formData.agency_id)?.label || "-",
      bh_id: formData.bh_id,
      bh_name: formData.bh_id === "0" ? t('text.all') : bhOptions.find(option => option.value === formData.bh_id)?.label || "-",
      bk_id: formData.bk_id,
      bk_name: formData.bk_id === "0" ? t('text.all') : bkOptions.find(option => option.value === formData.bk_id)?.label || "-",
      org_id: formData.org_id,
      org_name: formData.org_id === "0" ? t('text.all') : orgOptions.find(option => option.value === formData.org_id)?.label || "-",
      start_date: dayjs(formData.start_date_time).format(i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY"),
      end_date: dayjs(formData.end_date_time).format(i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY"),
      personUsage: rows,
    }
    await downloadStatisticUsagePersonPdf(
      pdfData,
      pdfName,
      t,
      i18n
    );
    setTimeout(() => {
      setIsLoading(false);
    }, 500)
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    const dateFormat = i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD";
    await exportExcel({
      sheetName: `${t('file-name.statistic-usage-person')}`,
      fileName: `${t('file-name.statistic-usage-person')}_${dayjs(formData.start_date_time).format(dateFormat)}_${dayjs(formData.end_date_time).format(dateFormat)}.xlsx`,
      headers: [
        t('table.header.no'),
        t('table.header.count'),
        t('table.header.first-name-last-name'),
        t('table.header.pid-full'),
        t('table.header.agency'),
        t('table.header.bh'),
        t('table.header.bk'),
        t('table.header.org'),
      ],
      data: rows,
      mapRow: (data, index) => [
        (page - 1) * rowsPerPage + index + 1,
        Number(data.usage_count),
        `${data.prefix_id || ""}${data.name}`,
        data.pid,
        data.agency_name,
        data.bh_name,
        data.bk_name,
        data.org_name,
      ],
      columnStyles: {
        2: { alignment: { horizontal: "center" } },
      },
    });
    setTimeout(() => {
      setIsLoading(false);
    }, 500)
  };

  const handlePageChange = async (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    event.preventDefault();
    setPage(value);
  };

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    const limit = parseInt(event.target.value);
    setRowsPerPage(limit);
  };

  const showDetailDialog = (data: PersonUsage) => {
    setSelectedData(data);
    setDetailDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setSelectedData(null);
    setDetailDialogOpen(false);
  }

  const navigateToLogUsage = async () => {
    navigate("/statistic-usage-log", {
      state: {
        fromNavigate: true,
        filters: {
          pid: selectedData?.pid ?? "",
          name: selectedData?.name ?? "",
          prefix_id: selectedData?.prefix_id ?? "",
          agency_id: selectedData?.agency_id ?? 0,
          bh_id: selectedData?.bh_id ?? 0,
          bk_id: selectedData?.bk_id ?? 0,
          org_id: selectedData?.org_id ?? 0,
          start_date: formData.start_date_time,
          end_date: formData.end_date_time,
        }
      }
    });
    setSelectedData(null);
    setDetailDialogOpen(false);
  }

  return (
    <section id='statistic-usage-person' className="flex flex-col h-full w-full p-2">
      { isLoading && <LoadingScreen /> }
      {/* Main Title */}
      <MainTitle title={t("pages.statistic-usage-person")} />
      <div className='p-4 bg-(--main-bg-color)/80 flex flex-1 flex-col gap-4 min-h-0 w-full rounded-lg border border-(--primary-color) overflow-y-auto'>
        {/* Search Filters */}
        <Box 
          className="grid grid-cols-[repeat(8,minmax(0,1fr))_180px] border border-(--primary-color) rounded-[10px] p-4 gap-2 bg-(--secondary-color)"
          sx={{
            boxShadow: "0px 2px 8px rgba(var(--secondary-color-rgb),0.1)"
          }}
        >
          <TextBox
            sx={{ marginTop: "5px", fontSize: "15px" }}
            id="pid-and-water-mark"
            label={t('component.pid-and-water-mark')}
            placeholder={t('placeholder.pid-and-water-mark')}
            labelFontSize="14px"
            value={formData.pid_or_water_mark}
            onChange={(event) =>
              handleTextChange("pid_or_water_mark", event.target.value)
            }
          />

          <TextBox
            sx={{ marginTop: "5px", fontSize: "15px" }}
            id="full-name"
            label={t('component.first-name-last-name')}
            placeholder={t('placeholder.first-name-last-name')}
            labelFontSize="14px"
            value={formData.name}
            onChange={(event) =>
              handleTextChange("name", event.target.value)
            }
          />

          <DatePickerBuddhist
            value={formData.start_date_time}
            sx={{
              marginTop: "5px",
              borderRadius: "5px",
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
            label={t('component.start-date')}
            labelFontSize="14px"
          />

          <DatePickerBuddhist
            value={formData.end_date_time}
            sx={{
              marginTop: "5px",
              borderRadius: "5px",
              "& .MuiTextField-root": {
                height: "fit-content",
              },
              "& .MuiOutlinedInput-input": {
                fontSize: 14,
              },
            }}
            className="w-full"
            id="end-date-time"
            onChange={(value) =>
              handleDateTimeChange("end_date_time", value)
            }
            label={t('component.end-date')}
            labelFontSize="14px"
          />

          <AutoComplete 
            id="agency-select"
            sx={{ marginTop: "5px"}}
            value={formData.agency_id}
            onChange={(event, value) => handleDropdownChange(event, "agency_id", value)}
            options={agencyOptions}
            label={t('component.agency')}
            placeholder={t('placeholder.agency')}
            labelFontSize="14px"
          />

          <AutoComplete 
            id="bh-select"
            sx={{ marginTop: "5px" }}
            value={formData.bh_id}
            onChange={(event, value) => handleDropdownChange(event, "bh_id", value)}
            options={bhOptions}
            label={t('component.bh')}
            placeholder={t('placeholder.bh')}
            labelFontSize="14px"
            disabled={formData.agency_id === "0"}
          />

          <AutoComplete 
            id="bk-select"
            sx={{ marginTop: "5px" }}
            value={formData.bk_id}
            onChange={(event, value) => handleDropdownChange(event, "bk_id", value)}
            options={bkOptions}
            label={t('component.bk')}
            placeholder={t('placeholder.bk')}
            labelFontSize="14px"
            disabled={formData.agency_id === "0" || formData.bh_id === "0"}
          />

          <AutoComplete 
            id="org-select"
            sx={{ marginTop: "5px" }}
            value={formData.org_id}
            onChange={(event, value) => handleDropdownChange(event, "org_id", value)}
            options={orgOptions}
            label={t('component.org')}
            placeholder={t('placeholder.org')}
            labelFontSize="14px"
            disabled={formData.agency_id === "0" || formData.bh_id === "0" || formData.bk_id === "0"}
          />

          <Box className="flex gap-2 items-end">
            <Button 
              variant="contained" 
              startIcon={<img src={ClearIcon} alt="Clear" className="h-6 w-6" />} 
              sx={{ 
                backgroundColor: "var(--primary-color)", 
                fontSize: "14px", 
                width: t('button.clear-width'),
                height: "40px",
                ":hover": {
                  backgroundColor: "rgba(var(--primary-color-rgb), 0.5)",
                },
                textTransform: "capitalize",
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
                "&:hover": {
                  backgroundColor: "rgba(var(--primary-color-rgb), 0.5)",
                },
              }}
              onClick={handleExportPdf}
            >
              <img src={ExportPdfIcon} alt="Export PDF" className="h-6 w-6" />
            </IconButton>
            <IconButton 
              sx={{ 
                border: "1px solid var(--primary-color)", 
                width: "40px", 
                height: "40px", 
                borderRadius: "5px",
                "&:hover": {
                  backgroundColor: "rgba(var(--primary-color-rgb), 0.5)",
                },
              }}
              onClick={handleExportExcel}
            >
              <img src={ExportExcelIcon} alt="Export CSV" className="h-6 w-6" />
            </IconButton>
          </Box>
        </Box>

        {/* Table */}
        <PaginationComponent
          page={page}
          onChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          handleRowsPerPageChange={handleRowsPerPageChange}
          totalPages={totalPages}
          totalItems={totalItems}
          totalUsage={totalUsage}
        />
        <Box sx={{ width: '100%' }}>
          <TableContainer
            component={Paper}
          >
            <Table
              sx={{ minWidth: 650, backgroundColor: "var(--secondary-color)", border: "1px solid var(--primary-color)"}}
              stickyHeader
            >
              <TableHead
                sx={{
                  "& .MuiTableCell-head": {
                    color: "var(--tertiary-color)",
                    backgroundColor: "var(--primary-color)",
                  },
                }}
              >
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{ color: "var(--tertiary-color)", width: "2%" }}
                  >
                    {t('table.header.no')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "var(--tertiary-color)", width: "10%" }}
                  >
                    {t('table.header.count')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", width: "10%" }}
                  >
                    {t('table.header.first-name-last-name')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", width: "10%" }}
                  >
                    {t('table.header.pid-full')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "var(--tertiary-color)", width: "10%" }}
                  >
                    {t('table.header.agency')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "var(--tertiary-color)", width: "10%" }}
                  >
                    {t('table.header.bh')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "var(--tertiary-color)", width: "10%" }}
                  >
                    {t('table.header.bk')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "var(--tertiary-color)", width: "10%" }}
                  >
                    {t('table.header.org')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "var(--secondary-color)" }}>
                {rows.map((data, index) => (
                  <TableRow
                    key={index}
                    onClick={() => {
                      showDetailDialog(data);
                    }}
                  >
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "rgba(var(--primary-color-rgb), 0.3)" : "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        textAlign: "center",
                      }}
                    >
                      {((page - 1) * rowsPerPage) + index + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "rgba(var(--primary-color-rgb), 0.3)" : "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        textAlign: "center",
                      }}
                    >
                      {data.usage_count?.toLocaleString()}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "rgba(var(--primary-color-rgb), 0.3)" : "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      }}
                    >
                      {`${data.prefix_id || ""}${data.name}`}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "rgba(var(--primary-color-rgb), 0.3)" : "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      }}
                    >
                      {data.pid}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "rgba(var(--primary-color-rgb), 0.3)" : "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      }}
                    >
                      {data.agency_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "rgba(var(--primary-color-rgb), 0.3)" : "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      }}
                    >
                      {data.bh_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "rgba(var(--primary-color-rgb), 0.3)" : "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      }}
                    >
                      {data.bk_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "rgba(var(--primary-color-rgb), 0.3)" : "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      }}
                    >
                      {data.org_name}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Detail Dialog */}
          {
            detailDialogOpen && (
              <DetailsDialog
                open={detailDialogOpen}
                handleClose={handleDetailsDialogClose}
                dialogTitle={t('pages.statistic-usage-person')}
              >
                <Box className="flex flex-col gap-3 items-center px-4 pt-4">
                  <img src={InformationIcon} alt="Information" className="h-15 w-15" />
                  <Box className="w-full text-(--primary-color) grid grid-cols-[110px_10px_1fr]">
                    <p>{`${t('text.count')} (${t('text.time')})`}</p>
                    <p>:</p>
                    <p>{selectedData?.usage_count?.toLocaleString() ?? 0}</p>

                    <p>{t('text.first-name-last-name')}</p>
                    <p>:</p>
                    <p>{`${selectedData?.prefix_id || ""}${selectedData?.name}`}</p>

                    <p>{t('text.agency')}</p>
                    <p>:</p>
                    <p>{selectedData?.agency_name}</p>

                    <p>{t('text.bh')}</p>
                    <p>:</p>
                    <p>{selectedData?.bh_name}</p>

                    <p>{t('text.bk')}</p>
                    <p>:</p>
                    <p>{selectedData?.bk_name}</p>

                    <p>{t('text.org')}</p>
                    <p>:</p>
                    <p>{selectedData?.org_name}</p>
                  </Box>
                  <Button
                    variant="contained"
                    sx={{ 
                      backgroundColor: "var(--primary-color)", 
                      fontSize: "13px", 
                      width: "120px", 
                      py: 0.35, 
                      borderRadius: "5px",
                      mt: 1,
                    }}
                    onClick={navigateToLogUsage}
                  >
                    {t('button.detail')}
                  </Button>
                </Box>
              </DetailsDialog>
            )
          }
        </Box>
      </div>
    </section>
  )
}

export default StatisticUsagePerson;