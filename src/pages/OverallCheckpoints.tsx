import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
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
import MainTitle from "../components/main-title/MainTitle";
import AutoComplete from "../components/auto-complete/AutoComplete";
import PaginationComponent from "../components/pagination/Pagination";
import TextBox from "../components/text-box/TextBox";
import Loading from "../components/loading-screen/LoadingScreen";

// Icons
import ClearIcon from "../assets/icons/clear.png";
import ExportExcelIcon from "../assets/icons/export-excel.png";
import ExportPdfIcon from "../assets/icons/export-pdf.png";
import DatabaseOnline from "../assets/icons/database-online.png";
import DatabaseOffline from "../assets/icons/database-offline.png";
import WifiIcon from "../assets/svg/wifi.svg?react";

// Constants
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

// Types
import type { OverallCheckpointType, ColumnOption } from "../types/common";
import type { OverallCheckpointsPdfData } from "../types/pdf";

// Utils
import { exportExcel } from "../utils/exportData";
import { buildOptions } from "../utils/commonFunctions";
import { PopupMessage } from '../utils/popupMessage';

// Hooks
import { useColumn } from "../hooks/useColumn";

// PDF
import {
  downloadOverallCheckpointsPdf,
} from "../pdf/OverallCheckpointPdf";

// Hooks
import usePageTitle from "../hooks/usePageTitle";

// Store
import type { RootState } from "../store/store";

