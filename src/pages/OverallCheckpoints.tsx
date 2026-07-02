import { useEffect, useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";
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
import MainTitle from "../components/main-title/MainTitle";
import AutoComplete from "../components/auto-complete/AutoComplete";
import PaginationComponent from "../components/pagination/Pagination";
import TextBox from "../components/text-box/TextBox";
import Loading from "../components/loading-screen/LoadingScreen";
import ExportLoadingScreen from "../components/loading-screen/ExportLoadingScreen";
import GroupExportButton from "../components/group-export-button/GroupExportButton";

// Icons
import ClearIcon from "../assets/svg/clear.svg?react";
import DatabaseOnline from "../assets/icons/database-online.png";
import DatabaseOffline from "../assets/icons/database-offline.png";
import WifiIcon from "../assets/svg/wifi.svg?react";

// Constants
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

// Types
import type { Camera, ColumnOption, Project } from "../types/common";
import type { OverallCheckpointsPdfData } from "../types/pdf";

// Utils
import {
  exportExcel,
  generateExcelBlob,
} from "../utils/exportData";
import { buildOptions } from "../utils/commonFunctions";
import {
  PopupMessage,
  PopupMessageWithCancel,
} from "../utils/popupMessage";

// Hooks
import { useColumn } from "../hooks/useColumn";
import useExportProgress from "../hooks/useExportProgress";

// PDF
import {
  downloadOverallCheckpointsPdf,
  generateOverallCheckpointsPdfBlob,
} from "../pdf/OverallCheckpointPdf";

// Hooks
import usePageTitle from "../hooks/usePageTitle";

// Store
import type { RootState } from "../store/store";

// API
import { getOverallCheckpoint } from "../features/overall/api/OverallApi";
import { getDistrict, getSubdistrict, getPoliceStation, getProject } from "../features/dropdown/api/DropdownApi";
import { getCheckpoints } from "../features/core-data/api/CoreDataApi";

// i18n
import { useTranslation } from 'react-i18next';

interface FormData {
  search: string;
  area_id: string;
  province_id: string;
  project_id: string;
}

const OverallCheckpoints = () => {
  const column = useColumn();

  // i18n
  const { t, i18n } = useTranslation();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Data
  const [totalItems, setTotalItems] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [rows, setRows] = useState<Camera[]>([]);
  const [project, setProject] = useState<Project[]>([]);

  // Options
  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>(column);

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

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    search: "",
    area_id: "",
    province_id: "0",
    project_id: "0",
  });

  const columnKeyMap: Record<string, keyof typeof rows[0]> = {
    camera: "camera_name",
    station: "police_station_name",
    area: "police_region_name",
    province: "province_name",
    district: "district_name",
    subdistrict: "subdistrict_name",
    road: "route",
    route: "lane",
    project: "project_name",
  };

  // CONSTANTS
  const CHUNK_SIZE = 1000;
  const REQUEST_LIMIT = 1000;

  // Slice
  const { area, province } = useSelector((state: RootState) => state.dropdown);

  usePageTitle(t("pages.overall-checkpoints"));

  const {
    exportLoading,
    exportProgress,
    startExportLoading,
    stopExportLoading,
    updateExportProgress,
  } = useExportProgress();

  const areaOptions = useMemo(() => {
    const langKeyArea = i18n.language === "th" ? "title_th" : "title_en";
    return buildOptions(area, t("dropdown.all-area"), langKeyArea, "id", true, "");
  }, [area, t, i18n.language]);

  const provinceOptions = useMemo(() => {
    const langKeyProvince = i18n.language === "th" ? "name_th" : "name_en";
    const filteredProvince =
      formData.area_id !== ""
        ? province.filter((item) => item.police_region_id === Number(formData.area_id))
        : province;
    return buildOptions(
        filteredProvince, t('dropdown.all-province'), 
        langKeyProvince,
        "province_code");
  }, [province, t, i18n.language, formData.area_id]);

  const projectOptions = useMemo(() => {
    const langKeyProject = "project_name";
    const filteredProject =
      formData.province_id !== "0"
        ? project.filter((item) => item.province_code === formData.province_id)
        : project;

    return buildOptions(filteredProject, t("dropdown.all-bk"), langKeyProject, "project_id")
  }, [project, t, i18n.language, formData.province_id]);

  const fetchProjectList = useCallback(async (provinceCode?: string) => {
    try {
      const params =
        provinceCode && provinceCode !== "0"
          ? { province_code: provinceCode }
          : undefined;

      const res = await getProject(params);
      setProject(res.data ?? []);
    } catch (error) {
      setProject([]);
    }
  }, []);

  useEffect(() => {
    fetchProjectList(formData.province_id);
  }, [fetchProjectList, formData.province_id]);

  useEffect(() => {
    setColumnOptions(column);
  }, [column, t, i18n.language, i18n.isInitialized]);

  const fetchData = useCallback(async (filterData: FormData = formData) => {
    try {
      setIsLoading(true);

      const res = await getOverallCheckpoint(
        {
          ...getFilters(filterData),
        }
      );
      const cameras = res.data ?? [];

      const updated = await mapCameraRows(cameras);

      setRows(updated);
      setTotalItems(updated.length);
      setTotalData(res.pagination?.countAll ?? 0);
      setTotalUsage(updated.length);
      setTotalPages(
        Math.ceil(updated.length / rowsPerPage)
      );
    } 
    catch (error) {
      await PopupMessage(
        t("popup.fetch-error"),
        "",
        "error"
      );

      setRows([]);
      setTotalItems(0);
      setTotalUsage(0);
      setTotalPages(1);
      setTotalData(0);
    } 
    finally {
      setIsLoading(false);
    }
  }, [
    area,
    province,
    i18n.language,
    rowsPerPage,
    t,
  ]);

  useEffect(() => {
    fetchData();
  }, [
    fetchData,
    page,
    rowsPerPage,
    searchTrigger,
    formData.province_id,
    formData.project_id,
    formData.area_id,
  ]);

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const keyword =
        formData.search.toLowerCase();

      const matchesSearch =
        !keyword ||
        [
          item.camera_name,
          item.project_name,
          item.province_name,
          item.district_name,
          item.subdistrict_name,
          item.police_station_name,
          item.checkpoint_name,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchesArea =
        !formData.area_id ||
        String(item.police_region_id) ===
          formData.area_id;

      const matchesProvince =
        formData.province_id === "0" ||
        item.province_code ===
          formData.province_id;

      const matchesProject =
        formData.project_id === "0" ||
        String(item.project_id) ===
          formData.project_id;

      return (
        matchesSearch &&
        matchesArea &&
        matchesProvince &&
        matchesProject
      );
    });
  }, [rows, formData]);

  const paginatedRows = useMemo(() => {
    const start =
      (page - 1) * rowsPerPage;

    return filteredRows.slice(
      start,
      start + rowsPerPage
    );
  }, [filteredRows, page, rowsPerPage]);

  useEffect(() => {
    setPage(1);

    setTotalItems(filteredRows.length);
    setTotalUsage(filteredRows.length);
    setTotalPages(
      Math.max(
        1,
        Math.ceil(
          filteredRows.length / rowsPerPage
        )
      )
    );
  }, [filteredRows, rowsPerPage]);

  const mapCameraRows = useCallback(
    async (cameras: Camera[]) => {
      const districtCache = new Map<string, any>();
      const subdistrictCache = new Map<string, any>();
      const stationCache = new Map<string, any>();
      const projectCache = new Map<string, any>();
      const checkpointCache = new Map<string, any>();

      await Promise.all(
        cameras.map(async (item) => {
          const districtKey =
            `${item.province_code}_${item.district_code}`;

          const subdistrictKey =
            `${item.province_code}_${item.district_code}_${item.subdistrict_code}`;

          const stationKey = String(item.police_station_id);
          const projectKey = String(item.project_id);
          const checkpointKey = String(item.checkpoint_id);

          const requests: Promise<void>[] = [];

          if (!districtCache.has(districtKey)) {
            requests.push(
              getDistrict({
                filter:
                  `province_code=${item.province_code},district_code=${item.district_code}`,
              }).then((res) => {
                districtCache.set(districtKey, res.data?.[0]);
              })
            );
          }

          if (!subdistrictCache.has(subdistrictKey)) {
            requests.push(
              getSubdistrict({
                filter:
                  `province_code=${item.province_code},district_code=${item.district_code},subdistrict_code=${item.subdistrict_code}`,
              }).then((res) => {
                subdistrictCache.set(
                  subdistrictKey,
                  res.data?.[0]
                );
              })
            );
          }

          if (!stationCache.has(stationKey)) {
            requests.push(
              getPoliceStation({
                filter: `id=${item.police_station_id}`,
              }).then((res) => {
                stationCache.set(
                  stationKey,
                  res.data?.[0]
                );
              })
            );
          }

          if (!projectCache.has(projectKey)) {
            requests.push(
              getProject({
                filter: `project_id=${item.project_id}`,
              }).then((res) => {
                projectCache.set(
                  projectKey,
                  res.data?.[0]
                );
              })
            );
          }

          if (!checkpointCache.has(checkpointKey)) {
            requests.push(
              getCheckpoints({
                filter: `checkpoint_id=${item.checkpoint_id}`,
              }).then((res) => {
                checkpointCache.set(
                  checkpointKey,
                  res.data?.[0]
                );
              })
            );
          }

          await Promise.all(requests);
        })
      );

      const updated = cameras.map((item) => {
        const district =
          districtCache.get(
            `${item.province_code}_${item.district_code}`
          );

        const subdistrict =
          subdistrictCache.get(
            `${item.province_code}_${item.district_code}_${item.subdistrict_code}`
          );

        const station =
          stationCache.get(
            String(item.police_station_id)
          );

        const project =
          projectCache.get(
            String(item.project_id)
          );

        const checkpoint =
          checkpointCache.get(
            String(item.checkpoint_id)
          );

        const provinceData = province.find(
          (p) => p.province_code === item.province_code
        );

        const areaData = area.find(
          (a) =>
            a.id === Number(item.police_region_id)
        );

        return {
          ...item,
          province_name:
            i18n.language === "th"
              ? provinceData?.name_th ?? "-"
              : provinceData?.name_en ?? "-",

          district_name:
            i18n.language === "th"
              ? district?.name_th ?? "-"
              : district?.name_en ?? "-",

          subdistrict_name:
            i18n.language === "th"
              ? subdistrict?.name_th ?? "-"
              : subdistrict?.name_en ?? "-",

          police_region_name:
            i18n.language === "th"
              ? areaData?.title_th ?? "-"
              : areaData?.title_en ?? "-",

          checkpoint_name:
            checkpoint?.checkpoint_name ?? "-",

          police_station_name:
            station?.station_name ?? "-",

          project_name:
            project?.project_name ?? "-",
        };
      });

      return updated;
    },
    [
      area,
      province,
      i18n.language,
    ]
  )

  const handleDropdownChange = (
    event: React.SyntheticEvent,
    key: keyof typeof formData,
    value: { value: any ,label: string } | null,
  ) => {
    event.preventDefault();
    setFormData((prev) => {
      const next: FormData = {
        ...prev,
        [key]: key === "area_id" ? value?.value ?? "" : value?.value ?? "0",
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

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFormData({
      search: "",
      area_id: "",
      province_id: "0",
      project_id: "0",
    });
  }

  const handleExportExcel = async () => {
    try {
      startExportLoading();

      const dateFormat =
        i18n.language === "th"
          ? "BBBB-MM-DD"
          : "YYYY-MM-DD";

      const baseFileName =
        `${t("file-name.overall-checkpoints")}_${dayjs().format(dateFormat)}`;

      const headers = [
        t("table.header.no"),
        t("table.header.camera"),
        t("table.header.station"),
        t("table.header.area"),
        t("table.header.province"),
        t("table.header.district"),
        t("table.header.subdistrict"),
        t("table.header.road"),
        t("table.header.route"),
        t("table.header.project"),
      ];

      const mapRow = (
        data: Camera,
        index: number
      ) => [
        index + 1,
        data.camera_name ?? "-",
        data.checkpoint_name ?? "-",
        data.police_station_name ?? "-",
        data.police_region_name ?? "-",
        data.province_name ?? "-",
        data.district_name ?? "-",
        data.subdistrict_name ?? "-",
        data.route ?? "-",
        data.lane === "1"
          ? t("text.exit")
          : t("text.in"),
        data.project_name ?? "-",
      ];

      if (totalData > CHUNK_SIZE) {
        const isConfirmed =
          await PopupMessageWithCancel(
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

          const blob =
            await generateExcelBlob(
              {
                sheetName: t("file-name.overall-checkpoints"),
                headers,
                data: exportRows,
                mapRow: ( data, index ) =>
                  mapRow(data, index * CHUNK_SIZE + pageIndex),
              }
            );

          zip.file(
            `${baseFileName}_${pageIndex + 1}.xlsx`,
            blob
          );

          updateExportProgress(
            t("text.export-excel"),
            pageIndex,
            totalFiles,
            Math.round((pageIndex / totalFiles) * 100 )
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
        sheetName: t("file-name.overall-checkpoints"),
        fileName: `${baseFileName}.xlsx`,
        headers,
        data: exportRows,
        mapRow,
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

  const handleExportPdf = async () => {
    try {
      startExportLoading();

      const dateFormat =
        i18n.language === "th"
          ? "BBBB-MM-DD"
          : "YYYY-MM-DD";

      const baseFileName =
        `${t("file-name.overall-checkpoints")}_${dayjs().format(dateFormat)}`;

      if (totalData > CHUNK_SIZE) {
        const isConfirmed =
          await PopupMessageWithCancel(
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
          0
        );

        for (let pageIndex = 1; pageIndex <= totalFiles; pageIndex++) {
          const exportRows = await getExportData(CHUNK_SIZE, pageIndex);

          const pdfData =
            exportRows.map(
              (data) => ({
                ...data,
                id:
                  data.camera_id,
                checkpoint_name:
                  data.checkpoint_name ??
                  "-",
                camera_name:
                  data.camera_name ??
                  "-",
                station_name:
                  data.police_station_name ??
                  "-",
                area_name:
                  data.police_region_name ??
                  "-",
                province_name:
                  data.province_name ??
                  "-",
                district_name:
                  data.district_name ??
                  "-",
                subdistrict_name:
                  data.subdistrict_name ??
                  "-",
                road:
                  data.route ??
                  "-",
                route:
                  data.lane ??
                  "-",
                project:
                  data.project_name ??
                  "-",
              })
            );

          const blob =
            await generateOverallCheckpointsPdfBlob(
              pdfData,
              t,
              i18n
            );

          zip.file(
            `${baseFileName}_${pageIndex}.pdf`,
            blob
          );

          updateExportProgress(
            t("text.export-pdf"),
            pageIndex,
            totalFiles,
            Math.round(
              (pageIndex /
                totalFiles) *
                100
            )
          );

          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const zipBlob =
          await zip.generateAsync({
            type: "blob",
          });

        saveAs(
          zipBlob,
          `PDF_${baseFileName}.zip`
        );

        return;
      }

      const exportRows = await getExportData(REQUEST_LIMIT, 1);

      updateExportProgress(
        t("text.export-pdf"),
        1,
        1,
        80
      );

      const pdfData: OverallCheckpointsPdfData[] =
        exportRows.map((data) => ({
          ...data,
          id: data.camera_id,
          checkpoint_name:
            data.checkpoint_name ??
            "-",
          camera_name:
            data.camera_name ??
            "-",
          station_name:
            data.police_station_name ??
            "-",
          area_name:
            data.police_region_name ??
            "-",
          province_name:
            data.province_name ??
            "-",
          district_name:
            data.district_name ??
            "-",
          subdistrict_name:
            data.subdistrict_name ??
            "-",
          road:
            data.route ?? "-",
          route:
            data.lane ?? "-",
          project:
            data.project_name ??
            "-",
        }));

      await downloadOverallCheckpointsPdf(
        pdfData,
        `${baseFileName}.pdf`,
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

  const handleColumnSelectChange = (key: string) => {
    setColumnOptions((prev) =>
      prev.map((option) =>
        option.key === key
          ? { ...option, checked: !option.checked }
          : option
      )
    );
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

  const visibleColumns = columnOptions.filter((col) => col.checked);

  const formatCellValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined || value === "") return "-";

    if (typeof value === "boolean") return value ? "true" : "false";

    if (typeof value === "string" || typeof value === "number") return value;

    if (Array.isArray(value)) return value.join(", ");

    if (
      typeof value === "object" &&
      "lat" in value &&
      "lng" in value
    ) {
      const latLng = value as { lat: number; lng: number };
      return `${latLng.lat}, ${latLng.lng}`;
    }

    return "-";
  };

  const getExportData = async (
    limit: number,
    page: number,
    otherFilters: Record<string, string> = {},
  ) => {
    const res = await getOverallCheckpoint({
      page: page.toString(),
      limit: limit.toString(),
      ...otherFilters,
    });

    const cameras = res.data ?? [];

    const mapped = await mapCameraRows(cameras);

    return mapped
  };

  const handleSearchOnEnter = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      setPage(1);
      setSearchTrigger((prev) => prev + 1);
    }
  };

  const getFilters = useCallback((formData: FormData) => {
    const filters: Record<string, string> = {
      page: page.toString(),
      limit: rowsPerPage.toString(),
    };

    if (formData.area_id !== "") {
      filters.police_region_id = formData.area_id;
    }

    if (formData.province_id !== "0") {
      filters.province_code = formData.province_id;
    }

    if (formData.project_id !== "0") {
      filters.project_id = formData.project_id;
    }

    if (formData.search) {
      filters.camera_name = `*${formData.search}*`;
    }
    return filters;
  }, [
    formData.area_id,
    formData.province_id,
    formData.project_id,
    searchTrigger,
  ])

  return (
    <section id='overall-checkpoints' className="flex flex-col h-full w-full p-2">
      { isLoading && <Loading /> }
      {
        exportLoading && (
          <ExportLoadingScreen
            text={exportProgress.text}
            current={exportProgress.current}
            total={exportProgress.total}
            percent={exportProgress.percent}
          />
        )
      }
      {/* Main Title */}
      <MainTitle title={t("pages.overall-checkpoints")} />
      <div className='flex flex-col p-4 bg-(--main-bg-color) flex-1 min-h-0 w-full rounded-lg border border-(--primary-color) overflow-y-auto gap-2'>
        {/* Search Filters */}
        <Box
          className="border border-(--primary-color) rounded-[10px] p-4 gap-2 bg-(--tertiary-color)"
          sx={{
            boxShadow: "0px 2px 8px rgba(var(--tertiary-color-rgb),0.1)",
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
              xl: "repeat(5, minmax(0, 1fr)) 180px",
            },
            "& h6": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        >
          <Box className="col-span-2">
            <TextBox
              sx={{ marginTop: "5px", fontSize: "15px" }}
              id="word-searching"
              label={t('component.search')}
              placeholder={t('placeholder.search')}
              labelFontSize="14px"
              value={formData.search}
              onChange={(event) =>
                handleTextChange("search", event.target.value)
              }
              onKeyDown={handleSearchOnEnter}
            />
          </Box>

          <AutoComplete 
            id="area-select"
            sx={{ marginTop: "5px"}}
            value={formData.area_id}
            onChange={(event, value) => handleDropdownChange(event, "area_id", value)}
            options={areaOptions}
            label={t('component.area')}
            placeholder={t('placeholder.area')}
            labelFontSize="14px"
          />

          <AutoComplete 
            id="province-select"
            sx={{ marginTop: "5px"}}
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
            label={t('component.project')}
            placeholder={t('placeholder.project')}
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
                color: "var(--tertiary-color)",
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
          isShowColumn={true}
          columnOptions={columnOptions}
          onToggleColumn={handleColumnSelectChange}
        />
        <Box sx={{ width: '100%' }}>
          <TableContainer
            component={Paper}
          >
            <Table
              sx={{ minWidth: 650, backgroundColor: "var(--tertiary-color)", border: "1px solid var(--primary-color)" }}
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
                  <TableCell align="center" width={"2%"}>{t('table.header.no')}</TableCell>
                  <TableCell align="center" width={"5%"}>{t('table.header.status')}</TableCell>
                  <TableCell align="center" width={"8%"}>{t('table.header.camera-checkpoint')}</TableCell>

                  {visibleColumns.map((col) => (
                    <TableCell key={col.key} align="center" width={"8%"}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "var(--tertiary-color)" }}>
                {paginatedRows.map((data, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "& .MuiTableCell-root": {
                        backgroundColor: "var(--tertiary-color)",
                        color: "var(--secondary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        p: "8px 1px",
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
                      <Box className="flex items-center justify-center gap-2">
                        <img src={data.active ? DatabaseOnline : DatabaseOffline} alt="Database Status" className="h-6 w-6" />
                        <WifiIcon className="h-6 w-6" color={data.alive ? "#2FA534" : "#DD2025"} />
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{
                        textAlign: "center",
                      }}
                    >
                      {data.camera_name}
                    </TableCell>
                    {visibleColumns.map((col) => {
                      const field = columnKeyMap[col.key];
                      const rawValue = data[field];

                      let value: React.ReactNode = formatCellValue(rawValue);
                      if (field === "lane") {
                        value = value === "1" ? t('text.exit') : t('text.in')
                      }

                      return (
                        <TableCell 
                          key={col.key}
                          sx={{
                            textAlign: "center",
                          }}
                        >
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {paginatedRows.length === 0 && (
                  <TableRow
                    sx={{
                      "& .MuiTableCell-root": {
                        backgroundColor: "var(--tertiary-color)",
                        color: "var(--secondary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                      },
                    }}
                  >
                    <TableCell colSpan={3 + visibleColumns.length} align="center">
                      {t("text.data-not-found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>
    </section>
  )
}

export default OverallCheckpoints;