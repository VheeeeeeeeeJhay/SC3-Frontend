<script setup>
import { ref, computed, onMounted, watchEffect, watch } from 'vue';
import { useThemeStore } from '../../stores/themeStore.js';
import PrimaryButton from '../../components/PrimaryButton.vue';
import axiosClient from '../../axios.js';
import { useGeolocation } from '@vueuse/core';
import { userMarker } from '../../stores/mapStore.js';
import leaflet from 'leaflet';
import useUserStore from '../../stores/user.js';
import router from '../../router.js';
import Modal from '../../components/Modal.vue';
import FormInput from '../../components/FormInput.vue';

//Import API key
const API_KEY = import.meta.env.VITE_API_KEY;

// Get Auth User Information
const userStore = useUserStore();
const user = computed(() => userStore.user);

// For dark mode
const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-800 border-black text-white" : "bg-sky-50 border-gray-200 text-sky-900"
})
const dropClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-600 border-black text-white" : "bg-white border-gray-200 text-sky-900"
})

// Clearing Form Data
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

// Full Name of Auth User
const fullName = computed(() => {
  return user.value.firstName + ' ' + user.value.lastName
})

const data = ref({
  firstName: fullName.value,
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

// Store Fetch Data From Backend In An Array
const sources = ref([]);
const actions = ref([]);
const incidents = ref([]);
const assistance = ref([]);
const barangays = ref([]);

const errorMessage = ref('');


onMounted(() => {
  axiosClient.get('/api/911/report', {
    headers: {
      'x-api-key': API_KEY
    }
  })
    .then((res) => {
      sources.value = res.data.sources;
      actions.value = res.data.actions;
      incidents.value = res.data.incidents;
      assistance.value = res.data.assistance;
      barangays.value = res.data.barangays;
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      errorMessage.value = 'Failed to load data. Please try again later.';
    });
});

const submitForm = () => {
  const formData = new FormData();
  formData.append('source_id', data.value.source)
  formData.append('time', data.value.incidentTime)
  formData.append('incident_id', data.value.incident)
  formData.append('date_received', data.value.receivedDate)
  formData.append('arrival_on_site', data.value.arrivalTime)
  formData.append('name', data.value.firstName)
  formData.append('landmark', data.value.details)
  formData.append('barangay_id', data.value.barangay)
  formData.append('actions_id', data.value.actionType)
  formData.append('assistance_id', data.value.incidentType)
  formData.append('longitude', data.value.Longitude)
  formData.append('latitude', data.value.Latitude)
  console.log(formData)
  axiosClient.post('/api/911/report', formData, {
    headers: {
      'x-api-key': API_KEY
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



// Filter The Incident/Case Base On The Assistance Type
const filteredIncidents = computed(() => {
  return data.value.incidentType
    ? incidents.value.filter(incident => incident.assistance_id === data.value.incidentType)
    : [];
});

watch(() => data.value.incidentType, () => {
  data.value.incident = ''; // Reset the incident dropdown
});


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


// Back Button
function goBack() {
  window.history.back();
}
</script>

<template>
    <div style="min-height: 100vh;" >
        <!-- Go Back Button -->
          <div class="mt-6 px-2 flex justify-end">
            <Button type="button" name="Back" @click="goBack"
              class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
              <span class="material-icons mr-2">
                arrow_back
              </span>
              Back
            </Button>
          </div>

        <main class="flex-1 my-2 px-2">

            <form @submit.prevent="submitForm" class="space-y-6 mx-auto max-w-6xl p-4">
                <div class="p-6 rounded-lg shadow-lg flex" :class="themeClasses">
                    <div class="w-1/2 pr-4">
                        <h2 class="text-2xl font-bold mb-6" :class="themeClasses">Source Information</h2>
                        <div class="grid grid-cols-2 gap-4 mb-8">
                            <div class="form-group">
                                <label for="source" class="block text-sm font-medium mb-2" :class="themeClasses">Source of Report</label>
                                <select id="source" v-model="data.source" :class="dropClasses" class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200">
                                    <option disabled value="">Select source</option>
                                    <option v-for="source in sources" :key="source.id" :value="source.id">
                                        {{ source.sources || "No Source Available"}}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="incidentType" class="block text-sm font-medium mb-2" :class="themeClasses">Case Classification</label>
                                <select id="incidentType" v-model="data.incidentType" :class="dropClasses" class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200">
                                    <option disabled value="">Select classification</option>
                                    <option v-for="assistance in assistance" :key="assistance.id" :value="assistance.id">{{ assistance.assistance }}</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="incident" class="block text-sm font-medium mb-2" :class="themeClasses">Incident/Case</label>
                                <select id="incident" v-model="data.incident" :class="dropClasses"
                                    class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200"
                                    :disabled="!data.incidentType || filteredIncidents.length === 0">
                                    <option disabled value="">Select incident</option>
                                    <option v-for="incident in filteredIncidents" :key="incident.id" :value="incident.id">
                                    {{ incident.type }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="actionType" class="block text-sm font-medium mb-2" :class="themeClasses">Type of Action</label>
                                <select id="actionType" v-model="data.actionType" :class="dropClasses" class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200">
                                    <option disabled value="">Select action</option>
                                    <option v-for="action in actions" :key="action.id" :value="action.id">{{ action.actions }}</option>
                                </select>
                            </div>
                        </div>

                        <h2 class="text-2xl font-bold mb-6 mt-12" :class="themeClasses">Time Information</h2>
                        <div class="space-y-4">
                            <div class="form-group">
                                <label for="receivedDate" class="block text-sm font-medium mb-2" :class="themeClasses">Date Received</label>
                                <input type="date" id="receivedDate" v-model="data.receivedDate" :class="dropClasses" class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200" />
                            </div>
                            <div class="form-group">
                                <label for="arrivalDate" class="block text-sm font-medium mb-2" :class="themeClasses">Time of Arrival on Site</label>
                                <input type="time" id="arrivalDate" v-model="data.arrivalTime" :class="dropClasses" class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200" />
                            </div>
                            <div class="form-group">
                                <label for="incidentTime" class="block text-sm font-medium mb-2" :class="themeClasses">Time of Incident</label>
                                <input type="time" id="incidentTime" v-model="data.incidentTime" :class="dropClasses" class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200" />
                            </div>
                        </div>
                    </div>

                    <div class="w-px bg-gray-300 mx-4"></div>

                    <!-- right side -->
                    <div class="w-1/2 pl-4">
                        <h2 class="text-2xl font-bold mb-6" :class="themeClasses">Place Information</h2>
                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label for="place" class="block text-sm font-medium mb-2" :class="themeClasses">Place of Incident</label>
                                    <select id="place" v-model="data.barangay" :class="dropClasses" class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200">
                                        <option disabled value="">Select Barangay (128)</option>
                                        <option v-for="barangay in barangays" :key="barangay.id" :value="barangay.id">{{ barangay.name }}</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="details" class="block text-sm font-medium mb-2" :class="themeClasses">Location Details</label>
                                    <input id="details" v-model="data.details" :class="dropClasses" placeholder="Enter location details/landmarks" class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200" />
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div id="map" class="mb-4 h-64"></div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label for="longitude" class="block text-sm font-medium mb-2" :class="themeClasses">Longitude</label>
                                    <input id="longitude" v-model="data.Longitude" :class="dropClasses" placeholder="Enter Longitude" class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200" />
                                </div>
                                <div class="form-group">
                                    <label for="latitude" class="block text-sm font-medium mb-2" :class="themeClasses">Latitude</label>
                                    <input id="latitude" v-model="data.Latitude" :class="dropClasses" placeholder="Enter Latitude" class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200" />
                                </div>
                            </div>
                            <div class="flex justify-end space-x-4 mt-8">
                              <PrimaryButton type="button" name="Clear" @click="clearForm"
                              class="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200" />
                              <PrimaryButton type="submit" name="Add Report"
                              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </main>
  </div>
</template>

<style scoped>
#map {
  height: 35vh;
  width: 100%;
}
</style>