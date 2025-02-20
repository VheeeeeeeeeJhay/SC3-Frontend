<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useThemeStore } from '../stores/themeStore';
import PrimaryButton from '../components/PrimaryButton.vue';
import axiosClient from '../axios';
import { useGeolocation } from '@vueuse/core';
import { userMarker } from '../stores/mapStore.js';
import leaflet from 'leaflet';

const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-800 border-black text-white" : "bg-sky-50 border-gray-200 text-sky-900"
})

const dropClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-600 border-black text-white" : "bg-white border-gray-200 text-sky-900"
})


const clearForm = () => {
  data.value = {
    source: '',
    incidentType: '',
    incident: '',
    actionType: '',
    receivedDate: '',
    arrivalTime: '',
    incidentTime: '',
    barangay: '',
    details: '',
    Longitude: '',
    Latitude: '',
  }
};

const data = ref({
  firstName: '',
  source: '',
  incidentType: '',
  incident: '',
  actionType: '',
  receivedDate: '',
  arrivalTime: '',
  incidentTime: '',
  barangay: '',
  details: '',
  Longitude: '',
  Latitude: '',
});

const sources = ref([]);
const actions = ref([]);
const incidents = ref([]);
const assistance = ref([]);
const barangays = ref([]);

onMounted(() => {
  axiosClient.get('/api/911/barangay', {
      headers: {
          'x-api-key': '$m@rtC!ty'
      }
  })
  .then((res) => {
      console.log(res);
      barangays.value = res.data;
      sources.value = res.data;
      actions.value = res.data;
      incidents.value = res.data;
      assistance.value = res.data;
  })
  .catch((error) => {
      console.error('Error fetching data:', error);
      errorMessage.value = 'Failed to load barangays. Please try again later.';
  });
});

console.log(actions);

const submitForm = () => {
  axiosClient.post('/api/911/report', formData, {
    headers: {
      'x-api-key': '$m@rtC!ty'
    }
  })
    .then(response => {
      console.log('Form submitted successfully:', response.data);
      clearForm();
    })
    .catch(error => {
      console.log('Error:', error.response.data);
    })
};

//Map scripts
const { coords } = useGeolocation();

const latitude = ref(0);
const longitude = ref(0);
let map = leaflet.Map;

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
    [16.350, 120.520], // Southwest (bottom-left)
    [16.480, 120.660]  // Northeast (top-right) 
  );
  map.setMaxBounds(bounds);
  map.setMinZoom(12);

  let singleMarker = null;

  map.addEventListener("click", (e) => {
    const { lat: newLat, lng: newLng } = e.latlng;

    if (bounds.contains([newLat, newLng])) {
      if (singleMarker) {
        map.removeLayer(singleMarker);
      }

      // Add a new marker
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
      // Update form inputs
      data.value.Latitude = newLat.toFixed(6);
      data.value.Longitude = newLng.toFixed(6);

    } else {
      alert("You cannot place markers outside Baguio City.");
    }
  });
});

watchEffect(() => {
  if (coords.value.latitude && coords.value.longitude) {
    data.value.Latitude = coords.value.latitude.toFixed(6);
    data.value.Longitude = coords.value.longitude.toFixed(6);
  }
});
</script>

<template>
  <div style="min-height: 100vh;">

    <main class="flex-1 my-2 px-2">
      <div class="text-white">{{ data }}</div>
      <form @submit.prevent="submitForm" class="space-y-6 mx-auto max-w-5xl p-4">
        <div class="bg-gray-100 p-6 rounded-lg shadow-lg grid grid-cols-2 gap-4">
          <div>

            <!-- Source Information -->
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Source Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div class="form-group">
                <label for="source" class="block text-sm font-medium mb-2 text-gray-700">Source of Report</label>
                <select id="source" v-model="data.source"
                  class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                  <option disabled value="">Select source</option>
                  <option  v-for="source in sources" :key="source.id" :value="source.sources">
                    {{ source.sources }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="incidentType" class="block text-sm font-medium mb-2 text-gray-700">Case
                  Classification</label>
                <select id="incidentType" v-model="data.incidentType"
                  class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                  <option disabled value="">Select classification</option>
                  <option v-for="assistance in assistance" :key="assistance.id" :value="assistance.assistance">{{
                    assistance.assistance }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="incident" class="block text-sm font-medium mb-2 text-gray-700">Incident/Case</label>
                <select id="incident" v-model="data.incident"
                  class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                  <option disabled value="">Select incident</option>
                  <option v-for="incident in incidents" :key="incident.id" :value="incident.type">{{ incident.type }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="actionType" class="block text-sm font-medium mb-2 text-gray-700">Type of Action</label>
                <select id="actionType" v-model="data.actionType"
                  class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                  <option disabled value="">Select action</option>
                  <option v-for="action in actions" :key="action.id" :value="action.actions">{{ action.actions }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Time Information -->
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Time Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="form-group">
                <label for="receivedDate" class="block text-sm font-medium mb-2 text-gray-700">Date Received</label>
                <input type="date" id="receivedDate" v-model="data.receivedDate"
                  class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
              </div>
              <div class="form-group">
                <label for="arrivalDate" class="block text-sm font-medium mb-2 text-gray-700">Time of Arrival on
                  Site</label>
                <input type="time" id="arrivalDate" v-model="data.arrivalTime"
                  class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
              </div>
              <div class="form-group">
                <label for="incidentTime" class="block text-sm font-medium mb-2 text-gray-700">Time of Incident</label>
                <input type="time" id="incidentTime" v-model="data.incidentTime"
                  class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
              </div>
            </div>
          </div>

          <!-- Place Information -->
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Place Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label for="place" class="block text-sm font-medium mb-2 text-gray-700">Place of Incident</label>
                <select id="place" v-model="data.location"
                  class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                  <option disabled value="">Select Barangay (128)</option>
                  <option v-for="barangay in barangays" :key="barangay.id" :value="barangay.name">
                    {{ barangay.name }}
                  </option>
                </select>
              </div>
              <div class="form-group md:col-span-2">
                <label for="details" class="block text-sm font-medium mb-2 text-gray-700">Location Details</label>
                <input id="details" v-model="data.details" placeholder="Enter location details/landmarks"
                  class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
              </div>
              <div class="form-group md:col-span-2">
                <div id="map" class="mb-4"></div>
              </div>
              <div class="form-group">
                <label for="longitude" class="block text-sm font-medium mb-2 text-gray-700">Longitude</label>
                <input id="longitude" v-model="data.Longitude" placeholder="Enter Longitude"
                  class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
              </div>
              <div class="form-group">
                <label for="latitude" class="block text-sm font-medium mb-2 text-gray-700">Latitude</label>
                <input id="latitude" v-model="data.Latitude" placeholder="Enter Latitude"
                  class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-4 mt-8">
            <PrimaryButton type="button" name="Clear" @click="clearForm"
              class="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200" />
            <PrimaryButton type="submit" name="Add Report"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200" />
          </div>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
#map {
  height: 50vh;
  width: 100%;
}
</style>