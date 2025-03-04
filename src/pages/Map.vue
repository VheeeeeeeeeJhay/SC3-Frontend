<script setup>
import { ref, computed, onMounted, watchEffect, watch} from 'vue';
import axiosClient from '../axios';

import leaflet from 'leaflet';
import {useGeolocation} from '@vueuse/core';
import { userMarker, nearbyMarkers } from '../stores/mapStore.js';
const{coords} = useGeolocation();

const data = ref({
  latitude: '',
  longitude: '',
  barangay_id: '',
});

const latitude = ref(0);
const longitude = ref(0);

const reports = ref([]);
const incidents = ref([]);
const barangays = ref([]);

onMounted(() => {
  axiosClient.get('/api/911/report-display', {
    headers: {
      'x-api-key': '$m@rtC!ty'
    }
  })
    .then((res) => {
      // barangays.value = res.data.barangays;
      // incidents.value = res.data.incidents;
      reports.value = res.data[0]; 
      console.log('res.data values', reports.value)
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      errorMessage.value = 'Failed to load data. Please try again later.';
    });
});

// **Compute Grouped Reports**
const groupedReports = computed(() => {
  const grouped = {};

  reports.value.forEach((report) => {
    const barangayId = report.barangay.id;
    const barangayName = report.barangay.name;
    const incidentId = report.incident.id;
    const incidentName = report.incident.type; // ✅ Get incident name

    // Initialize barangay if not exists
    if (!grouped[barangayId]) {
      grouped[barangayId] = {
        name: barangayName,
        incidents: {},
      };
    }

    // Initialize incident if not exists
    if (!grouped[barangayId].incidents[incidentId]) {
      grouped[barangayId].incidents[incidentId] = {
        name: incidentName, // ✅ Store name instead of ID
        count: 0,
      };
    }

    // Count occurrences
    grouped[barangayId].incidents[incidentId].count += 1;
  });

  return grouped;
});


//Map scripts
let map = leaflet.Map;
let marker;
let singleMarker;
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

    // let singleMarker = null;

    // Add Default Marker at Baguio
    singleMarker = leaflet
        .marker([latitude.value, longitude.value])
        .addTo(map)
        .bindPopup(
          `Default Location: <strong>Baguio City</strong> (${latitude.value}, ${longitude.value})`
        )
        .openPopup();

    // map.addEventListener("click", (e) => {
    // const { lat: newLat, lng: newLng } = e.latlng;

    // if (bounds.contains([newLat, newLng])) {
    //   if (singleMarker) {
    //     map.removeLayer(singleMarker);
    //   }

    //   // 📍 Add a new marker
    //   singleMarker = leaflet
    //     .marker([newLat, newLng])
    //     .addTo(map)
    //     .bindPopup(
    //       `Selected Marker at (<strong>${newLat.toFixed(5)}, ${newLng.toFixed(5)}</strong>)`
    //     )
    //     .openPopup();

    //   // Update the stored user marker
    //   userMarker.value.latitude = newLat;
    //   userMarker.value.longitude = newLng;
    //   // update new value
    //   latitude.value = newLat;
    //   longitude.value = newLng;

    // } else {
    //   alert("You cannot place markers outside Baguio City.");
    // }
  // });
});

watchEffect(() => {
  if (
    coords.value.latitude &&
    coords.value.longitude &&
    isFinite(coords.value.latitude) &&
    isFinite(coords.value.longitude)
  ) {
    // Only update latitude and longitude if they haven't been set yet
    if (latitude.value === 0 && longitude.value === 0) {
      latitude.value = coords.value.latitude;
      longitude.value = coords.value.longitude;
    }
  } else {
    // If location is denied or invalid, but user hasn't selected a marker, default to Baguio
    if (latitude.value === 0 && longitude.value === 0) {
      latitude.value = 16.404;
      longitude.value = 120.599;
    }
  }

  // Update form inputs ONLY if the user hasn't manually selected a location
  if (!userMarker.value.latitude || !userMarker.value.longitude) {
    data.value.latitude = latitude.value.toFixed(6);
    data.value.longitude = longitude.value.toFixed(6);
  }
});

watch(() => data.value.barangay_id, (newBarangayId) => {
  const selectedBarangay = barangays.value.find(b => b.id === newBarangayId);
  
  if (selectedBarangay) {
    data.value.longitude = selectedBarangay.longitude || '';
    data.value.latitude = selectedBarangay.latitude || '';

    // ✅ Remove Default Marker
    if (singleMarker) {
      map.removeLayer(singleMarker);
      singleMarker = null; // Clear reference
    }

    // ✅ Remove Previous Marker (if exists)
    if (marker) {
      map.removeLayer(marker);
    }

    // ✅ Add New Marker for Selected Barangay
    marker = leaflet
      .marker([selectedBarangay.latitude, selectedBarangay.longitude])
      .addTo(map)
      .bindPopup(`Barangay: ${selectedBarangay.name} (${selectedBarangay.latitude}, ${selectedBarangay.longitude})`)
      .openPopup();

    // ✅ Center Map to New Marker
    map.setView([selectedBarangay.latitude, selectedBarangay.longitude], 15);
  } else {
    data.value.longitude = '';
    data.value.latitude = '';
  }
});
</script>

<template>
  
  <br>
  <div class="min-h-screen">
    <div class="form-group">
        <label for="place" class="block text-sm font-medium mb-2" >MARKER</label>
        <select id="place" v-model="data.barangay_id" class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200">
            <option disabled value="">Select Barangay (128)</option>
            <option v-for="barangay in barangays" :key="barangay.id" :value="barangay.id">{{ barangay.name }}</option>
        </select>
    </div>
    <div>
      <table class="w-full text-sm text-left border-collapse border">
    <thead class="bg-gray-200">
      <tr>
        <th class="px-4 py-2 border">Barangay</th>
        <th class="px-4 py-2 border">Incident</th>
        <th class="px-4 py-2 border">Count</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(barangay, barangayId) in groupedReports" :key="barangayId">
        <tr v-for="(incident, incidentId) in barangay.incidents" :key="incidentId">
          <td class="px-4 py-2 border">{{ barangay.name }}</td>
          <td class="px-4 py-2 border">{{ incident.name }}</td> <!-- ✅ Display incident name -->
          <td class="px-4 py-2 border">{{ incident.count }}</td>
        </tr>
      </template>
    </tbody>
  </table>

    </div>
    <div id="map"></div>
  </div>
    
    
</template>


<style scoped>
#map { 
  height: 70vh;
  width: 100%; }
</style>