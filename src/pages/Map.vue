<script setup>
import { ref, computed, onMounted, watchEffect} from 'vue';


import leaflet from 'leaflet';
import {useGeolocation} from '@vueuse/core';
import { userMarker, nearbyMarkers } from '../stores/mapStore.js';
const{coords} = useGeolocation();

const latitude = ref(0);
const longitude = ref(0);

let map = leaflet.Map;
let userGeoMarker = leaflet.Marker;

onMounted(() => {
  map = leaflet
  .map('map')
  .setView([userMarker.value.latitude, userMarker.value.longitude], 13);

  leaflet
    .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    keepBuffer: 2,
    attribution: 
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    })
    .addTo(map);

    const bounds = leaflet.latLngBounds(
      [16.350, 120.520], // Southwest (bottom-left) - moved further out
      [16.480, 120.660]  // Northeast (top-right) - moved further out
    );
    map.setMaxBounds(bounds);
    map.setMinZoom(12); // Prevent zooming out too much

    let singleMarker = null;

    map.addEventListener("click", (e) => {
    const { lat: newLat, lng: newLng } = e.latlng;

    if (bounds.contains([newLat, newLng])) {
      if (singleMarker) {
        map.removeLayer(singleMarker);
      }

      // 📍 Add a new marker
      singleMarker = leaflet
        .marker([newLat, newLng])
        .addTo(map)
        .bindPopup(
          `Selected Marker at (<strong>${newLat.toFixed(5)}, ${newLng.toFixed(5)}</strong>)`
        )
        .openPopup();

      // Update the stored user marker
      userMarker.value.latitude = newLat;
      userMarker.value.longitude = newLng;
      // update new value
      latitude.value = newLat;
      longitude.value = newLng;

    } else {
      alert("You cannot place markers outside Baguio City.");
    }
  });
});

watchEffect(() => {
  if (coords.value.latitude && coords.value.longitude) {
    latitude.value = coords.value.latitude;
    longitude.value = coords.value.longitude;
  }
});

</script>

<template>
  
  <br>
  <div class="min-h-screen">
    <div id="map"></div>
    
      <div class="text-white text-lg"><p>hello</p> {{ latitude }} {{ longitude }}</div>
  </div>
    
    
</template>


<style scoped>
#map { 
  height: 70vh;
  width: 50%; }
</style>