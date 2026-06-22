import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Map as LeafletMap } from 'leaflet';
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from 'react-redux';

// Material UI
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

// Components
import BaseMap from '../components/base-map/BaseMap';
import AutoComplete from "../components/auto-complete/AutoComplete";
import TextBox from "../components/text-box/TextBox";
import LoadingScreen from '../components/loading-screen/LoadingScreen';

// Icons
import ClearIcon from "../assets/svg/clear.svg?react";
import { X } from "lucide-react";

// Hooks
import { useMapSearch } from "../hooks/useOpenStreetMapSearch";
import usePageTitle from "../hooks/usePageTitle";

// Store
import type { RootState } from "../store/store";

// Utils
import { buildOptions } from "../utils/commonFunctions";

// i18n
import { useTranslation } from 'react-i18next';

// API
import { searchDevice } from "../features/device/api/DeviceApi";
import { getCheckpoints } from "../features/core-data/api/CoreDataApi";
import { getDistrict, getSubdistrict } from "../features/dropdown/api/DropdownApi";

// Types
import type { CameraInCheckpoint } from "../types/common";

// Constant
import { DEVICE_STATUS_COLOR } from "../constants/color";

interface FormData {
  search_word: string;
  area_id: string;
  province_id: string;
  type_id: string;
}

