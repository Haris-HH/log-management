import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import { saveAs } from "file-saver";
import JSZip from "jszip";

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

// Components
import MainTitle from '../components/main-title/MainTitle';
import AutoComplete from "../components/auto-complete/AutoComplete";
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";
import PaginationComponent from "../components/pagination/Pagination";
import LoadingScreen from '../components/loading-screen/LoadingScreen';
import LocationUsage from "../components/location-usage/LocationUsage";
import TextBox from "../components/text-box/TextBox";
import ExportLoadingScreen from '../components/loading-screen/ExportLoadingScreen';
import GroupExportButton from '../components/group-export-button/GroupExportButton';

// Constants
import { transitionOf } from "../constants/motion";
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

// PDF
import {
  downloadStatisticSearchLogPlatePdf,
  generateStatisticSearchLogPlatePdfBlob,
} from "../pdf/StatisticSearchLogPlatePdf";

// Types
import type { LprSearchLog, NsbBk, NsbOrg } from "../types/common";
import type { SearchLogPlatePdfData } from "../types/pdf";

// i18n
import { useTranslation } from 'react-i18next';

// Icons
import ClearIcon from "../assets/svg/clear.svg?react";

// Utils
import { buildOptions, getLocalizedName } from "../utils/commonFunctions";
import { exportExcel, generateExcelBlob } from "../utils/exportData";
import { PopupMessage, PopupMessageWithCancel } from '../utils/popupMessage';

// Hooks
import usePageTitle from "../hooks/usePageTitle";
import useExportProgress from "../hooks/useExportProgress";

// Store
import type { RootState } from "../store/store";

// API
import { searchLprSearchLogs } from "../features/usage-search-data/api/UsageSearchDataApi";
import { getUserApi } from '../features/users/api/UsersApi';
import { getBk, getOrg } from "../features/dropdown/api/DropdownApi";

interface FormData {
  title_id: string;
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

  // i18n
  const { t, i18n } = useTranslation();

