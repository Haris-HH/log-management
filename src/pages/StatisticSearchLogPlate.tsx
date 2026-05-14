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
import LoadingScreen from '../components/loading-screen/LoadingScreen';
import LocationUsage from "../components/location-usage/LocationUsage";
import TextBox from "../components/text-box/TextBox";

// Constants
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

// PDF
import {
  downloadStatisticSearchLogPlatePdf,
} from "../pdf/StatisticSearchLogPlatePdf";

// Types
import type { SearchLog } from "../types/common";
import type { SearchLogPlatePdfData } from "../types/pdf";

// i18n
import { useTranslation } from 'react-i18next';

// Icons
import ClearIcon from "../assets/icons/clear.png";
import ExportExcelIcon from "../assets/icons/export-excel.png";
import ExportPdfIcon from "../assets/icons/export-pdf.png";

// Utils
import { buildOptions } from "../utils/commonFunctions";
import { exportExcel } from "../utils/exportData";

// Hooks
import usePageTitle from "../hooks/usePageTitle";

// Store
import type { RootState } from "../store/store";

// API
import { getSearchLogUsage } from "../features/usage-search-data/api/UsageSearchDataApi";

interface FormData {
  name: string;
  pid_or_water_mark: string;
  plate_group: string;
  plate_number: string;
  province_id: string;
  agency_id: string;
  bh_id: string;
  bk_id: string;
  org_id: string;
  start_date_time: Date | null;
  end_date_time: Date | null;
}

