<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useThemeStore } from '../stores/themeStore';
import axios from 'axios';
import axiosClient from '../axios';
import router from '../router.js';
import PrimaryButton from '../components/PrimaryButton.vue';

const themeStore = useThemeStore();
const bgClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-slate-900' : 'bg-gray-900';
})
const boxClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-800' : 'bg-white';
})


const data = ref({
  name: ''
})

const errors = ref({
  name: []
});

function formSubmit() {
  const formData = new FormData()
  formData.append('name', data.value.name)
  axiosClient.post("/api/911/barangay", formData, {
    headers: {
      'x-api-key':'$m@rtC!ty'
    }
    })
    .then(response => {
      formData.value.name = '';
      router.push({ name: 'Map' })
    })
    // .catch(error => {
    //   console.log(error.response.data)
    //   errors.value = error.response.data.errors;
    // })
}

// function formSubmit() {
//   axiosClient.get('/sanctum/csrf-cookie').then(response => {
//     axiosClient.post("/api/911/barangay", formData.value)
//       .then(response => {
//         console.log('successfully added!' + response) 
//         formData.value.name = '';
//         router.push({ name: 'Map' })
//       })
//       .catch(error => {
//         console.log(error.response.data)
//         errors.value = error.response.data.errors;
//       })
//   });
// }
import leaflet from 'leaflet';
import {useGeolocation} from '@vueuse/core';
import { userMarker,nearbyMarkers } from '../stores/mapStore.js';
const{coords} = useGeolocation();

let map = leaflet.Map;
let userGeoMarker = leaflet.Marker;
onMounted(() => {
  map = leaflet
  .map('map')
  // .setView([userMarker.value.latitude, userMarker.value.longitude], 13);
  .setView([16.41, 120.59], 13); 
  // baguio coords

  leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

nearbyMarkers.valueOf.forEach(({ latitude, longitude }) => {
    leaflet
      .marker([latitude, longitude])
      .addTo(map)
      .bindPopup(
        `Saved Marker at (<strong>${latitude.toFixed(2)},${longitude.toFixed(
          2
        )}</strong>)`
      );
  });

map.addEventListener("click", (e) => {
    const { lat: latitude, lng: longitude } = e.latlng;

    leaflet
      .marker([latitude, longitude])
      .addTo(map)
      .bindPopup(
        `Saved Marker at (<strong>${latitude.toFixed(2)},${longitude.toFixed(
          2
        )}</strong>)`
      );

    nearbyMarkers.value.push({ latitude, longitude });
  });
});

watchEffect(() => {
  if(
    coords.value.latitude !== Number.POSITIVE_INFINITY && 
    coords.value.longitude !== Number.POSITIVE_INFINITY
  ) {
    userMarker.value.latitude = coords.value.latitude;
    userMarker.value.longitude = coords.value.longitude;


    if(userGeoMarker) {
      map.removeLayer(userGeoMarker);
    }

    userGeoMarker = leaflet
    .marker([userMarker.value.latitude, userMarker.value.longitude])
    .addTo(map)
    .bindPopup("User Marker");

    const el = userGeoMarker.useGetElement();
    if(el) {
      el.style.filter = `hue-rotate(120deg)`;
    }
  }
});

</script>

<template>
  


    <div id="map"></div>
</template>


<style scoped>
#map { 
  height: 100vh;
  width: 100%; }
</style>
