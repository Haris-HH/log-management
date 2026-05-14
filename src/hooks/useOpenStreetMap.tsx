import { useRef, useState, useEffect } from 'react'
import L, { Map as LeafletMap } from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import ReactDOMServer from "react-dom/server";

// Types
import type { MapConfig } from "../types/map";
import { DEFAULT_MAP_CONFIG } from '../constants/map';

// Icons
import OutdoorIcon from "../assets/svg/outdoor.svg?react";
import SatelliteIcon from "../assets/svg/world-map.svg?react";
import DarkModeIcon from "../assets/svg/dark-map.svg?react";
import MapIcon from "../assets/svg/map.svg?react";

export const useMap = (config: Partial<MapConfig> = {}, onFilterClick?: () => void) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);

  const initMap = (element: HTMLDivElement) => {
    try {
      setIsLoading(true);

      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      const map = L.map(element, {
        zoomControl: false,
        preferCanvas: true,
      }).setView(
        [config.center?.lat ?? DEFAULT_MAP_CONFIG.center.lat, config.center?.lng ?? DEFAULT_MAP_CONFIG.center.lng],
        config.zoom ?? DEFAULT_MAP_CONFIG.zoom
      );

      const tileLayers = [
        {
          name: 'Light (Default)',
          icon: ReactDOMServer.renderToString(
            <MapIcon style={{ color: "var(--primary-color)" }} />
          ),
          layer: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 19,
          }),
        },
        {
          name: 'Outdoor',
          icon: ReactDOMServer.renderToString(
            <OutdoorIcon style={{ color: "var(--primary-color)" }} />
          ),
          layer: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenTopoMap',
            maxZoom: 17,
          }),
        },
        {
          name: 'Night',
          icon: ReactDOMServer.renderToString(
            <DarkModeIcon style={{ color: "var(--primary-color)" }} />
          ),
          layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CartoDB',
            maxZoom: 19,
          }),
        },
        {
          name: 'Satellite',
          icon: ReactDOMServer.renderToString(
            <SatelliteIcon style={{ color: "var(--primary-color)" }} />
          ),
          layer: L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
              attribution: 'Tiles © Esri',
              maxZoom: 19,
            }
          ),
        },
      ];

      let currentLayerIndex = 0;
      let currentTileLayer = tileLayers[currentLayerIndex].layer;
      currentTileLayer.addTo(map);

      if (config.zoomControl ?? DEFAULT_MAP_CONFIG.zoomControl) {
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);

        const zoomControl = document.querySelector('.leaflet-control-zoom');
        if (zoomControl) {
          zoomControl.classList.add('custom-zoom-control');
        }
      }

      if (config.fullscreenControl ?? DEFAULT_MAP_CONFIG.fullscreenControl) {
        L.control.fullscreen({
          position: 'topright'
        }).addTo(map);

        const fullscreenControl = document.querySelector('.leaflet-control-fullscreen');
        if (fullscreenControl) {
          fullscreenControl.classList.add('custom-fullscreen-control');
        }
      }

      if (config.mapStyle ?? DEFAULT_MAP_CONFIG.mapStyle) {
        const StyleControl = L.Control.extend({
          options: { position: 'topright' },

          onAdd: function () {
            const container = L.DomUtil.create(
              'div',
              'leaflet-bar leaflet-control custom-style-control'
            );

            const button = L.DomUtil.create('a', '', container);
            button.href = '#';
            button.title = tileLayers[currentLayerIndex].name;

            const iconContainer = L.DomUtil.create('div', '', button);
            iconContainer.innerHTML = tileLayers[currentLayerIndex].icon;;
            iconContainer.style.width = '20px';
            iconContainer.style.height = '20px';

            L.DomEvent.disableClickPropagation(button);

            L.DomEvent.on(button, 'click', (e) => {
              L.DomEvent.preventDefault(e);

              map.removeLayer(currentTileLayer);

              currentLayerIndex = (currentLayerIndex + 1) % tileLayers.length;

              currentTileLayer = tileLayers[currentLayerIndex].layer;
              currentTileLayer.addTo(map);

              iconContainer.innerHTML = tileLayers[currentLayerIndex].icon;
              button.title = tileLayers[currentLayerIndex].name;
            });

            return container;
          },
        });

        new StyleControl().addTo(map);
      }

      if (config.currentLocation ?? DEFAULT_MAP_CONFIG.currentLocation) {
        const LocationControl = L.Control.extend({
          options: { position: 'topright' },
          onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control custom-location-control');
            const button = L.DomUtil.create('a', '', container);
            
            button.href = '#';
            button.title = 'Show my location';

            L.DomEvent.disableClickPropagation(button);

            L.DomEvent.on(button, 'click', (e) => {
              L.DomEvent.preventDefault(e);
              map.flyTo([DEFAULT_MAP_CONFIG.center.lat, DEFAULT_MAP_CONFIG.center.lng], 6);
            });

            return container;
          }
        });

        new LocationControl().addTo(map);
      }

      if (config.searchFilter ?? DEFAULT_MAP_CONFIG.searchFilter) {
        const LocationControl = L.Control.extend({
          options: { position: 'topleft' },
          onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control custom-search-filter-control');
            container.id = 'leaflet-search-control-container';

            container.style.transition = 'opacity 0.3s ease, transform 0.3s ease, visibility 0.3s';
            if (config.showFilter) {
              container.style.opacity = '0';
              container.style.visibility = 'hidden';
              container.style.transform = 'scale(0.8)';
            }

            const button = L.DomUtil.create('a', '', container);
            button.href = '#';
            button.title = 'Search Filter';

            if (config.showFilter) {
              container.style.display = 'none';
            }

            L.DomEvent.disableClickPropagation(button);

            L.DomEvent.on(button, 'click', (e) => {
              L.DomEvent.preventDefault(e);
              if (onFilterClick) onFilterClick();
            });

            return container;
          }
        });

        new LocationControl().addTo(map);
      }

      mapInstance.current = map;
    } 
    catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize map'));
    } 
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const container = document.getElementById('leaflet-search-control-container');
    if (container) {
      if (config.showFilter) {
        container.classList.add('is-hidden');
      } else {
        container.classList.remove('is-hidden');
      }
    }
  }, [config.showFilter]);

  return {
    initMap,
    isLoading,
    error,
    mapInstance,
  };
};