import { useLocalStorage } from '@vueuse/core';

export const userMarker = useLocalStorage("USER_MARKER", {
    latitude: 16.41,
    longitude: 120.59,
  });
  
export const nearbyMarkers = useLocalStorage("NEARBY_MARKERS", [1]);