  // State
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Data
  const [rows, setRows] = useState<LprSearchLog[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [selectedData, setSelectedData] = useState<{latitude: number, longitude: number}[]>([]);
  const [bk, setBk] = useState<NsbBk[]>([]);
  const [org, setOrg] = useState<NsbOrg[]>([]);

  // Constants
  const CHUNK_SIZE = 1000;
  const REQUEST_LIMIT = 1000;

  // Form Data
  const [formData, setFormData] = useState<FormData>(() => {
    if (location.state?.fromNavigate && location.state?.filters) {
      return {
        title_id: location.state.filters.title ?? "0",
        name: location.state.filters.name ?? "",
        pid_or_water_mark: location.state.filters.pid ?? "",
        plate_group: location.state.filters.plate_group ?? "",
        plate_number: location.state.filters.plate_number ?? "",
        province_id: location.state.filters.province_id ?? "",
        agency_id: location.state.filters.agency_id,
        bh_id: location.state.filters.bh_id,
        bk_id: location.state.filters.bk_id,
        org_id: location.state.filters.org_id,
        start_date_time: location.state.filters.start_date,
        end_date_time: location.state.filters.end_date,
      };
    }

    return {
      title_id: "0",
      name: "",
      pid_or_water_mark: "",
      plate_group: "",
      plate_number: "",
      province_id: "",
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    ROWS_PER_PAGE_OPTIONS[0],
  );
  const [rowsPerPageOptions] = useState(
    ROWS_PER_PAGE_OPTIONS
  );

  const {
    exportLoading,
    exportProgress,
    startExportLoading,
    stopExportLoading,
    updateExportProgress,
  } = useExportProgress();

  // Slice
  const { agency, bh, lprRegion, title } = useSelector((state: RootState) => state.dropdown);

  usePageTitle(t("pages.statistic-search-log-plate"));

  const agencyOptions = useMemo(() => {
    const langKeyAgency = i18n.language === "th" ? "ou_abbr_th" : "ou_abbr_en";
    return buildOptions(agency, t("dropdown.all-agency"), langKeyAgency, "ou_code");
  }, [agency, t, i18n.language]);

  const bhOptions = useMemo(() => {
    const langKeyBh = i18n.language === "th" ? "bh_abbr_th" : "bh_abbr_en";
    const filteredBh =
      formData.agency_id !== "0"
        ? bh.filter((item) => item.ou_code === formData.agency_id)
        : bh;

    return buildOptions(filteredBh, t("dropdown.all-bh"), langKeyBh, "bh_code")
  }, [bh, t, i18n.language, formData.agency_id]);

  const bkOptions = useMemo(() => {
    const langKeyBk = i18n.language === "th" ? "bk_abbr_th" : "bk_abbr_en";
    const filteredBk =
      formData.bh_id !== "0"
        ? bk.filter((item) => item.bh_code === formData.bh_id)
        : bk;

    return buildOptions(filteredBk, t("dropdown.all-bk"), langKeyBk, "bk_code")
  }, [bk, t, i18n.language, formData.bh_id]);

  const orgOptions = useMemo(() => {
    const langKeyOrg = i18n.language === "th" ? "org_abbr_th" : "org_abbr_en";
    const filteredOrg =
      formData.bk_id !== "0"
        ? org.filter((item) => item.bk_code === formData.bk_id)
        : org;

    return buildOptions(filteredOrg, t("dropdown.all-org"), langKeyOrg, "org_code")
  }, [org, t, i18n.language, formData.bk_id]);

  const titleOptions = useMemo(() => {
    const langKeyTitle = i18n.language === "th" ? "title_abbr_th" : "title_abbr_en";

    return buildOptions(title, t("dropdown.all-title"), langKeyTitle, "id")
  }, [title, t, i18n.language]);

  const provinceOptions = useMemo(() => {
    const langKeyProvince = i18n.language === "th" ? "name_th" : "name_en";
    return buildOptions(
      lprRegion, "", 
      langKeyProvince, 
      "region_code",
      false);
  }, [lprRegion, t, i18n.language]);

  // Map
  const agencyMap = useMemo(
    () => new Map(agency.map(item => [item.ou_code, item])),
    [agency]
  );

  const bhMap = useMemo(
    () => new Map(bh.map(item => [item.bh_code, item])),
    [bh]
  );

  const bkMap = useMemo(
    () => new Map(bk.map(item => [item.bk_code, item])),
    [bk]
  );

  const orgMap = useMemo(
    () => new Map(org.map(item => [item.org_code, item])),
    [org]
  );

  const titleMap = useMemo(
    () => new Map(title.map(item => [item.id, item])),
    [title]
  );

  const provinceMap = useMemo(
    () => new Map(lprRegion.map(item => [item.region_code, item])),
    [lprRegion]
  );

  const fetchBkList = useCallback(async (bhCode?: string) => {
    try {
      const params: Record<string, string> = {
        limit: "100",
        ...(bhCode && bhCode !== "0"
          ? { bh_code: bhCode }
          : {}),
      };

      const res = await getBk(params);
      setBk(res.data ?? []);
    } catch (error) {
      setBk([]);
    }
  }, []);

  const fetchOrgList = useCallback(async (bkCode?: string) => {
    try {
      const params: Record<string, string> = {
        limit: "100",
        ...(bkCode && bkCode !== "0"
          ? { bk_code: bkCode }
          : {}),
      };

      const res = await getOrg(params);
      setOrg(res.data ?? []);
    } catch (error) {
      setOrg([]);
    }
  }, []);

  useEffect(() => {
    fetchBkList(formData.bh_id);
  }, [fetchBkList, formData.bh_id]);

  useEffect(() => {
    fetchOrgList(formData.bk_id);
  }, [fetchOrgList, formData.bk_id]);

  useEffect(() => {
    fetchData(formData);
  }, [
    formData.title_id,
    formData.agency_id,
    formData.bh_id,
    formData.bk_id,
    formData.org_id,
    formData.start_date_time,
    formData.end_date_time,
    formData.province_id,
    page,
    rowsPerPage,
    searchTrigger,
    agency,
    bh,
    bk,
    org,
    title,
    lprRegion,
  ]);

  const mapLprSearchLogRows = useCallback(
    async (data: LprSearchLog[]): Promise<LprSearchLog[]> => {
      const userIds = [...new Set(data.map((item) => item.user_id))];

      const usersRes = await getUserApi({
        filter: `user_id=${userIds.join("|")}`,
      });

      const userMap = new Map(
        usersRes.data?.map((user) => [user.user_id, user]) ?? []
      );

      const rows = data.map((item) => {
        const user = userMap.get(item.user_id);

        const agencyData = item.ou_code ?agencyMap.get(item.ou_code) : null;
        const bhData = item.bh_code ? bhMap.get(item.bh_code) : null;
        const bkData = item.bk_code ? bkMap.get(item.bk_code) : null;
        const orgData = item.org_code ? orgMap.get(item.org_code) : null;
        const titleData = user?.title_id ? titleMap.get(user?.title_id) : null;

        return {
          ...item,
          idcard: user?.idcard ?? "-",
          title:
            titleData
              ? i18n.language === "th"
                ? titleData?.title_abbr_th ?? ""
                : titleData?.title_abbr_en ?? ""
              : "",
          firstname: user?.firstname ?? "-",
          lastname: user?.lastname ?? "-",
          ou_name:
            agencyData
              ? i18n.language === "th"
                ? agencyData?.ou_abbr_th ?? ""
                : agencyData?.ou_abbr_en ?? ""
              : "-",
          bh_name:
            bhData
              ? i18n.language === "th"
                ? bhData?.bh_abbr_th ?? ""
                : bhData?.bh_abbr_en ?? ""
              : "-",
          bk_name:
            bkData
              ? i18n.language === "th"
                ? bkData?.bk_abbr_th ?? ""
                : bkData?.bk_abbr_en ?? ""
              : "-",
          org_name:
            orgData
              ? i18n.language === "th"
                ? orgData?.org_abbr_th ?? ""
                : orgData?.org_abbr_en ?? ""
              : "-",
        };
      });

      return rows;
    },
    [formData, page, title, agency, rowsPerPage, bh, bk, org, lprRegion, i18n.language, i18n.isInitialized]
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
        setTotalItems(res.pagination?.countAll ?? 0);
        setTotalData(res.pagination?.countAll ?? 0);
        setTotalPages(res.pagination?.maxPage ?? 1);
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
    [
      mapLprSearchLogRows, 
      page, 
      rowsPerPage
    ]
  );

  const handleDropdownChange = (
    event: React.SyntheticEvent,
    key: keyof typeof formData,
    value: { value: any; label: string } | null,
  ) => {
    event.preventDefault();

    const selectedValue = value?.value ?? "0";

    setFormData((prev) => {
      const updated = {
        ...prev,
        [key]: selectedValue,
      };

      if (key === "agency_id") {
        updated.bh_id = "0";
        updated.bk_id = "0";
        updated.org_id = "0";
      }

      if (key === "bh_id") {
        updated.bk_id = "0";
        updated.org_id = "0";
      }

      if (key === "bk_id") {
        updated.org_id = "0";
      }

      return updated;
    });
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
      title_id: "0",
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
      startExportLoading();

      const dateFormat = i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD";
      const startDate = dayjs(formData.start_date_time).format(dateFormat);
      const endDate = dayjs(formData.end_date_time).format(dateFormat);

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

        const zip = new JSZip();
        const totalFiles = Math.ceil(totalData / CHUNK_SIZE);

        updateExportProgress(
          t("text.export-pdf"),
          0,
          totalFiles,
          0,
        );

        for (let page = 1; page <= totalFiles; page++) {

          const formattedData = await getExportData(CHUNK_SIZE, page);

          const fileName = `${t(
            "file-name.statistic-search-log-plate"
          )}_${startDate}_${endDate}_${page}.pdf`;

          const blob = await generateStatisticSearchLogPlatePdfBlob(
            buildPdfData(formattedData),
            t
          );

          zip.file(fileName, blob);

          updateExportProgress(
            t("text.export-pdf"),
            page,
            totalFiles,
            Math.round((page / totalFiles) * 100),
          );

          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });

        saveAs(
          zipBlob,
          `PDF_${t("file-name.statistic-search-log-plate")}_${dayjs().format(
            "YYYY-MM-DD"
          )}.zip`
        );

        return;
      }

      const exportRows = await getExportData(REQUEST_LIMIT, 1);

      updateExportProgress(
        t("text.export-pdf"),
        page,
        1,
        80
      );

      const pdfName = `${t(
        "file-name.statistic-search-log-plate"
      )}_${startDate}_${endDate}.pdf`;

      await downloadStatisticSearchLogPlatePdf(
        buildPdfData(exportRows),
        pdfName,
        t
      );
    } 
    catch (error) {
      stopExportLoading();
      await PopupMessage(
        t("popup.export-error-title"),
        t("popup.export-error-message"),
        "error"
      );
    } 
    finally {
      stopExportLoading();
    }
  };