const StatisticSearchLogPlate = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // i18n
  const { t, i18n } = useTranslation();

  // State
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [rows, setRows] = useState<SearchLog[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [selectedData, setSelectedData] = useState<{latitude: number, longitude: number}[]>([]);

  // Options
  const [agencyOptions, setAgencyOptions] = useState<{ label: string, value: string }[]>([]);
  const [bhOptions, setBhOptions] = useState<{ label: string, value: string }[]>([]);
  const [bkOptions, setBkOptions] = useState<{ label: string, value: string }[]>([]);
  const [orgOptions, setOrgOptions] = useState<{ label: string, value: string }[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<{ label: string, value: string }[]>([]);
  
  // Form Data
  const [formData, setFormData] = useState<FormData>(() => {
    if (location.state?.fromNavigate && location.state?.filters) {
      return {
        name: "",
        pid_or_water_mark: "",
        plate_group: "",
        plate_number: "",
        province_id: "0",
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
      plate_group: "",
      plate_number: "",
      province_id: "0",
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
  const { agency, bh, bk, org, province } = useSelector((state: RootState) => state.dropdown);

  usePageTitle(t("pages.statistic-search-log-plate"));

  useEffect(() => {
    setAgencyOptions(buildOptions(agency, t("dropdown.all-agency")));
    setBhOptions(buildOptions(bh, t("dropdown.all-bh")));
    setBkOptions(buildOptions(bk, t("dropdown.all-bk")));
    setOrgOptions(buildOptions(org, t("dropdown.all-org")));
    setProvinceOptions(buildOptions(province, "", false));
  }, [agency, bh, bk, t, i18n.language, i18n.isInitialized]);

  useEffect(() => {
    fetchData();
  }, [formData]);

  const fetchData = useCallback(
    async () => {
      setIsLoading(true);
      const res = await getSearchLogUsage();
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

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateTimeChange = (key: keyof typeof formData, date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: date,
    }));
  };

  const handleClear = () => {
    setFormData({
      name: "",
      pid_or_water_mark: "",
      plate_group: "",
      plate_number: "",
      province_id: "0",
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
    const pdfName = `${t('file-name.statistic-search-log-plate')}_${dayjs(formData.start_date_time).format(dateFormat)}_${dayjs(formData.end_date_time).format(dateFormat)}.pdf`;
    const pdfData: SearchLogPlatePdfData = {
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
      plate_group: formData.plate_group || "",
      plate_number: formData.plate_number || "",
      province_id: formData.province_id,
      province_name: provinceOptions.find(option => option.value === formData.province_id)?.label || "",
      start_date: dayjs(formData.start_date_time).format(i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY"),
      end_date: dayjs(formData.end_date_time).format(i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY"),
      logPlate: rows,
    }
    await downloadStatisticSearchLogPlatePdf(
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
      sheetName: `${t('file-name.statistic-search-log-plate')}`,
      fileName: `${t('file-name.statistic-search-log-plate')}_${dayjs(formData.start_date_time).format(dateFormat)}_${dayjs(formData.end_date_time).format(dateFormat)}.xlsx`,
      headers: [
        t('table.header.no'),
        t('table.header.first-name-last-name'),
        t('table.header.pid-full'),
        t('table.header.date'),
        t('table.header.ip-address'),
        t('table.header.coordinates'),
        t('table.header.user-agent'),
        t('table.header.agency'),
        t('table.header.bh'),
        t('table.header.bk'),
        t('table.header.org'),
      ],
      data: rows,
      mapRow: (data, index) => [
        (page - 1) * rowsPerPage + index + 1,
        data.pid,
        dayjs(data.date_time).format(i18n.language === "th" ? "DD/MM/BBBB HH:mm:ss" : "DD/MM/YYYY HH:mm:ss"),
        data.ip_address,
        `${data.latitude}, ${data.longitude}`,
        data.user_agent,
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

  const showLocationDialog = (event: React.MouseEvent<HTMLTableCellElement>, data: SearchLog) => {
    event.preventDefault();
    if (!data.latitude || !data.longitude) return;
    setSelectedData([{ latitude: data.latitude, longitude: data.longitude }, rows.filter((item) => item.latitude !== data.latitude && item.longitude !== data.longitude).map((item) => ({ latitude: item.latitude, longitude: item.longitude }))].flat());
    setLocationDialogOpen(true);
  }

  const handleLocationDialogClose = () => {
    setSelectedData([]);
    setLocationDialogOpen(false);
  }

  return (
    <section id='statistic-search-log-plate' className="flex flex-col h-full w-full p-2">
      { isLoading && <LoadingScreen /> }
      {/* Main Title */}
      <MainTitle title={t("pages.statistic-search-log-plate")} />
      <div className='p-4 bg-(--main-bg-color)/80 flex flex-1 flex-col gap-4 min-h-0 w-full rounded-lg border border-(--primary-color) overflow-y-auto'>
        {/* Search Filters */}
        <Box 
          className="flex flex-col border border-(--primary-color) rounded-[10px] p-4 gap-2 bg-(--secondary-color)"
          sx={{
            boxShadow: "0px 2px 8px rgba(var(--secondary-color-rgb),0.1)"
          }}
        >
          <Box className="grid grid-cols-5 gap-2">
            <TextBox
              sx={{ marginTop: "5px", fontSize: "15px" }}
              id="plate-group"
              label={t('component.plate-group')}
              placeholder={t('placeholder.plate-group')}
              labelFontSize="14px"
              value={formData.plate_group}
              onChange={(event) =>
                handleTextChange("plate_group", event.target.value)
              }
            />

            <TextBox
              sx={{ marginTop: "5px", fontSize: "15px" }}
              id="plate-number"
              label={t('component.plate-number')}
              placeholder={t('placeholder.plate-number')}
              labelFontSize="14px"
              value={formData.plate_number}
              onChange={(event) =>
                handleTextChange("plate_number", event.target.value)
              }
            />

            <AutoComplete 
              id="province-select"
              sx={{ marginTop: "5px" }}
              value={formData.province_id}
              onChange={(event, value) => handleDropdownChange(event, "province_id", value)}
              options={provinceOptions}
              label={t('component.plate-province')}
              placeholder={t('placeholder.plate-province')}
              labelFontSize="14px"
            />

            <TextBox
              sx={{ marginTop: "5px", fontSize: "15px" }}
              id="pid-or-watermark"
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
              id="name"
              label={t('component.first-name-last-name')}
              placeholder={t('placeholder.first-name-last-name')}
              labelFontSize="14px"
              value={formData.name}
              onChange={(event) =>
                handleTextChange("name", event.target.value)
              }
            />
          </Box>

          <Box className="grid grid-cols-[repeat(6,1fr)_180px] gap-2">
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
              label={t('component.start-date')}
              labelFontSize="14px"
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
              id="end-date-time"
              onChange={(value) =>
                handleDateTimeChange("end_date_time", value)
              }
              label={t('component.end-date')}
              labelFontSize="14px"
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
            sx={{
              backgroundColor: "var(--secondary-color)",
            }}
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
                    sx={{ color: "#FFFFFF", minWidth: "250px" }}
                  >
                    {t('table.header.first-name-last-name')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "250px" }}
                  >
                    {t('table.header.pid-full')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "200px" }}
                  >
                    {t('table.header.date')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "600px" }}
                  >
                    {t('table.header.detail')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "200px" }}
                  >
                    {t('table.header.ip-address')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "200px" }}
                  >
                    {t('table.header.coordinates')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "500px" }}
                  >
                    {t('table.header.user-agent')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "var(--tertiary-color)", minWidth: "120px" }}
                  >
                    {t('table.header.agency')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "var(--tertiary-color)", minWidth: "120px" }}
                  >
                    {t('table.header.bh')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "var(--tertiary-color)", minWidth: "120px" }}
                  >
                    {t('table.header.bk')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "var(--tertiary-color)", minWidth: "120px" }}
                  >
                    {t('table.header.org')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "var(--secondary-color)" }}>
                {rows.map((data, index) => (
                  <TableRow
                    key={index}
                  >
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        textAlign: "center",
                      }}
                    >
                      {((page - 1) * rowsPerPage) + index + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {`${data.prefix_id || ""}${data.name}`}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        textAlign: "center",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {data.pid}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        textAlign: "center",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {dayjs(data.date_time).format("DD/MM/BBBB HH:mm:ss")}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        textAlign: "center",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {data.detail}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        textAlign: "center",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {data.ip_address}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: data.latitude && data.longitude ? "var(--hyper-text-color)" : "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        py: 1,
                        px: 1,
                        textDecoration: "underline",
                        cursor: data.latitude && data.longitude ? "pointer" : "default",
                      }}
                      onClick={(event) => showLocationDialog(event, data)}
                    >
                      <a>{`${data.latitude}, ${data.longitude}`}</a>
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {data.user_agent}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      }}
                    >
                      {data.agency_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      }}
                    >
                      {data.bh_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      }}
                    >
                      {data.bk_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
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

          {/* Location Usage Dialog */}
          {
            locationDialogOpen && selectedData && (
              <LocationUsage
                open={locationDialogOpen}
                handleClose={handleLocationDialogClose}
                dialogTitle={t('modal.usage-coordinates-search-plate')}
                data={selectedData}
              />
            )
          }
        </Box>
      </div>
    </section>
  )
}

export default StatisticSearchLogPlate;