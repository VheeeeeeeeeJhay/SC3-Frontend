import { useLocalStorage } from '@vueuse/core';

let Marker ={
    latitude: Number,
    longitude: Number
};

export const userMarker = useLocalStorage<Marker>('userMarker', {
    latitude: 16.41,
    longitude: 120.59
});

export const nearbyMarkers = useLocalStorage<Marker>("NEARBY_MARKERS", []);