import { Map as LeafletMap } from 'leaflet';
import type { LatLngExpression } from 'leaflet';

export interface MapConfig {
  mapId: string
  center: {
    lat: number
    lng: number
  }
  zoom: number
  panControl?: boolean
  zoomControl?: boolean
  mapTypeControl?: boolean
  streetViewControl?: boolean
  fullscreenControl?: boolean
  currentLocation?: boolean
  searchFilter?: boolean
  mapStyle?: boolean
  showFilter?: boolean
  onSearchFilterClick?: () => void
}

export interface MapProps {
  height?: string
  width?: string
  panControl?: boolean
  zoomControl?: boolean
  mapTypeControl?: boolean
  streetViewControl?: boolean
  fullscreenControl?: boolean
  currentLocation?: boolean
  searchFilter?: boolean
  mapStyle?: boolean
  onMapLoad?: (mapInstance: LeafletMap | null) => void
  onSearchFilterClick?: () => void
  showFilter?: boolean
}

export interface SearchResult {
  name: string
  location: LatLngExpression
  placeId?: string
}