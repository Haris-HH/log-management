import { useRef, useEffect, useState } from "react"

// Types
import type { MapProps } from "../../types/map";
import { DEFAULT_DIMENSIONS, DEFAULT_MAP_CONFIG } from "../../constants/map";
import { useMap } from "../../hooks/useOpenStreetMap"

// Components
import Loading from "../../components/loading-screen/LoadingScreen";

// i18n
import { useTranslation } from 'react-i18next';

// Hook
import { useTheme } from "../../hooks/useTheme";

const BaseMap = ({
  height = DEFAULT_DIMENSIONS.height,
  width = DEFAULT_DIMENSIONS.width,
  panControl = DEFAULT_MAP_CONFIG.panControl,
  zoomControl = DEFAULT_MAP_CONFIG.zoomControl,
  mapTypeControl = DEFAULT_MAP_CONFIG.mapTypeControl,
  streetViewControl = DEFAULT_MAP_CONFIG.streetViewControl,
  fullscreenControl = DEFAULT_MAP_CONFIG.fullscreenControl,
  currentLocation = DEFAULT_MAP_CONFIG.currentLocation,
  searchFilter = DEFAULT_MAP_CONFIG.searchFilter,
  mapStyle = DEFAULT_MAP_CONFIG.mapStyle,
  onMapLoad,
  onSearchFilterClick,
  showFilter,
}: MapProps) => {
  const { theme } = useTheme();

  // i18n
  const { t } = useTranslation();

  const mapRef = useRef<HTMLDivElement>(null)

  const { initMap, isLoading, error, mapInstance } = useMap({
    panControl: panControl,
    zoomControl: zoomControl, 
    mapTypeControl: mapTypeControl,
    streetViewControl: streetViewControl,
    fullscreenControl: fullscreenControl,
    currentLocation: currentLocation,
    searchFilter: searchFilter,
    mapStyle: mapStyle,
    showFilter: showFilter,
    themeMode: theme.isDark ? "dark" : "light",
  }, onSearchFilterClick);
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (mapRef.current) {
      initMap(mapRef.current);
    }

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [theme.isDark]);

  useEffect(() => {
    if (onMapLoad) {
      onMapLoad(mapInstance?.current)
    }
  }, [mapInstance, onMapLoad])

  if (error) {
    return <div className="text-red-500">{`${t('text.map-not-load')}: ${error.message}`}</div>
  }

  return (
    <div className="relative w-full h-full">
      { isLoading && (
        <div className="absolute h-full w-full">
          <Loading />
        </div>
      ) }
      <div
        ref={mapRef}
        id="map"
        className="relative"
        style={{
          width: width || "100%",
          height: height || "100%",
          position: "absolute",
          top: isFullScreen ? 0 : 0,
          left: isFullScreen ? 0 : 0,
          zIndex: 1,
        }}
      />
    </div>
  )
}

export default BaseMap