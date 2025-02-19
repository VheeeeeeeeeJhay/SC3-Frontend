import { useLocalStorage } from '@vueuse/core';

export const userMarker = useLocalStorage("USER_MARKER", {
    latitude: 0,
    longitude: 0,
  });
  
export const nearbyMarkers = useLocalStorage("NEARBY_MARKERS", [1]);