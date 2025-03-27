<script setup>
import axiosClient from '../../axios';
import { onMounted, ref, watchEffect, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import PrimaryButton from '../../components/PrimaryButton.vue';
import leaflet from 'leaflet';
import viewMap from '../../components/Maps/viewMap.vue';


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

const fetchData = async () => {
  try {
    const response = await axiosClient.get(`/api/911/report-view/${report_Id}`, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
    data.value = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

onMounted(() => {
    fetchData();
});

// Initialize Map
// const initMap = () => {
//     if (!data.value.latitude || !data.value.longitude) {
//         console.error("Latitude or Longitude is missing");
//         return;
//     }

//     if (map) return; // Prevent reinitialization

//     map = leaflet.map('map').setView([data.value.latitude, data.value.longitude], 13);

//     leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         maxZoom: 19,
//         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//     }).addTo(map);

//     // Set map boundaries
//     const bounds = leaflet.latLngBounds(
//         [16.350, 120.520], // Southwest
//         [16.480, 120.660]  // Northeast
//     );
//     map.setMaxBounds(bounds);
//     map.setMinZoom(12);

//     // Place initial marker
//     marker = leaflet.marker([data.value.latitude, data.value.longitude]).addTo(map)
//         .bindPopup(`Original Marker: (${data.value.latitude}, ${data.value.longitude})`)
//         .openPopup();
// };

// // Watch geolocation changes but don't override original marker
// watchEffect(() => {
//     if (data.value.latitude && data.value.longitude) {
//         console.log("Updated Coordinates:", data.value.latitude, data.value.longitude);
//     }
// });
</script>

<template>
  <div class="min-h-screen">
    <!-- Titleee -->
    <div class="mt-6 px-2 flex justify-between">
          <h1 class="text-2xl font-bold dark:text-white">Report View of Case {{ data.id }}</h1>
          <Button type="button" name="Back" @click.prevent="router.back()"
            class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
            <span class="material-icons mr-2"> arrow_back </span>
            Back
          </Button>
      </div>
  
    <!-- Content Wrapper -->
    <div class="container mx-auto mt-6 bg-sky-50 dark:bg-slate-800  shadow-md rounded-lg" :class="themeClasses">
      <div class="flex flex-col md:flex-row">
        <!-- Left Side: Text Information -->
        <div class="w-full md:w-1/2 p-6 rounded-lg text-gray-800 dark:text-gray-200">
        <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Incident Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div><span class="font-semibold ">Name:</span> {{ data.name }}</div>
                <div><span class="font-semibold ">Source:</span> {{ data.source?.sources }}</div>
                <div><span class="font-semibold ">Incident Type:</span> {{ data.assistance?.assistance }}</div>
                <div><span class="font-semibold ">Incident:</span> {{ data.incident?.type }}</div>
                <div><span class="font-semibold ">Action:</span> {{ data.actions?.actions }}</div>
                <div><span class="font-semibold ">Received Date:</span> {{ data.date_received }}</div>
                <div><span class="font-semibold ">Arrival Time:</span> {{ data.arrival_on_site }}</div>
                <div><span class="font-semibold ">Incident Time:</span> {{ data.time }}</div>
                <div><span class="font-semibold ">Barangay:</span> {{ data.barangay?.name }}</div>
                <div><span class="font-semibold ">Details:</span> {{ data.landmark }}</div>
                <div><span class="font-semibold ">Longitude:</span> {{ data.longitude }}</div>
                <div><span class="font-semibold ">Latitude:</span> {{ data.latitude }}</div>
            </div>
        </div>

  
        <!-- Right Side: Map -->
        <div class="w-full md:w-1/2 flex justify-center items-center mt-6 md:mt-0">
          <!-- <div id="map" class="rounded-lg shadow-md"></div> -->
          <viewMap v-if="data.latitude && data.longitude"  id="map" class=" z-10 rounded-lg shadow-md" :reportLat="data.latitude"  :reportLong="data.longitude"/>
        </div>
      </div>
    </div>

  </div>
  </template>
  
  <style scoped>
  #map {
    height: 50vh;
    width: 100%;
    max-width: 500px;
    border: 1px solid #ccc;
  }
  </style>
  