// API
import { getOverallCheckpoint } from "../features/overall/api/OverallApi";

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

  // Data
  const [totalItems, setTotalItems] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [rows, setRows] = useState<OverallCheckpointType[]>([]);
  const [selectedData, setSelectedData] = useState<OverallCheckpointType | null>(null);

  // Options
  const [areaOptions, setAreaOptions] = useState<{ label: string, value: string }[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<{ label: string, value: string }[]>([]);
  const [projectOptions, setProjectOptions] = useState<{ label: string, value: string }[]>([]);
  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>(column);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    ROWS_PER_PAGE_OPTIONS[0],
  );
  const [rowsPerPageOptions] = useState(
    ROWS_PER_PAGE_OPTIONS
  );

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    search: "",
    area_id: "0",
    province_id: "0",
    project_id: "0",
  });

  const columnKeyMap: Record<string, keyof typeof rows[0]> = {
    camera: "name_display",
    station: "police_checkpoint",
    area: "police_station",
    province: "province",
    district: "district",
    subdistrict: "sub_district",
    road: "route",
    route: "lane",
    project: "project_name",
  };

  // Slice
  const { area, province, project } = useSelector((state: RootState) => state.dropdown);

  usePageTitle(t("pages.overall-checkpoints"));

  useEffect(() => {
    const langKeyArea = i18n.language === "th" ? "title_th" : "title_en";
    const langKeyProvince = i18n.language === "th" ? "name_th" : "name_en";
    const langKeyProject = "project_name";

    setAreaOptions(
      buildOptions(area, t("dropdown.all-area"), langKeyArea, "id")
    );

    const filteredProvince =
      formData.area_id !== "0"
        ? province.filter((item) => item.police_region_id === Number(formData.area_id))
        : province;
    setProvinceOptions(
      buildOptions(
        filteredProvince, t('dropdown.all-province'), 
        langKeyProvince,
        "province_code")
      );

    const filteredProject = 
      formData.province_id !== "0"
        ? project.filter((item) => item.province_code === formData.province_id)
        : project;
    setProjectOptions(buildOptions(filteredProject, t('dropdown.all-project'), langKeyProject, "project_id"));
  }, [area, province, project, t, formData.area_id, i18n.language, i18n.isInitialized]);

  useEffect(() => {
    setColumnOptions(column);
  }, [column, t, i18n.language, i18n.isInitialized])

  useEffect(() => {
    fetchData();
  }, [formData]);

  const fetchData = useCallback(
    async () => {
      try {
        setIsLoading(true);
        const res = await getOverallCheckpoint();
        setRows(res.data);
      }
      catch (error) {
        await PopupMessage(t("popup.fetch-error"), "", "error");
        setRows([]);
        setTotalUsage(0);
        setTotalItems(0);
        setTotalPages(1);
      } 
      finally {
        setIsLoading(false);
      }
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

  const handleClear = () => {
    setFormData({
      search: "",
      area_id: "0",
      province_id: "0",
      project_id: "0",
    });
  }

  const handleExportExcel = async () => {
    await exportExcel({
      sheetName: `${t('file-name.overall-checkpoints')}`,
      fileName: `${t('file-name.overall-checkpoints')}_${dayjs().format(i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD")}.xlsx`,
      headers: [
        t('table.header.no'),
        t('table.header.camera'),
        t('table.header.station'),
        t('table.header.area'),
        t('table.header.province'),
        t('table.header.district'),
        t('table.header.subdistrict'),
        t('table.header.road'),
        t('table.header.route'),
        t('table.header.project'),
      ],
      data: rows,
      mapRow: (data, index) => [
        (page - 1) * rowsPerPage + index + 1,
        data.name_display,
        data.police_checkpoint,
        data.police_station,
        data.police_division_name,
        data.province,
        data.district,
        data.sub_district,
        data.route,
        data.lane,
        data.project_name,
      ],
      columnStyles: {
        2: { alignment: { horizontal: "center" } },
      },
    });
  };

  const handleExportPdf = async () => {
    const pdfName = `${t('file-name.overall-checkpoints')}_${dayjs().format(i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD")}.pdf`;
    const pdfData: OverallCheckpointsPdfData[] = rows.map((data) => ({
      ...data,
      id: data.id,
      checkpoint_name: data.police_checkpoint,
      camera_name: data.name_display,
      station_name: data.police_station,
      area_name: data.police_division_name,
      province_name: data.province,
      district_name: data.district,
      subdistrict_name: data.sub_district,
      road: data.route,
      route: data.lane,
      project: data.project_name,
    }));
    await downloadOverallCheckpointsPdf(
      pdfData,
      pdfName,
      t,
      i18n
    );
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

  return (
    <section id='overall-checkpoints' className="flex flex-col h-full w-full p-2">
      { isLoading && <Loading /> }
      {/* Main Title */}
      <MainTitle title={t("pages.overall-checkpoints")} />
      <div className='flex flex-col p-4 bg-(--main-bg-color)/80 flex-1 min-h-0 w-full rounded-lg border border-(--primary-color) overflow-y-auto gap-2'>
        {/* Search Filters */}
        <Box 
          className="grid grid-cols-[repeat(5,minmax(0,1fr))_180px] border border-(--primary-color) rounded-[10px] p-4 gap-2 bg-(--secondary-color)"
          sx={{
            boxShadow: "0px 2px 8px rgba(var(--secondary-color-rgb),0.1)",
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
          isShowColumn={true}
          columnOptions={columnOptions}
          onToggleColumn={handleColumnSelectChange}
        />
        <Box sx={{ width: '100%' }}>
          <TableContainer
            component={Paper}
          >
            <Table
              sx={{ minWidth: 650, backgroundColor: "var(--secondary-color)", border: "1px solid var(--primary-color)" }}
              stickyHeader
            >
              <TableHead
                sx={{
                  "& .MuiTableCell-head": {
                    color: "white",
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
                        p: "8px 1px",
                      }}
                    >
                      {((page - 1) * rowsPerPage) + index + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        textAlign: "center",
                        p: "8px 1px",
                      }}
                    >
                      <Box className="flex items-center justify-center gap-2">
                        <img src={data.data_status === "online" ? DatabaseOnline : DatabaseOffline} alt="Database Status" className="h-6 w-6" />
                        <WifiIcon className="h-6 w-6" color={data.network_status === "online" ? "#2FA534" : "#DD2025"} />
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--tertiary-color)",
                        borderBottom: "1px solid var(--primary-color)",
                        textAlign: "center",
                        p: "8px 1px",
                      }}
                    >
                      {data.name_display}
                    </TableCell>
                    {visibleColumns.map((col) => {
                      const field = columnKeyMap[col.key];

                      let value = data[field];

                      return (
                        <TableCell 
                          key={col.key}
                          sx={{
                            backgroundColor: "var(--secondary-color)",
                            color: "var(--tertiary-color)",
                            borderBottom: "1px solid var(--primary-color)",
                            textAlign: "center",
                            p: "8px 1px",
                          }}
                        >
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>
    </section>
  )
}

export default OverallCheckpoints;