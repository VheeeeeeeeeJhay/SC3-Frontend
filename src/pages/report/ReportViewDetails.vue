<script setup>
import axiosClient from '../../axios';
import { onMounted, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PrimaryButton from '../../components/PrimaryButton.vue';
import { useGeolocation } from '@vueuse/core';
import { userMarker } from '../../stores/mapStore.js';
import leaflet from 'leaflet';

//Import API key
const API_KEY = import.meta.env.VITE_API_KEY;

const route = useRoute();
const router = useRouter();
const report_Id = route.params.id;

const data = ref({
    name: '',
    source: '',
    assistance: '',
    incident: '',
    actions: '',
    date_received: '',
    arrival_on_site: '',
    time: '',
    barangay: '',
    landmark: '',
    longitude: '',
    latitude: '',
});

let map = null;
let marker = null; // Store the marker reference

onMounted(() => {
    axiosClient.get(`/api/911/report-view/${report_Id}`, {
        headers: {
            'x-api-key': API_KEY
        }
    })
    .then((res) => {
        console.log(res);
        data.value = res.data;

        // Initialize the map AFTER data is received
        initMap();
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });
});

// Initialize Map
const initMap = () => {
    if (!data.value.latitude || !data.value.longitude) {
        console.error("Latitude or Longitude is missing");
        return;
    }

    if (map) return; // Prevent reinitialization

    map = leaflet.map('map').setView([data.value.latitude, data.value.longitude], 13);

    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Set map boundaries
    const bounds = leaflet.latLngBounds(
        [16.350, 120.520], // Southwest
        [16.480, 120.660]  // Northeast
    );
    map.setMaxBounds(bounds);
    map.setMinZoom(12);

    // Place initial marker
    marker = leaflet.marker([data.value.latitude, data.value.longitude]).addTo(map)
        .bindPopup(`Original Marker: (${data.value.latitude}, ${data.value.longitude})`)
        .openPopup();
};

// Watch geolocation changes but don't override original marker
watchEffect(() => {
    if (data.value.latitude && data.value.longitude) {
        console.log("Updated Coordinates:", data.value.latitude, data.value.longitude);
    }
});
</script>

<template> 
<PrimaryButton name="Back to DataTable" @click.prevent="router.back()" class="bg-green-500 hover:bg-green-600 hover:shadow-md" />
  <div>
     <div><strong>Name:</strong> {{ data.name }}</div>
     <div><strong>Source:</strong> {{ data.source?.sources }}</div>
     <div><strong>Incident Type:</strong> {{ data.assistance?.assistance }}</div>
     <div><strong>Incident:</strong> {{ data.incident?.type }}</div>
     <div><strong>Action:</strong> {{ data.actions?.actions }}</div>
     <div><strong>Received Date:</strong> {{ data.date_received }}</div>
     <div><strong>Arrival Time:</strong> {{ data.arrival_on_site }}</div>
     <div><strong>Incident Time:</strong> {{ data.time }}</div>
     <div><strong>Barangay:</strong> {{ data.barangay?.name }}</div>
     <div><strong>Details:</strong> {{ data.landmark }}</div>
     <div><strong>Longitude:</strong> {{ data.longitude }}</div>
     <div><strong>Latitude:</strong> {{ data.latitude }}</div>
     <div id="map" class="mb-4"></div>
  </div>
</template>

<style scoped>
#map {
  height: 50vh;
  width: 100%;
  border: 1px solid #ccc;
}
</style>