  const buildPdfData = (logPlate: LprSearchLog[]): SearchLogPlatePdfData => {
    const selectedAgency = agencyMap.get(formData.agency_id);
    const selectedBh = bhMap.get(formData.bh_id);
    const selectedBk = bkMap.get(formData.bk_id);
    const selectedOrg = orgMap.get(formData.org_id);
    const selectedProvince = provinceMap.get(formData.province_id);

    const agencyName = getLocalizedName(
      formData.agency_id,
      selectedAgency,
      "ou_abbr_th",
      "ou_abbr_en",
      t,
      i18n
    );

    const bhName = getLocalizedName(
      formData.bh_id,
      selectedBh,
      "bh_abbr_th",
      "bh_abbr_en",
      t,
      i18n
    );

    const bkName = getLocalizedName(
      formData.bk_id,
      selectedBk,
      "bk_abbr_th",
      "bk_abbr_en",
      t,
      i18n
    );

    const orgName = getLocalizedName(
      formData.org_id,
      selectedOrg,
      "org_abbr_th",
      "org_abbr_en",
      t,
      i18n
    );

    const provinceName = getLocalizedName(
      formData.province_id,
      selectedProvince,
      "name_th",
      "name_en",
      t,
      i18n
    );

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
      province_name: provinceName,
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
      startExportLoading();
      const dateFormat = i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD";

      const startDate = dayjs(formData.start_date_time).format(dateFormat);
      const endDate = dayjs(formData.end_date_time).format(dateFormat);

      const baseFileName = `${t(
        "file-name.statistic-search-log-plate"
      )}_${startDate}_${endDate}`;

      const headers = [
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
      ];

      const mapRow = (data: any, index: number) => [
        index + 1,
        data.idcard,
        dayjs(data.log_timestamp).format(i18n.language === "th" ? "DD/MM/BBBB HH:mm:ss" : "DD/MM/YYYY HH:mm:ss"),
        data.request_ip,
        data.location_webui?.latitude || data.location_webui?.longitude ? "-" : `${data.location_webui?.latitude || "-"}, ${data.location_webui?.longitude || "-"}`,
        data.user_agent,
        data.ou_name,
        data.bh_name,
        data.bk_name,
        data.org_name,
      ];

      const columnStyles = {
        1: { alignment: { horizontal: "center" as const } },
        2: { alignment: { horizontal: "right" as const } },
      };

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

        const zip = new JSZip();
        const totalFiles = Math.ceil(totalData / CHUNK_SIZE);

        updateExportProgress(
          t("text.export-excel"),
          0,
          totalFiles,
          0
        );

        for (let pageIndex = 1; pageIndex <= totalFiles; pageIndex++) {
          const exportRows = await getExportData(CHUNK_SIZE, pageIndex);

          const blob = await generateExcelBlob({
            sheetName: t("file-name.statistic-search-log-plate"),
            headers,
            data: exportRows,
            mapRow: (data, index) => [
              index + 1,
              data.idcard ?? "-",
              dayjs(data.log_timestamp).format(i18n.language === "th" ? "DD/MM/BBBB HH:mm:ss" : "DD/MM/YYYY HH:mm:ss"),
              data.request_ip ?? "-",
              data.location_webui?.latitude || data.location_webui?.longitude ? "-" : `${data.location_webui?.latitude || "-"}, ${data.location_webui?.longitude || "-"}`,
              data.user_agent ?? "-",
              data.ou_name ?? "-",
              data.bh_name ?? "-",
              data.bk_name ?? "-",
              data.org_name ?? "-",
            ],
            columnStyles,
          });

          zip.file(`${baseFileName}_${pageIndex}.xlsx`, blob);

          updateExportProgress(
            t("text.export-excel"),
            pageIndex,
            totalFiles,
            Math.round((pageIndex / totalFiles) * 100)
          );

          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `Excel_${baseFileName}.zip`);

        return;
      }