const OverallMap = () => {

  // i18n
  const { t, i18n } = useTranslation();

  usePageTitle(t("pages.overall-map"));

  // State
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Data
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [cameraInCheckpoints, setCameraInCheckpoints] = useState<CameraInCheckpoint[]>([]);

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    search_word: "",
    area_id: "",
    province_id: "0",
    type_id: "0",
  });
  
  const { 
    showOverallWithList, 
    clearSearchPlaces,
  } = useMapSearch(map);

  // Slice
  const { area, province, deviceStatus } = useSelector((state: RootState) => state.dropdown);

  useEffect(() => {
    fetchData(formData);
  }, [
    area, 
    province, 
    deviceStatus,
    formData.area_id,
    formData.province_id,
    formData.type_id,
    searchTrigger,
    t,
    i18n.language,
    i18n.isInitialized,
  ])

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
      filteredProvince, t("dropdown.all-province"), 
      langKeyProvince, 
      "province_code");
  }, [province, t, i18n.language, formData.area_id]);

  const typeOptions = useMemo(() => {
    const langKeyDeviceStatus = i18n.language === "th" ? "status_th" : "status_en";

    return buildOptions(deviceStatus, t('dropdown.all-type'), langKeyDeviceStatus, "status_code")
  }, [deviceStatus, t, i18n.language]);

  // Map
  const areaMap = new Map(
    area.map(item => [item.id, item])
  );

  const provinceMap = new Map(
    province.map(item => [item.province_code, item])
  );

  const deviceStatusMap = new Map(
    deviceStatus.map(item => [item.status_code, item])
  );

  useEffect(() => {
    if (map && cameraInCheckpoints) {
      showOverallWithList(cameraInCheckpoints);
    }
  }, [map, t, i18n.language, i18n.isInitialized, cameraInCheckpoints]);

  const fetchData = useCallback(
    async (filterData: FormData = formData) => {
      try {
        setIsLoading(true);

        const resCheckpoint = await getCheckpoints();

        const resDevice: CameraInCheckpoint[] = await Promise.all(
          resCheckpoint.data.map(async (item) => {
            const res = await searchDevice(
              {
                ...getFilters(filterData, item.checkpoint_id),
              }
            );

            let resDistrict = null;
            let resSubdistrict = null;
            let provinceName = null;
            let areaName = null;

            if (res?.data) {
              resDistrict = await getDistrict({ filter: `province_code=${item.province_code},district_code=${item.district_code}` });
              resSubdistrict = await getSubdistrict({ filter: `province_code=${item.province_code},district_code=${item.district_code},subdistrict_code=${item.subdistrict_code}` });
              provinceName = provinceMap.get(item.province_code);            
              areaName = areaMap.get(item.police_region_id);
            }

            const updatedData = res?.data.map((device) => {
              const color = DEVICE_STATUS_COLOR.find((status) => status.code === device.device_status_code);
              const name = deviceStatusMap.get(device.device_status_code);

              return {
                ...device,
                device_status_id: color?.id,
                device_status_name: i18n.language === "th" ? name?.status_th ?? "-" : name?.status_en ?? "-",
              }
            });

            return {
              cameras: updatedData,
              checkpoint_id: item.checkpoint_id,
              checkpoint_name: item.checkpoint_name,
              province_code: item.province_code,
              province_name: i18n.language === "th" ? provinceName?.name_th ?? "-" : provinceName?.name_en ?? "-",
              district_code: item.district_code,
              district_name: i18n.language === "th" ? resDistrict.data[0]?.name_th ?? "-" : resDistrict.data[0]?.name_en ?? "-",
              subdistrict_code: item.subdistrict_code,
              subdistrict_name: i18n.language === "th" ? resSubdistrict.data[0]?.name_th ?? "-" : resSubdistrict.data[0]?.name_en ?? "-",
              police_station_id: item.police_station_id,
              police_station_name: i18n.language === "th" ? areaName?.title_abbr_th ?? "-" : areaName?.title_abbr_en ?? "-",
              latitude: item.latitude,
              longitude: item.longitude,
              total: res.pagination?.countAll ?? 0,
            };
          })
        );
        setCameraInCheckpoints(resDevice);
      } 
      catch (error) {
      } 
      finally {
        setIsLoading(false);
      }
    }, 
    [
    area, 
    province, 
    deviceStatus, 
    formData.area_id,
    formData.province_id,
    formData.type_id,
    searchTrigger,
    t,
    i18n.language,
    i18n.isInitialized,]
  );

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance)
  }, []);

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

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
      }

      return next;
    });
  };

  const handleClear = () => {
    setFormData({
      search_word: "",
      area_id: "",
      province_id: "0",
      type_id: "0",
    });
    clearSearchPlaces();
  }

  const handleSearchOnEnter = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      setSearchTrigger((prev) => prev + 1);
    }
  };

  const getFilters = useCallback((formData: FormData, checkpoint_id: string) => {
    const filters: Record<string, string> = {
      page: "1",
      limit: "1500",
      device_category: "camera",
      checkpoint_id: checkpoint_id,
    };

    if (formData.area_id !== "") {
      filters.police_region_id = formData.area_id;
    }

    if (formData.province_id !== "0") {
      filters.province_code = formData.province_id;
    }

    if (formData.type_id !== "0") {
      filters.device_status_code = formData.type_id;
    }

    if (formData.search_word) {
      filters.device_name = `*${formData.search_word}*`;
    }

    return filters;
  }, [
    formData.area_id,
    formData.province_id,
    formData.type_id,
    searchTrigger,
  ]);

  return (
    <section id='overall-map'>
      { isLoading && <LoadingScreen /> }
      <Box className="relative"
        sx={{
          height: "calc(100vh - 64px)",
        }}
      >
        <BaseMap 
          onMapLoad={handleMapLoad}
          zoomControl={true}
          fullscreenControl={true}
          currentLocation={true}
          searchFilter={true}
          mapStyle={true}
          showFilter={showFilter}
          onSearchFilterClick={() => setShowFilter(true)}
        />

        <AnimatePresence>
          {showFilter && (
            <motion.div 
              initial={{ x: -100, opacity: 0, scaleX: 0.5, originX: 0 }}
              animate={{ x: 0, opacity: 1, scaleX: 1 }}
              exit={{ x: -50, opacity: 0, scaleX: 0, transition: { duration: 0.2 } }}
              transition={{ 
                type: "spring", 
                stiffness: 100,
                damping: 15,
                mass: 1
              }}
              className="absolute top-0 left-0 z-1000"
            >
              <Box
                className="flex flex-col gap-2 relative border border-(--primary-color)"
                sx={{
                  zIndex: 1000,
                  backgroundColor: "rgba(var(--tertiary-color-rgb), 0.8)",
                  borderRadius: 2,
                  padding: "25px 15px 15px 15px",
                  boxShadow: 3,
                  width: 700,
                  margin: 1,
                }}
              >
                <Box className="absolute top-2 right-2 flex justify-end items-center w-full">
                  <X 
                    color="var(--primary-color)" 
                    className="w-4 h-4 cursor-pointer" 
                    onClick={() => setShowFilter(false)}
                  />
                </Box>
                <Box className="grid grid-cols-[repeat(4,minmax(0,1fr))_40px] items-end gap-2">
                  <TextBox
                    sx={{ marginTop: "5px", fontSize: "14px" }}
                    id="search-word"
                    label={""}
                    placeholder={t('placeholder.search-only')}
                    labelFontSize="14px"
                    value={formData.search_word}
                    onChange={(event) =>
                      handleTextChange("search_word", event.target.value)
                    }
                    minHeight='32px'
                    onKeyDown={handleSearchOnEnter}
                  />

                  <AutoComplete 
                    id="area-select"
                    sx={{ marginTop: "5px" }}
                    value={formData.area_id}
                    onChange={(event, value) => handleDropdownChange(event, "area_id", value)}
                    options={areaOptions}
                    label=""
                    placeholder={t('placeholder.area')}
                    labelFontSize="14px"
                  />

                  <AutoComplete 
                    id="province-select"
                    sx={{ marginTop: "5px" }}
                    value={formData.province_id}
                    onChange={(event, value) => handleDropdownChange(event, "province_id", value)}
                    options={provinceOptions}
                    label=""
                    placeholder={t('placeholder.province')}
                    labelFontSize="14px"
                  />

                  <AutoComplete 
                    id="type-select"
                    sx={{ marginTop: "5px" }}
                    value={formData.type_id}
                    onChange={(event, value) => handleDropdownChange(event, "type_id", value)}
                    options={typeOptions}
                    label=""
                    placeholder={t('placeholder.type')}
                    labelFontSize="14px"
                  />

                  <IconButton
                    sx={{
                      backgroundColor: "var(--primary-color)",
                      borderRadius: "5px",
                      width: "40px",
                      height: "40px",
                      ":hover": {
                        backgroundColor: "rgba(var(--primary-color-rgb), 0.8)",
                      },
                      textTransform: "capitalize",
                    }}
                    onClick={handleClear}
                  >
                    <ClearIcon className="h-6 w-6" style={{ color: "var(--tertiary-color)" }} />
                  </IconButton>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </section>
  )
}

export default OverallMap;