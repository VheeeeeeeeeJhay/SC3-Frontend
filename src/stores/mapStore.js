import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

// Persistent data for markers stored in localStorage
export const userMarker = useLocalStorage("USER_MARKER", {
  latitude: 0,
  longitude: 0,
});

export const nearbyMarkers = useLocalStorage("NEARBY_MARKERS", [1]);

// Pinia store for managing map-related states
export const useMapStore = defineStore('map', {
  state: () => ({
    showGeoJSONBorders: useLocalStorage("SHOW_GEOJSON_BORDERS", true), // Default value persisted in localStorage
  }),
  actions: {
    toggleGeoJSONBorders() {
      this.showGeoJSONBorders = !this.showGeoJSONBorders; // Toggle the value
    },
  },
});
