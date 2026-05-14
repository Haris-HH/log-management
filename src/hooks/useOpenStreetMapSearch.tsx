import { useState, useCallback, useEffect } from 'react';
import L, { Map as LeafletMap, LatLngBounds, Polyline } from 'leaflet';

// Types
import type { SearchResult } from '../types/map';
import type { OverallMapDetail } from "../types/common";

// Utils
import { parseCoordinates, parseCoordinatesWith2Param } from '../utils/coordinates';

// Hooks
import { useMarkerManager } from './useMarkerManager';

export const useMapSearch = (
  map: LeafletMap | null, 
  ableToClick = false,
) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const markerManager = useMarkerManager(map);
  const [routes, setRoutes] = useState<Polyline[]>([]);

  const clearSearchPlaces = async () => {
    setSearchResults([]);
    await markerManager.clearMarkers();
  }

  const clearPlaceMarkerWithLocation = async (location: { lat: number, lng: number }) => {
    await markerManager.clearMarkerByLocation(location);
  }

  const searchPlace = useCallback(async (query: string, iconColor: string = "#FDCC0A", isLocationWithLabel: boolean = false) => {
    setSearchResults([])
    if (!map) return
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      // First check if input is coordinates
      const coordinates = parseCoordinates(query)
      if (coordinates) {
        const result: SearchResult = {
          name: `${coordinates.lat}, ${coordinates.lng}`,
          location: coordinates
        }
        setSearchResults([result])
        map.setZoom(18)
        map.panTo(coordinates)
        await markerManager.createMarker(coordinates, iconColor, isLocationWithLabel)
        return
      }
    } 
    catch (error) {
      setSearchError('Error searching for place')
      setSearchResults([])
    } 
    finally {
      setIsSearching(false)
    }
  }, [map, markerManager]);

  const searchPlaceWithList = useCallback(async (query: {location: string, name: string}[], iconColor: string = "#FDCC0A", isLocationWithLabel: boolean = false) => {
    setSearchResults([])
    if (!map) return
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      const coordinatesList = [];
      const bounds = new LatLngBounds([]);
      const locationList = [];

      for (const q of query) {
        const coordinates = parseCoordinates(q.location)
        if (coordinates) {
          coordinatesList.push(coordinates);
          locationList.push({
            latLng: coordinates,
            name: q.name
          });
          bounds.extend(coordinates);
        }
      }

      if (coordinatesList.length > 0) {
        const result: SearchResult[] = coordinatesList.map(coordinates => ({
          name: `${coordinates.lat}, ${coordinates.lng}`,
          location: coordinates
        }));
        setSearchResults(result)
        await markerManager.createMarkerWithList(locationList, iconColor, isLocationWithLabel)

        if (bounds.isValid()) {
          if (coordinatesList.length === 1) {
            map.setView(coordinatesList[0], 15);
          } 
          else {
            map.fitBounds(bounds, { padding: [30, 30] });
          }
        }
      }
    } 
    catch (error) {
      setSearchError('Error searching for place')
      setSearchResults([])
    } 
    finally {
      setIsSearching(false)
    }
  }, [map, markerManager]);

  const showOverallWithList = useCallback(async (query: OverallMapDetail[]) => {
    setSearchResults([])
    if (!map) return
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      const coordinatesList = [];
      const bounds = new LatLngBounds([]);
      const locationList: OverallMapDetail[] = [];

      for (const q of query) {
        const coordinates = parseCoordinates(`${q.latitude}, ${q.longitude}`)
        if (coordinates) {
          coordinatesList.push(coordinates);
          locationList.push({
            ...q,
            latLng: coordinates,
          });
          bounds.extend(coordinates);
        }
      }

      if (coordinatesList.length > 0) {
        const result: SearchResult[] = coordinatesList.map(coordinates => ({
          name: `${coordinates.lat}, ${coordinates.lng}`,
          location: coordinates
        }));
        setSearchResults(result)
        await markerManager.createOverallMarkerWithList(locationList)

        if (bounds.isValid()) {
          if (coordinatesList.length === 1) {
            map.setView(coordinatesList[0], 15);
          } 
          else {
            map.fitBounds(bounds, { padding: [30, 30] });
          }
        }
      }
    } 
    catch (error) {
      setSearchError('Error searching for place')
      setSearchResults([])
    } 
    finally {
      setIsSearching(false)
    }
  }, [map, markerManager]);

  return {
    searchPlace,
    searchPlaceWithList,
    searchResults,
    isSearching,
    searchError,
    clearSearchPlaces,
    clearPlaceMarkerWithLocation,
    showOverallWithList,
  }
}