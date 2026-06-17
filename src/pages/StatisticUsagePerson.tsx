import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from "react-router-dom";
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
import IconButton from "@mui/material/IconButton";

// Components
import MainTitle from '../components/main-title/MainTitle';
import AutoComplete from "../components/auto-complete/AutoComplete";
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";
import PaginationComponent from "../components/pagination/Pagination";
import DetailsDialog from "../components/details-dialog/DetailsDialog";
import LoadingScreen from '../components/loading-screen/LoadingScreen';
import TextBox from "../components/text-box/TextBox";
import ExportLoadingScreen from '../components/loading-screen/ExportLoadingScreen';

// Constants
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

// PDF
import {
  downloadStatisticUsagePersonPdf,
  generateStatisticUsagePersonPdfBlob,
} from "../pdf/StatisticUsagePersonPdf";

// Types
import type { UsageLog } from "../types/common";
import type { PersonUsagePdfData } from "../types/pdf";

// i18n
import { useTranslation } from 'react-i18next';

// Icons
import ClearIcon from "../assets/svg/clear.svg?react";
import ExportExcelIcon from "../assets/icons/export-excel.png";
import ExportPdfIcon from "../assets/icons/export-pdf.png";
import InformationIcon from "../assets/icons/information.png";

// Utils
import { buildOptions } from "../utils/commonFunctions";
import { exportExcel, generateExcelBlob } from "../utils/exportData";
import { PopupMessage, PopupMessageWithCancel } from '../utils/popupMessage';

// Hooks
import usePageTitle from "../hooks/usePageTitle";

// Store
import type { RootState } from "../store/store";

// API
import { searchUsageLogs } from "../features/usage-data/api/UsageDataApi";
import { getUserApi } from '../features/users/api/UsersApi';