      const exportRows = await getExportData(REQUEST_LIMIT, 1);

      updateExportProgress(
        t("text.export-excel"),
        1,
        1,
        50
      );

      await exportExcel({
        sheetName: t("file-name.statistic-search-log-plate"),
        fileName: `${baseFileName}.xlsx`,
        headers,
        data: exportRows,
        mapRow,
        columnStyles,
      });
    } 
    catch (error) {
      stopExportLoading();
      await PopupMessage(
        t("popup.export-error-title"),
        t("popup.export-error-message"),
        "error"
      );
    } 
    finally {
      stopExportLoading();
    }
  };

  const getExportData = async (
    limit: number,
    page: number,
    otherFilters: Record<string, string> = {},
  ) => {
    const res = await searchLprSearchLogs(
      {},
      {
        limit: limit.toString(),
        page: page.toString(),
        ...otherFilters,
        ...getFilters(formData),
      }
    );

    return mapLprSearchLogRows(res.data);
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

  const showLocationDialog = (event: React.MouseEvent<HTMLTableRowElement>, data: LprSearchLog) => {
    event.preventDefault();
    if (!data.location_webui?.latitude || !data.location_webui?.longitude) return;
    setSelectedData([{ latitude: data.location_webui.latitude, longitude: data.location_webui.longitude }, rows.filter((item) => item.location_webui?.latitude !== data.location_webui?.latitude && item.location_webui?.longitude !== data.location_webui?.longitude).map((item) => ({ latitude: item.location_webui?.latitude, longitude: item.location_webui?.longitude }))].flat());
    setLocationDialogOpen(true);
  }

  const handleLocationDialogClose = () => {
    setSelectedData([]);
    setLocationDialogOpen(false);
  }

  const getFilters = (
    data: FormData,
    start_date_time?: Date | null,
    end_date_time?: Date | null
  ) => {
    const startDate = start_date_time ?? data.start_date_time;
    const endDate = end_date_time ?? data.end_date_time;

    const filters: Record<string, string> = {
      start_time: dayjs(startDate).format("YYYY-MM-DD"),
      end_time: dayjs(endDate).format("YYYY-MM-DD"),
    };

    const plateGroup = data.plate_group.trim();
    const plateNumber = data.plate_number.trim();
    const pid = data.pid_or_water_mark.trim();
    const name = data.name.trim();

    if (pid) {
      filters.idcard = encodeURIComponent(pid);
    }

    if (name) {
      filters.fullname = encodeURIComponent(name);
    }

    if (data.title_id !== "0") {
      filters.title_id = data.title_id;
    }

    if (data.agency_id !== "0") {
      filters.ou_code = data.agency_id;
    }

    if (data.bh_id !== "0") {
      filters.bh_code = data.bh_id;
    }

    if (data.bk_id !== "0") {
      filters.bk_code = data.bk_id;
    }

    if (plateGroup) {
      filters.plate_group = encodeURIComponent(plateGroup);
    }

    if (plateNumber) {
      filters.plate_number = encodeURIComponent(plateNumber);
    }

    if (data.province_id !== "0") {
      filters.region_code = data.province_id;
    }

    return filters;
  };

  const handleSearchOnEnter = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      setPage(1);
      setSearchTrigger((prev) => prev + 1);
    }
  };

  const handleLocationSearch = async (start_date_time: Date | null, end_date_time: Date | null) => {
    const res = await searchLprSearchLogs(
      {},
      {
        limit: rowsPerPage.toString(),
        page: page.toString(),
        ...getFilters(formData, start_date_time, end_date_time),
      }
    );

    setSelectedData(
      res.data.map((item) => {
        return {
          latitude: item.location_webui?.latitude ?? 0,
          longitude: item.location_webui?.longitude ?? 0
        }
      })
    );
  }

  return (
    <section id='statistic-search-log-plate' className="flex flex-col h-full w-full p-2">
      { isLoading && <LoadingScreen /> }
      {
        exportLoading &&
        <ExportLoadingScreen
          text={exportProgress.text}
          current={exportProgress.current}
          total={exportProgress.total}
          percent={exportProgress.percent}
        />
      }
      {/* Main Title */}
      <MainTitle title={t("pages.statistic-search-log-plate")} />
      <div className='p-4 bg-(--main-bg-color) flex flex-1 flex-col gap-4 min-h-0 w-full rounded-lg border border-(--primary-color) overflow-y-auto'>
        {/* Search Filters */}
        <Box 
          className="flex border border-(--primary-color) rounded-[10px] p-4 gap-2 bg-(--tertiary-color)"
          sx={{
            boxShadow: "0px 2px 8px rgba(var(--tertiary-color-rgb),0.1)"
          }}
        >
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
                xl: "repeat(6, minmax(0,1fr))",
              },
            }}
          >
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
              onKeyDown={handleSearchOnEnter}
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
              onKeyDown={handleSearchOnEnter}
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
              onKeyDown={handleSearchOnEnter}
            />

            <div className='flex col-span-2 gap-2'>
              <div className='w-[50%]'>
                <AutoComplete 
                  id="title-select"
                  sx={{ marginTop: "5px" }}
                  value={formData.title_id}
                  onChange={(event, value) => handleDropdownChange(event, "title_id", value)}
                  options={titleOptions}
                  label={t('component.title')}
                  placeholder={t('placeholder.title')}
                  labelFontSize="14px"
                  freeSolo={true}
                />
              </div>

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
                onKeyDown={handleSearchOnEnter}
              />
            </div>
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
                startIcon={<ClearIcon className="h-6 w-6" style={{ color: "var(--tertiary-color)" }} />}  
                sx={{ 
                  backgroundColor: "var(--primary-color)", 
                  color: "var(--tertiary-color)",
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
              <GroupExportButton 
                groupKey="statistic-search-log-plate"
                handleExportExcel={handleExportExcel}
                handleExportPdf={handleExportPdf}
              />
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
              backgroundColor: "var(--tertiary-color)",
            }}
          >
            <Table
              sx={{ minWidth: 650, backgroundColor: "var(--tertiary-color)", border: "1px solid var(--primary-color)"}}
              stickyHeader
            >
              <TableHead
                sx={{
                  "& .MuiTableCell-head": {
                    color: "var(--tertiary-color)",
                    backgroundColor: "var(--primary-color)",
                    textAlign: "center",
                  },
                }}
              >
                <TableRow>
                  <TableCell
                    sx={{ width: "2%" }}
                  >
                    {t('table.header.no')}
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: "250px" }}
                  >
                    {t('table.header.first-name-last-name')}
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: "250px" }}
                  >
                    {t('table.header.pid-full')}
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: "200px" }}
                  >
                    {t('table.header.date')}
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: "600px" }}
                  >
                    {t('table.header.detail')}
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: "200px" }}
                  >
                    {t('table.header.ip-address')}
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: "200px" }}
                  >
                    {t('table.header.coordinates')}
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: "500px" }}
                  >
                    {t('table.header.user-agent')}
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: "120px" }}
                  >
                    {t('table.header.agency')}
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: "120px" }}
                  >
                    {t('table.header.bh')}
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: "120px" }}
                  >
                    {t('table.header.bk')}
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: "120px" }}
                  >
                    {t('table.header.org')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "var(--tertiary-color)" }}>
                {rows.map((data, index) => (
                  <TableRow
                    key={index}
                    onClick={(event) => showLocationDialog(event, data)}
                    sx={{
                      cursor: "pointer",
                      "& .MuiTableCell-root": {
                        backgroundColor: "var(--tertiary-color)",
                        color: "var(--secondary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        transition: transitionOf(["background-color"], "fast"),
                        py: 1,
                        px: 1,
                      },
                      "&:hover .MuiTableCell-root": {
                        backgroundColor: "rgba(var(--primary-color-rgb), 0.15)",
                      },
                      "&:hover": {
                        "& .MuiTableCell-root": {
                          color: "var(--secondary-color)",
                        },
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        textAlign: "center",
                      }}
                    >
                      {((page - 1) * rowsPerPage) + index + 1}
                    </TableCell>
                    <TableCell>
                      {`${data.title || ""}${data.firstname || ""} ${data.lastname || ""}`}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                      }}
                    >
                      {data.idcard}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                      }}
                    >
                      {dayjs(data.log_timestamp).format("DD/MM/BBBB HH:mm:ss")}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                      }}
                    >
                      {data.details}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                      }}
                    >
                      {data.request_ip}
                    </TableCell>
                    <TableCell>
                      {!data.location_webui?.latitude || !data.location_webui?.longitude ? "-" : `${data.location_webui?.latitude?.toFixed(5)}, ${data.location_webui?.longitude?.toFixed(5)}`}
                    </TableCell>
                    <TableCell>
                      {data.user_agent}
                    </TableCell>
                    <TableCell>
                      {data.ou_name}
                    </TableCell>
                    <TableCell>
                      {data.bh_name}
                    </TableCell>
                    <TableCell>
                      {data.bk_name}
                    </TableCell>
                    <TableCell>
                      {data.org_name}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow
                    sx={{
                      "& .MuiTableCell-root": {
                        backgroundColor: "var(--tertiary-color)",
                        color: "var(--secondary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      },
                    }}
                  >
                    <TableCell colSpan={12} align="center">
                      {t("text.data-not-found")}
                    </TableCell>
                  </TableRow>
                )}
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
                start_date_time={formData.start_date_time}
                end_date_time={formData.end_date_time}
                onSearch={handleLocationSearch}
              />
            )
          }
        </Box>
      </div>
    </section>
  )
}

export default StatisticSearchLogPlate;