import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from "react-router-dom";
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
import DetailsDialog from "../components/details-dialog/DetailsDialog";
import LoadingScreen from '../components/loading-screen/LoadingScreen';
import ExportLoadingScreen from '../components/loading-screen/ExportLoadingScreen';
import GroupExportButton from '../components/group-export-button/GroupExportButton';

// Constants
import { transitionOf } from "../constants/motion";
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

// PDF
import {
  downloadStatisticAccessAgencyPdf,
  generateStatisticAccessAgencyPdfBlob,
} from "../pdf/StatisticAccessAgencyPdf";

// Types
import type { AccessLog, NsbBk, NsbOrg } from "../types/common";
import type { AgencyUsagePdfData } from "../types/pdf";

// i18n
import { useTranslation } from 'react-i18next';

// Icons
import ClearIcon from "../assets/svg/clear.svg?react";
import InformationIcon from "../assets/icons/information.png";

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
import { searchAccessLogs } from "../features/access-data/api/AccessDataApi";
import { getBk, getOrg } from "../features/dropdown/api/DropdownApi"

interface FormData {
  agency_id: string;
  bh_id: string;
  bk_id: string;
  start_date_time: Date | null;
  end_date_time: Date | null;
}

const StatisticAccessAgency = () => {
  const navigate = useNavigate();

  // i18n
  const { t, i18n } = useTranslation();

  // State
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [rows, setRows] = useState<AccessLog[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [selectedData, setSelectedData] = useState<AccessLog | null>(null);
  const [bk, setBk] = useState<NsbBk[]>([]);
  const [org, setOrg] = useState<NsbOrg[]>([]);

  // Constants
  const CHUNK_SIZE = 1000;
  const REQUEST_LIMIT = 1000;

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    agency_id: "0",
    bh_id: "0",
    bk_id: "0",
    start_date_time: dayjs().toDate(),
    end_date_time: dayjs().toDate(),
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
  const { agency, bh } = useSelector((state: RootState) => state.dropdown);

  usePageTitle(t("pages.statistic-access-agency"));

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

    return buildOptions(filteredBh, t("dropdown.all-bh"), langKeyBh, "bh_code");
  }, [bh, t, i18n.language, formData.agency_id]);

  const bkOptions = useMemo(() => {
    const langKeyBk = i18n.language === "th" ? "bk_abbr_th" : "bk_abbr_en";
    const filteredBk =
      formData.bh_id !== "0"
        ? bk.filter((item) => item.bh_code === formData.bh_id)
        : bk;

    return buildOptions(filteredBk, t("dropdown.all-bk"), langKeyBk, "bk_code")
  }, [bk, t, i18n.language, formData.bh_id]);

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
    formData.agency_id,
    formData.bh_id,
    formData.bk_id,
    formData.start_date_time,
    formData.end_date_time,
    page,
    rowsPerPage,
    agency,
    bh,
    bk,
    org,
  ]);

  const mapAccessLogRows = useCallback(
    (data: AccessLog[]) => {
      return data.map((item) => {
        const agencyData = item.ou_code ?agencyMap.get(item.ou_code) : null;
        const bhData = item.bh_code ? bhMap.get(item.bh_code) : null;
        const bkData = item.bk_code ? bkMap.get(item.bk_code) : null;
        const orgData = item.org_code ? orgMap.get(item.org_code) : null;

        return {
          ...item,
          ou_name: agencyData
            ? i18n.language === "th"
              ? agencyData?.ou_abbr_th ?? ""
              : agencyData?.ou_abbr_en ?? ""
            : "-",
          bh_name: bhData
            ? i18n.language === "th"
              ? bhData?.bh_abbr_th ?? ""
              : bhData?.bh_abbr_en ?? ""
            : "-",
          bk_name: bkData
            ? i18n.language === "th"
              ? bkData?.bk_abbr_th ?? ""
              : bkData?.bk_abbr_en ?? ""
            : "-",
          org_name: orgData
            ? i18n.language === "th"
              ? orgData?.org_abbr_th ?? ""
              : orgData?.org_abbr_en ?? ""
            : "-",
        };
      });
    },
    [agency, bh, bk, org, i18n.language]
  );

  const fetchData = useCallback(
    async (filterData: FormData = formData) => {
      try {
        setIsLoading(true);

        const res = await searchAccessLogs(
          {},
          {
            groupBy: "org_code",
            limit: rowsPerPage.toString(),
            page: page.toString(),
            orderBy: "org_code",
            ...getFilters(filterData),
          }
        );

        const updatedRows = mapAccessLogRows(res.data);

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
        setTotalUsage(0);
        setTotalItems(0);
        setTotalPages(1);
        setTotalData(0);
      } 
      finally {
        setIsLoading(false);
      }
    },
    [
      mapAccessLogRows,
      page, 
      rowsPerPage, 
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
      }

      if (key === "bh_id") {
        updated.bk_id = "0";
      }

      return updated;
    });
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
      agency_id: "0",
      bh_id: "0",
      bk_id: "0",
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
          const res = await searchAccessLogs(
            {},
            {
              groupBy: "org_code",
              limit: CHUNK_SIZE.toString(),
              page: page.toString(),
              orderBy: "org_code",
              ...getFilters(formData),
            }
          );

          const formattedData = await mapAccessLogRows(res.data);

          const fileName = `${t(
            "file-name.statistic-access-agency"
          )}_${startDate}_${endDate}_${page}.pdf`;

          const blob = await generateStatisticAccessAgencyPdfBlob(
            buildPdfData(formattedData),
            t,
            i18n
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
          `PDF_${t("file-name.statistic-access-agency")}_${dayjs().format(
            "YYYY-MM-DD"
          )}.zip`
        );

        return;
      }

      const exportRows = await getExportData(REQUEST_LIMIT, 1, {
        groupBy: "org_code",
        orderBy: "org_code",
      });

      updateExportProgress(
        t("text.export-pdf"),
        page,
        1,
        80
      );

      const pdfName = `${t(
        "file-name.statistic-access-agency"
      )}_${startDate}_${endDate}.pdf`;

      await downloadStatisticAccessAgencyPdf(
        buildPdfData(exportRows),
        pdfName,
        t,
        i18n
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

  const buildPdfData = (agencyUsage: AccessLog[]): AgencyUsagePdfData => {
    const selectedAgency = agencyMap.get(formData.agency_id);
    const selectedBh = bhMap.get(formData.bh_id);
    const selectedBk = bkMap.get(formData.bk_id);

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

    return {
      agency_id: formData.agency_id,
      agency_name: agencyName,
      bh_id: formData.bh_id,
      bh_name: bhName,
      bk_id: formData.bk_id,
      bk_name: bkName,
      start_date: dayjs(formData.start_date_time).format(
        i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY"
      ),
      end_date: dayjs(formData.end_date_time).format(
        i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY"
      ),
      agencyUsage,
    }
  };

  const handleExportExcel = async () => {
    try {
      startExportLoading();
      const dateFormat = i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD";

      const startDate = dayjs(formData.start_date_time).format(dateFormat);
      const endDate = dayjs(formData.end_date_time).format(dateFormat);

      const baseFileName = `${t(
        "file-name.statistic-access-agency"
      )}_${startDate}_${endDate}`;

      const headers = [
        t('table.header.no'),
        t('table.header.count'),
        t('table.header.agency'),
        t('table.header.bh'),
        t('table.header.bk'),
        t('table.header.org'),
      ];

      const mapRow = (data: any, index: number) => [
        index + 1,
        Number(data.total || 0).toLocaleString(),
        data.ou_name || "-",
        data.bh_name || "-",
        data.bk_name || "-",
        data.org_name || "-",
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
          const exportRows = await getExportData(CHUNK_SIZE, pageIndex, 
            {
              groupBy: "org_code",
              orderBy: "org_code",
            }
          );

          const blob = await generateExcelBlob({
            sheetName: t("file-name.statistic-access-agency"),
            headers,
            data: exportRows,
            mapRow: (data, index) => [
              (pageIndex - 1) * CHUNK_SIZE + index + 1,
              Number(data.total || 0).toLocaleString(),
              data.ou_name || "-",
              data.bh_name || "-",
              data.bk_name || "-",
              data.org_name || "-",
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

      const exportRows = await getExportData(REQUEST_LIMIT, 1, {
        groupBy: "org_code",
        orderBy: "org_code",
      });

      updateExportProgress(
        t("text.export-excel"),
        1,
        1,
        50
      );

      await exportExcel({
        sheetName: t("file-name.statistic-access-agency"),
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
    const res = await searchAccessLogs(
      {},
      {
        limit: limit.toString(),
        page: page.toString(),
        ...otherFilters,
        ...getFilters(formData),
      }
    );

    return mapAccessLogRows(res.data);
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

  const showDetailDialog = (data: AccessLog) => {
    setSelectedData(data);
    setDetailDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setSelectedData(null);
    setDetailDialogOpen(false);
  }

  const navigateToPersonUsage = async () => {
    navigate("/statistic-access-person", {
      state: {
        fromNavigate: true,
        filters: {
          agency_id: selectedData?.ou_code ?? 0,
          bh_id: selectedData?.bh_code ?? 0,
          bk_id: selectedData?.bk_code ?? 0,
          org_id: selectedData?.org_code ?? 0,
          start_date: formData.start_date_time,
          end_date: formData.end_date_time,
        }
      }
    });
    setSelectedData(null);
    setDetailDialogOpen(false);
  }

  const getFilters = (data: FormData) => {
    const filters: Record<string, string> = {
      start_time: dayjs(data.start_date_time).format("YYYY-MM-DD"),
      end_time: dayjs(data.end_date_time).format("YYYY-MM-DD"),
    };

    if (data.agency_id !== "0") {
      filters.ou_code = data.agency_id;
    };
    if (data.bh_id !== "0") {
      filters.bh_code = data.bh_id;
    };
    if (data.bk_id !== "0") {
      filters.bk_code = data.bk_id;
    };

    return filters;
  };

  return (
    <section id='statistic-access-agency' className="flex flex-col h-full w-full p-2">
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
      <MainTitle title={t("pages.statistic-access-agency")} />
      <div className='p-4 bg-(--main-bg-color) flex flex-1 flex-col gap-4 min-h-0 w-full rounded-lg border border-(--primary-color) overflow-y-auto'>
        {/* Search Filters */}
        <Box 
          className="border border-(--primary-color) rounded-[10px] p-4 bg-(--tertiary-color)"
          sx={{
            boxShadow: "0px 2px 8px rgba(var(--tertiary-color-rgb),0.1)",
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
              xl: "repeat(6, minmax(0, 1fr))",
            },
          }}
        >
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
            maxDate={dayjs()}
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
            maxDate={dayjs()}
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
              groupKey="statistic-access-agency"
              handleExportExcel={handleExportExcel}
              handleExportPdf={handleExportPdf}
            />
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
                    sx={{ width: "10%" }}
                  >
                    {t('table.header.count')}
                  </TableCell>
                  <TableCell
                    sx={{ width: "10%" }}
                  >
                    {t('table.header.agency')}
                  </TableCell>
                  <TableCell
                    sx={{ width: "10%" }}
                  >
                    {t('table.header.bh')}
                  </TableCell>
                  <TableCell
                    sx={{ width: "10%" }}
                  >
                    {t('table.header.bk')}
                  </TableCell>
                  <TableCell
                    sx={{ width: "10%" }}
                  >
                    {t('table.header.org')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "var(--tertiary-color)" }}>
                {rows.map((data, index) => (
                  <TableRow
                    key={index}
                    onClick={() => showDetailDialog(data)}
                    sx={{
                      cursor: "pointer",
                      "& .MuiTableCell-root": {
                        backgroundColor:
                          selectedData?.log_id === data.log_id
                            ? "rgba(var(--primary-color-rgb), 0.3)"
                            : "var(--tertiary-color)",
                        color: "var(--secondary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        transition: transitionOf(["background-color"], "fast"),
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
                    <TableCell
                      sx={{
                        textAlign: "center",
                      }}
                    >
                      {(data.total || 0).toLocaleString()}
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
                    <TableCell colSpan={6} align="center">
                      {t("text.data-not-found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Detail Dialog */}
          {
            detailDialogOpen && (
              <DetailsDialog
                open={detailDialogOpen}
                handleClose={handleDetailsDialogClose}
                dialogTitle={t('pages.statistic-access-agency')}
              >
                <Box className="flex flex-col gap-3 items-center px-4 pt-4">
                  <img src={InformationIcon} alt="Information" className="h-15 w-15" />
                  <Box className="w-full text-(--primary-color) grid grid-cols-[110px_10px_1fr]">
                    <p>{`${t('text.count')} (${t('text.time')})`}</p>
                    <p>:</p>
                    <p>{selectedData?.total ?? 0}</p>

                    <p>{t('text.agency')}</p>
                    <p>:</p>
                    <p>{selectedData?.ou_name}</p>

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
                      color: "var(--tertiary-color)",
                      fontSize: "13px", 
                      width: "120px", 
                      py: 0.35, 
                      borderRadius: "5px",
                      mt: 1,
                      ":hover": {
                        scale: 1.1,
                      }
                    }}
                    onClick={navigateToPersonUsage}
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

export default StatisticAccessAgency;