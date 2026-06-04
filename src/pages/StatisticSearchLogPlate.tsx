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
import type { LprSearchLog } from "../types/common";
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
import { PopupMessage, PopupMessageWithCancel } from '../utils/popupMessage';

// Hooks
import usePageTitle from "../hooks/usePageTitle";

// Store
import type { RootState } from "../store/store";

// API
import { searchLprSearchLogs } from "../features/usage-search-data/api/UsageSearchDataApi";
import { getUserApi } from '../features/users/api/UsersApi';

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
  const [rows, setRows] = useState<LprSearchLog[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [selectedData, setSelectedData] = useState<{latitude: number, longitude: number}[]>([]);

  // Options
  const [agencyOptions, setAgencyOptions] = useState<{ label: string, value: string }[]>([]);
  const [bhOptions, setBhOptions] = useState<{ label: string, value: string }[]>([]);
  const [bkOptions, setBkOptions] = useState<{ label: string, value: string }[]>([]);
  const [orgOptions, setOrgOptions] = useState<{ label: string, value: string }[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<{ label: string, value: string }[]>([]);
  
  // Constants
  const CHUNK_SIZE = 500;
  const REQUEST_LIMIT = 5000;

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
  const { agency, bh, bk, org, province, title } = useSelector((state: RootState) => state.dropdown);

  usePageTitle(t("pages.statistic-search-log-plate"));

  useEffect(() => {
    const langKeyAgency = i18n.language === "th" ? "ou_abbr_th" : "ou_abbr_en";
    const langKeyBh = i18n.language === "th" ? "bh_abbr_th" : "bh_abbr_en";
    const langKeyBk = i18n.language === "th" ? "bk_abbr_th" : "bk_abbr_en";
    const langKeyOrg = i18n.language === "th" ? "org_abbr_th" : "org_abbr_en";

    setAgencyOptions(
      buildOptions(agency, t("dropdown.all-agency"), langKeyAgency, "ou_code")
    );

    const filteredBh =
      formData.agency_id !== "0"
        ? bh.filter((item) => item.ou_code === formData.agency_id)
        : bh;

    setBhOptions(
      buildOptions(filteredBh, t("dropdown.all-bh"), langKeyBh, "bh_code")
    );

    const filteredBk =
      formData.bh_id !== "0"
        ? bk.filter((item) => item.bh_code === formData.bh_id)
        : bk;

    setBkOptions(
      buildOptions(filteredBk, t("dropdown.all-bk"), langKeyBk, "bk_code")
    );

    const filteredOrg =
      formData.bk_id !== "0"
        ? org.filter((item) => item.bk_code === formData.bk_id)
        : org;

    setOrgOptions(
      buildOptions(filteredOrg, t("dropdown.all-org"), langKeyOrg, "org_code")
    );

    setProvinceOptions(
      buildOptions(
        province, "", 
        i18n.language === "th" ? "name_th" : "name_en", 
        "province_code",
        false)
      );
  }, [
    agency,
    bh,
    bk,
    org,
    province,
    formData.agency_id,
    formData.bh_id,
    t,
    i18n.language,
  ]);

  useEffect(() => {
    fetchData(formData);
  }, [formData, agency, bh, bk, org]);

  const mapLprSearchLogRows = useCallback(
    async (data: LprSearchLog[]): Promise<LprSearchLog[]> => {
      const rows = await Promise.all(
        data.map(async (item) => {
          const userRes = await getUserApi({
          filter: `user_id=${item.user_id}`,
        });

        const user = userRes.data[0];
        const agencyData = agency.find((a) => a.ou_code === item.ou_code);
        const bhData = bh.find((b) => b.bh_code === item.bh_code);
        const bkData = bk.find((k) => k.bk_code === item.bk_code);
        const orgData = org.find((o) => o.org_code === item.org_code);
        const titleData = title.find((t) => t.id === user?.title);
        return {
          ...item,
          idcard: userRes.data[0]?.idcard ?? "-",
          title:  titleData 
            ? i18n.language === "th"
              ? titleData.title_abbr_th
              : titleData.title_abbr_en
            : "",
          firstname: userRes.data[0]?.firstname ?? "-",
          lastname: userRes.data[0]?.lastname ?? "-",
          ou_name: agencyData
            ? i18n.language === "th"
              ? agencyData.ou_abbr_th
              : agencyData.ou_abbr_en
            : "-",
          bh_name: bhData
            ? i18n.language === "th"
              ? bhData.bh_name_th
              : bhData.bh_name_en
            : "-",
          bk_name: bkData
            ? i18n.language === "th"
              ? bkData.bk_abbr_th
              : bkData.bk_abbr_en
            : "-",
          org_name: orgData
            ? i18n.language === "th"
              ? orgData.org_abbr_th
              : orgData.org_abbr_en
            : "-",
        };
        })
      );

      return rows;
    },
    [agency, bh, bk, org, i18n.language]
  );

  const fetchData = useCallback(
    async (filterData: FormData = formData) => {
      try {
        setIsLoading(true);

        const res = await searchLprSearchLogs(
          {},
          {
            limit: rowsPerPage.toString(),
            page: page.toString(),
            ...getFilters(filterData),
          }
        );
        const updatedRows = await mapLprSearchLogRows(res.data);

        const totalUsage = res.data.reduce(
          (sum, item) => sum + (item.total ?? 0),
          0
        );

        setRows(updatedRows);
        setTotalItems(res.pagination.countAll);
        setTotalData(res.pagination.countAll);
        setTotalPages(res.pagination.maxPage);
        setTotalUsage(totalUsage);
      } 
      catch (error) {
        await PopupMessage(t("popup.fetch-error"), "", "error");
        setRows([]);
        setTotalItems(0);
        setTotalData(0);
        setTotalPages(0);
        setTotalUsage(0);
      } 
      finally {
        setIsLoading(false);
      }
    }, 
    [agency, bh, bk, t, i18n.language, i18n.isInitialized]
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

  const handleDateTimeChange = (
    key: "start_date_time" | "end_date_time",
    value: Date | null
  ) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [key]: value,
      };

      if (!value) return newData;

      if (
        key === "start_date_time" &&
        newData.end_date_time &&
        dayjs(value).isAfter(dayjs(newData.end_date_time))
      ) {
        newData.end_date_time = value;
      }

      if (
        key === "end_date_time" &&
        newData.start_date_time &&
        dayjs(value).isBefore(dayjs(newData.start_date_time))
      ) {
        newData.start_date_time = value;
      }

      return newData;
    });
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
    try {
      let exportRows = rows;
      
      if (totalData > CHUNK_SIZE) {
        const isConfirmed = await PopupMessageWithCancel(
          t("popup.export-chunk-confirm-title"),
          t("popup.export-chunk-confirm-message", {
            totalData: totalData.toLocaleString(),
          }),
          t("button.confirm"),
          t("button.cancel"),
          "warning"
        );

        if (!isConfirmed) return;
      }
      setIsLoading(true);

      const res = await searchLprSearchLogs(
        {},
        {
          groupBy: "org_code",
          limit: REQUEST_LIMIT.toString(),
          page: "1",
          orderBy: "org_code",
          ...getFilters(formData),
        }
      );

      exportRows = await mapLprSearchLogRows(res.data);

      const dateFormat = i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD";

      const pdfName = `${t("file-name.statistic-search-log-plate")}_${dayjs(
        formData.start_date_time
      ).format(dateFormat)}_${dayjs(formData.end_date_time).format(
        dateFormat
      )}.pdf`;

      await downloadStatisticSearchLogPlatePdf(
        buildPdfData(exportRows),
        pdfName,
        t,
        i18n
      );
    }
    catch (error) {
      await PopupMessage(t("popup.export-error-title"), t("popup.export-error-message"), "error");
    } 
    finally {
      setIsLoading(false);
    }
  };

  const buildPdfData = (logPlate: LprSearchLog[]): SearchLogPlatePdfData => {
    const selectedAgency = agency.find(
      (a) => a.ou_code === formData.agency_id
    );
    const selectedBh = bh.find((bh) => bh.bh_code === formData.bh_id);
    const selectedBk = bk.find((bk) => bk.bk_code === formData.bk_id);
    const selectedOrg = org.find((org) => org.org_code === formData.org_id);

    const agencyName =
      formData.agency_id === "0"
        ? t("text.all")
        : selectedAgency
          ? i18n.language === "th"
            ? selectedAgency.ou_name_th ?? "-"
            : selectedAgency.ou_name_en ?? "-"
          : "-";

    const bhName =
      formData.bh_id === "0"
        ? t("text.all")
        : selectedBh
          ? i18n.language === "th"
            ? selectedBh.bh_name_th ?? "-"
            : selectedBh.bh_name_en ?? "-"
          : "-";

    const bkName =
      formData.bk_id === "0"
        ? t("text.all")
        : selectedBk
          ? i18n.language === "th"
            ? selectedBk.bk_name_th ?? "-"
            : selectedBk.bk_name_en ?? "-"
          : "-";

    const orgName =
      formData.org_id === "0"
        ? t("text.all")
        : selectedOrg
          ? i18n.language === "th"
            ? selectedOrg.org_name_th ?? "-"
            : selectedOrg.org_name_en ?? "-"
          : "-";

    return {
      pid_or_water_mark: formData.pid_or_water_mark || "-",
      name: formData.name || "-",
      agency_id: formData.agency_id,
      agency_name: agencyName,
      bh_id: formData.bh_id,
      bh_name: bhName,
      bk_id: formData.bk_id,
      bk_name: bkName,
      org_id: formData.org_id,
      org_name: orgName,
      plate_group: formData.plate_group || "",
      plate_number: formData.plate_number || "",
      province_id: formData.province_id,
      province_name: provinceOptions.find(option => option.value === formData.province_id)?.label || "",
      start_date: dayjs(formData.start_date_time).format(
        i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY"
      ),
      end_date: dayjs(formData.end_date_time).format(
        i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY"
      ),
      logPlate,
    };
  };

  const handleExportExcel = async () => {
    try {
      let exportRows = rows;
            
      if (totalData > CHUNK_SIZE) {
        const isConfirmed = await PopupMessageWithCancel(
          t("popup.export-chunk-confirm-title"),
          t("popup.export-chunk-confirm-message", {
            totalData: totalData.toLocaleString(),
          }),
          t("button.confirm"),
          t("button.cancel"),
          "warning"
        );

        if (!isConfirmed) return;
      }
      setIsLoading(true);

      const res = await searchLprSearchLogs(
        {},
        {
          limit: REQUEST_LIMIT.toString(),
          page: "1",
          ...getFilters(formData),
        }
      );

      exportRows = await mapLprSearchLogRows(res.data);
      
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
          data.idcard || "-",
          dayjs(data.log_timestamp).format(i18n.language === "th" ? "DD/MM/BBBB HH:mm:ss" : "DD/MM/YYYY HH:mm:ss"),
          data.request_ip,
          data.location_webui?.lat || data.location_webui?.lng ? "-" : `${data.location_webui?.lat || "-"}, ${data.location_webui?.lng || "-"}`,
          data.user_agent,
          data.ou_name,
          data.bh_name,
          data.bk_name,
          data.org_name,
        ],
        columnStyles: {
          2: { alignment: { horizontal: "center" } },
        },
      });
    }
    catch (error) {
      await PopupMessage(t("popup.export-error-title"), t("popup.export-error-message"), "error");
    } 
    finally {
      setIsLoading(false);
    }
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

  const showLocationDialog = (event: React.MouseEvent<HTMLTableCellElement>, data: LprSearchLog) => {
    event.preventDefault();
    if (!data.location_webui?.lat || !data.location_webui?.lng) return;
    setSelectedData([{ latitude: data.location_webui.lat, longitude: data.location_webui.lng }, rows.filter((item) => item.location_webui?.lat !== data.location_webui?.lat && item.location_webui?.lng !== data.location_webui?.lng).map((item) => ({ latitude: item.location_webui?.lat, longitude: item.location_webui?.lng }))].flat());
    setLocationDialogOpen(true);
  }

  const handleLocationDialogClose = () => {
    setSelectedData([]);
    setLocationDialogOpen(false);
  }

  const getFilters = (data: FormData) => {
    const filters: string[] = [];

    if (data.plate_group) filters.push(`plate_group=${data.plate_group}`);
    if (data.plate_number) filters.push(`plate_number=${data.plate_number}`);
    if (data.province_id !== "0") filters.push(`region_code=${data.province_id}`);
    if (data.pid_or_water_mark) filters.push(`idcard=${data.pid_or_water_mark}`);
    if (data.name) filters.push(`firstname=${data.name}`);
    if (data.agency_id !== "0") filters.push(`ou_code=${data.agency_id}`);
    if (data.bh_id !== "0") filters.push(`bh_code=${data.bh_id}`);
    if (data.bk_id !== "0") filters.push(`bk_code=${data.bk_id}`);
    if (data.org_id !== "0") filters.push(`org_code=${data.org_id}`);

    filters.push(
      `log_timestamp>=${dayjs(data.start_date_time).format("YYYY-MM-DD")}`
    );
    filters.push(
      `log_timestamp<=${dayjs(data.end_date_time).format("YYYY-MM-DD")}`
    );

    return {
      filter: filters.join(","),
    };
  };

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
                      {`${data.title || ""}${data.firstname || ""} ${data.lastname || ""}`}
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
                      {data.idcard}
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
                      {dayjs(data.log_timestamp).format("DD/MM/BBBB HH:mm:ss")}
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
                      {"-"}
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
                      {data.request_ip}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: data.location_webui?.lat && data.location_webui?.lng ? "var(--hyper-text-color)" : "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        py: 1,
                        px: 1,
                        textDecoration: "underline",
                        cursor: data.location_webui?.lat && data.location_webui?.lng ? "pointer" : "default",
                      }}
                      onClick={(event) => showLocationDialog(event, data)}
                    >
                      <a>{`${data.location_webui?.lat}, ${data.location_webui?.lng}`}</a>
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
                      {data.ou_name}
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