interface FormData {
  title_id: string;
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
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  // Data
  const [rows, setRows] = useState<UsageLog[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [selectedData, setSelectedData] = useState<UsageLog | null>(null);
  const [exportProgress, setExportProgress] = useState({
    text: "",
    current: 0,
    total: 0,
    percent: 0,
  });

  // Options
  const [agencyOptions, setAgencyOptions] = useState<{ label: string, value: string }[]>([]);
  const [bhOptions, setBhOptions] = useState<{ label: string, value: string }[]>([]);
  const [bkOptions, setBkOptions] = useState<{ label: string, value: string }[]>([]);
  const [orgOptions, setOrgOptions] = useState<{ label: string, value: string }[]>([]);
  const [titleOptions, setTitleOptions] = useState<{ label: string, value: string }[]>([]);
  
  // Constants
  const CHUNK_SIZE = 1000;
  const REQUEST_LIMIT = 1000;

  // Form Data
  const [formData, setFormData] = useState<FormData>(() => {
    if (location.state?.fromNavigate && location.state?.filters) {
      return {
        title_id: "0",
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
      title_id: "0",
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    ROWS_PER_PAGE_OPTIONS[0],
  );
  const [rowsPerPageOptions] = useState(
    ROWS_PER_PAGE_OPTIONS
  );

  // Slice
  const { agency, bh, bk, org, title } = useSelector((state: RootState) => state.dropdown);

  usePageTitle(t("pages.statistic-usage-person"));

  useEffect(() => {
    const langKeyAgency = i18n.language === "th" ? "ou_abbr_th" : "ou_abbr_en";
    const langKeyBh = i18n.language === "th" ? "bh_abbr_th" : "bh_abbr_en";
    const langKeyBk = i18n.language === "th" ? "bk_abbr_th" : "bk_abbr_en";
    const langKeyOrg = i18n.language === "th" ? "org_abbr_th" : "org_abbr_en";
    const langKeyTitle = i18n.language === "th" ? "title_abbr_th" : "title_abbr_en";

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

    setTitleOptions(
      buildOptions(title, t("dropdown.all-title"), langKeyTitle, "id")
    );
  }, [
    agency,
    bh,
    bk,
    org,
    formData.agency_id,
    formData.bh_id,
    t,
    i18n.language,
  ]);

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
    page,
    rowsPerPage,
    searchTrigger,
    agency,
    bh,
    bk,
    org,
  ]);

  const mapUsageLogRows = useCallback(
    async (data: UsageLog[]): Promise<UsageLog[]> => {
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
            idcard: user?.idcard ?? "-",
            title:  titleData 
              ? i18n.language === "th"
                ? titleData.title_abbr_th
                : titleData.title_abbr_en
              : "",
            firstname: user?.firstname ?? "-",
            lastname: user?.lastname ?? "-",
            ou_name: agencyData
              ? i18n.language === "th"
                ? agencyData.ou_abbr_th
                : agencyData.ou_abbr_en
              : "-",
            bh_name: bhData
              ? i18n.language === "th"
                ? bhData.bh_abbr_th
                : bhData.bh_abbr_en
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
    [title, agency, bh, bk, org, i18n.language]
  );

  const fetchData = useCallback(
    async (filterData: FormData = formData) => {
      try {
        setIsLoading(true);

        const res = await searchUsageLogs(
          {},
          {
            groupBy: "user_id",
            limit: rowsPerPage.toString(),
            page: page.toString(),
            orderBy: "user_id",
            ...getFilters(filterData),
          }
        );

        const updatedRows = await mapUsageLogRows(res.data);

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
    [formData, page, title, agency, rowsPerPage, bh, bk, org, i18n.language]
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

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFormData({
      title_id: "0",
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
    try {
      setExportLoading(true);

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

        setExportProgress({
          text: t("text.export-pdf"),
          current: 0,
          total: totalFiles,
          percent: 0,
        });

        for (let page = 1; page <= totalFiles; page++) {
          const res = await searchUsageLogs(
            {},
            {
              limit: CHUNK_SIZE.toString(),
              page: page.toString(),
              ...getFilters(formData),
            }
          );

          const formattedData = await mapUsageLogRows(res.data);

          const fileName = `${t(
            "file-name.statistic-usage-person"
          )}_${startDate}_${endDate}_${page}.pdf`;

          const blob = await generateStatisticUsagePersonPdfBlob(
            buildPdfData(formattedData),
            t,
            i18n
          );

          zip.file(fileName, blob);

          setExportProgress({
            text: t("text.export-excel"),
            current: page,
            total: totalFiles,
            percent: Math.round((page / totalFiles) * 100),
          });

          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });

        saveAs(
          zipBlob,
          `PDF_${t("file-name.statistic-usage-person")}_${dayjs().format(
            "YYYY-MM-DD"
          )}.zip`
        );

        return;
      }

      const res = await searchUsageLogs(
        {},
        {
          limit: REQUEST_LIMIT.toString(),
          page: "1",
          ...getFilters(formData),
        }
      );

      const exportRows = await mapUsageLogRows(res.data);

      const pdfName = `${t(
        "file-name.statistic-usage-person"
      )}_${startDate}_${endDate}.pdf`;

      await downloadStatisticUsagePersonPdf(
        buildPdfData(exportRows),
        pdfName,
        t,
        i18n
      );
    } 
    catch (error) {
      await PopupMessage(
        t("popup.export-error-title"),
        t("popup.export-error-message"),
        "error"
      );
    } 
    finally {
      setExportLoading(false);
    }
  };

  const buildPdfData = (personUsage: UsageLog[]): PersonUsagePdfData => {
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
      start_date: dayjs(formData.start_date_time).format(
        i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY"
      ),
      end_date: dayjs(formData.end_date_time).format(
        i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY"
      ),
      personUsage,
    };
  };

  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      const dateFormat = i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD";

      const startDate = dayjs(formData.start_date_time).format(dateFormat);
      const endDate = dayjs(formData.end_date_time).format(dateFormat);

      const baseFileName = `${t(
        "file-name.statistic-usage-person"
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

        setIsLoading(true);

        const zip = new JSZip();
        const totalFiles = Math.ceil(totalData / CHUNK_SIZE);

        setExportProgress({
          text: t("text.export-excel"),
          current: 0,
          total: totalFiles,
          percent: 0,
        });

        for (let pageIndex = 1; pageIndex <= totalFiles; pageIndex++) {
          const res = await searchUsageLogs(
            {},
            {
              groupBy: "user_id",
              limit: CHUNK_SIZE.toString(),
              page: pageIndex.toString(),
              orderBy: "user_id",
              ...getFilters(formData),
            }
          );

          const exportRows = await mapUsageLogRows(res.data);

          const blob = await generateExcelBlob({
            sheetName: t("file-name.statistic-usage-person"),
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

          setExportProgress({
            text: t("text.export-excel"),
            current: pageIndex,
            total: totalFiles,
            percent: Math.round((pageIndex / totalFiles) * 100),
          });

          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `Excel_${baseFileName}.zip`);

        return;
      }

      const res = await searchUsageLogs(
        {},
        {
          groupBy: "user_id",
          limit: REQUEST_LIMIT.toString(),
          page: "1",
          orderBy: "user_id",
          ...getFilters(formData),
        }
      );

      const exportRows = await mapUsageLogRows(res.data);

      await exportExcel({
        sheetName: t("file-name.statistic-usage-person"),
        fileName: `${baseFileName}.xlsx`,
        headers,
        data: exportRows,
        mapRow,
        columnStyles,
      });
    } 
    catch (error) {
      await PopupMessage(
        t("popup.export-error-title"),
        t("popup.export-error-message"),
        "error"
      );
    } 
    finally {
      setExportLoading(false);
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

  const showDetailDialog = (data: UsageLog) => {
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
          pid: selectedData?.idcard ?? "",
          name: selectedData?.firstname && selectedData?.lastname ? `${selectedData.firstname} ${selectedData.lastname}` : "",
          prefix_id: selectedData?.title ?? "",
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

    if (data.org_id !== "0") {
      filters.org_code = data.org_id;
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

  return (
    <section id='statistic-usage-person' className="flex flex-col h-full w-full p-2">
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
      <MainTitle title={t("pages.statistic-usage-person")} />
      <div className='p-4 bg-(--main-bg-color) flex flex-1 flex-col gap-4 min-h-0 w-full rounded-lg border border-(--primary-color) overflow-y-auto'>
        {/* Search Filters */}
        <Box 
          className="grid grid-cols-[repeat(9,minmax(0,1fr))_180px] border border-(--primary-color) rounded-[10px] p-4 gap-2 bg-(--tertiary-color)"
          sx={{
            boxShadow: "0px 2px 8px rgba(var(--tertiary-color-rgb),0.1)"
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
            onKeyPress={handleSearchOnEnter}
          />

          <div className='flex col-span-2 gap-2'>
            <div className='w-[60%]'>
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
              onKeyPress={handleSearchOnEnter}
            />
          </div>

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
                    sx={{ color: "#FFFFFF", width: "10%" }}
                  >
                    {t('table.header.first-name-last-name')}
                  </TableCell>
                  <TableCell
                    sx={{ color: "#FFFFFF", width: "10%" }}
                  >
                    {t('table.header.pid-full')}
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
                    onClick={() => {
                      showDetailDialog(data);
                    }}
                    sx={{
                      "& .MuiTableCell-root": {
                        backgroundColor: selectedData?.log_id === data.log_id ? "rgba(var(--primary-color-rgb), 0.3)" : "var(--tertiary-color)",
                        color: "var(--secondary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      }
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
                      {`${data.title || ""}${data.firstname} ${data.lastname}`}
                    </TableCell>
                    <TableCell>
                      {data.idcard}
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
                    <p>{(selectedData?.total || 0).toLocaleString()}</p>

                    <p>{t('text.first-name-last-name')}</p>
                    <p>:</p>
                    <p>{`${selectedData?.title || ""}${selectedData?.firstname} ${selectedData?.lastname}`}</p>

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