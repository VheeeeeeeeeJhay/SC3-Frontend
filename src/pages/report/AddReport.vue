<script setup>
import { ref, computed, onMounted, watchEffect, watch } from 'vue';
import PrimaryButton from '../../components/PrimaryButton.vue';
import axiosClient from '../../axios.js';
import { useGeolocation } from '@vueuse/core';
import { userMarker } from '../../stores/mapStore.js';
import { useRouter } from 'vue-router';
import leaflet from 'leaflet';
import useUserStore from '../../stores/user.js';

// Get Auth User Information
const userStore = useUserStore();
const user = computed(() => userStore.user);
const router = useRouter();

// Clearing Form Data
const clearForm = () => {
  errors.value = [];
  data.value = {
    source_id: '',
    assistance_id: '',
    incident_id: '',
    actions_id: '',
    date_received: '',
    arrival_on_site: '',
    time: '',
    barangay_id: '',
    landmark: '',
    longitude: '',
    latitude: '',
    urgency_id: '',
  }
};

// Full Name of Auth User
const fullName = computed(() => {
  return user.value.firstName + ' ' + user.value.lastName
})

const data = ref({
  time: '',
  date_received: '',
  arrival_on_site: '',
  name: fullName.value,
  landmark: '',
  longitude: '',
  latitude: '',
  source_id: '',
  assistance_id: '',
  incident_id: '',
  actions_id: '',
  barangay_id: '',
  urgency_id: '',
});

// Store Fetch Data From Backend In An Array
const sources = ref([]);
const actions = ref([]);
const incidents = ref([]);
const assistance = ref([]);
const barangays = ref([]);
const urgencies = ref([]);

const fetchData = async () => {
  await axiosClient.get('/api/911/report', {
    headers: {
      'x-api-key': import.meta.env.VITE_API_KEY
    }
  })
    .then((res) => {
      sources.value = res.data.sources;
      actions.value = res.data.actions;
      incidents.value = res.data.incidents;
      assistance.value = res.data.assistance;
      barangays.value = res.data.barangays;
      urgencies.value = res.data.urgencies;
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      errors.value = 'Failed to load data. Please try again later.';
    });
}
onMounted(() => {
  fetchData();
});

const errors = ref([])
const message = ref('')

const submitForm = async () => {
  try {
    const formData = new FormData();
    formData.append('source_id', data.value.source_id)
    formData.append('time', data.value.time)
    formData.append('incident_id', data.value.incident_id)
    formData.append('date_received', data.value.date_received)
    formData.append('arrival_on_site', data.value.arrival_on_site)
    formData.append('name', data.value.name)
    formData.append('landmark', data.value.landmark)
    formData.append('barangay_id', data.value.barangay_id)
    formData.append('actions_id', data.value.actions_id)
    formData.append('assistance_id', data.value.assistance_id)
    formData.append('longitude', data.value.longitude)
    formData.append('latitude', data.value.latitude)
    formData.append('urgency_id', data.value.urgency_id)
    console.log(formData)
    await axiosClient.post('/api/911/report', formData, {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY
      }
    })
      .then(response => {
        console.log('Form submitted successfully:', response.data);
        message.value = response.data.message;
        clearForm();
        errors.value = [];
        console.log(message.value)
        fetchData();
      })
    // .catch(error => {
    //   console.log('Error:', error.response.data);
    //     errors.value = error.response.data.errors;
    //     // errors.value = error.response.data;
    //     // console.log(errors.value)
    // })
  } catch (error) {
    console.error(error.response.data);
    errors.value = `An error occurred: ${error.response.data}`;
    console.log('Error:', error.response.data);
    errors.value = error.response.data.errors;
  }
};



// Filter The Incident/Case Base On The Assistance Type
const filteredIncidents = computed(() => {
  return data.value.assistance_id
    ? incidents.value.filter(incident_id => incident_id.assistance_id === data.value.assistance_id)
    : [];
});
watch(() => data.value.assistance_id, () => {
  data.value.incident_id = ''; // Reset the incident dropdown
});


//Map scripts
const { coords } = useGeolocation();
const latitude = ref(0);
const longitude = ref(0);
let map = leaflet.Map;
let marker;
let singleMarker;

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

  // Add Default Marker at Baguio
  singleMarker = leaflet
    .marker([latitude.value, longitude.value])
    .addTo(map)
    .bindPopup(
      `Default Location: <strong>Baguio City</strong> (${latitude.value}, ${longitude.value})`
    )
    .openPopup();


  //User Click on Map
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
      data.value.latitude = newLat.toFixed(6);
      data.value.longitude = newLng.toFixed(6);

    } else {
      alert("You cannot place markers outside Baguio City.");
    }
  });
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

//date and time icons
const openTimePicker = () => {
  document.getElementById("arrival_on_site").showPicker();
};
const openTimePicker2 = () => {
  document.getElementById("time").showPicker();
};
const openDatePicker = () => {
  document.getElementById("date_received").showPicker();
};

//testing
const searchQuery = ref('');
const isDropdownOpen = ref(false);
// Filter Barangays
const filteredBarangays = computed(() => {
  return barangays.value.filter(b =>
    b.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Select Barangay
const selectBarangay = (barangay) => {
  data.value.barangay_id = barangay.id;
  searchQuery.value = barangay.name;
  isDropdownOpen.value = false;
};

// Close Dropdown
const closeDropdown = () => {
  setTimeout(() => isDropdownOpen.value = false, 200);
};

</script>

<template>
  <div class="min-h-screen p-4">
    <!-- Titleee -->
    <div class="mt-6 px-2 flex justify-between">
      <h1 class="text-2xl font-bold dark:text-white mb-2">Add a New Report</h1>
      <Button type="button" name="Back" @click.prevent="router.back()"
        class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
        <span class="material-icons mr-2"> arrow_back </span>
        Back
      </Button>
    </div>

    <main class="flex-1 px-2">

      <form @submit.prevent="submitForm" class="space-y-6 mt-6 mx-auto max-w-6xl">
        <div class="p-6 rounded-lg shadow-lg flex bg-sky-50 text-gray-800 dark:bg-slate-800 dark:text-white">
          <div class="w-1/2 pr-4">
            <h2 class="text-2xl font-bold mb-6 ">Report Information</h2>
            <div class="grid grid-cols-2 gap-4 mb-8">

              <div class="form-group">
                <label for="assistance_id" class="block text-sm font-medium mb-2">Case
                  Classification
                  <ToolTip Information="This is the type of assistance that is being reported." />
                </label>
                <select id="assistance_id" v-model="data.assistance_id"
                  class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                  <option disabled value="">Select classification</option>
                  <option v-for="assistance in assistance" :key="assistance.id" :value="assistance.id">{{
                    assistance.assistance }}</option>
                </select>
                <span class="text-sm text-red-500" v-if="errors.assistance_id && errors.assistance_id.length">{{
                  errors.assistance_id[0] }}</span>
              </div>

              <div class="form-group">
                <label for="source_id" class="block text-sm font-medium mb-2">Source of
                  Report
                  <ToolTip Information="This is the source of the report." />
                </label>
                <select id="source_id" v-model="data.source_id"
                  class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                  <option disabled value="">Select source</option>
                  <option v-for="source in sources" :key="source.id" :value="source.id">
                    {{ source.sources || "No Source Available" }}
                  </option>
                </select>
                <span class="text-sm text-red-500" v-if="errors.source_id && errors.source_id.length">{{
                  errors.source_id[0] }}</span>
              </div>

              <div class="form-group">
                <label for="incident_id" class="block text-sm font-medium mb-2">
                  Incident/Case
                  <ToolTip Information="This is the incident or case that is being reported." />
                </label>
                <select id="incident_id" v-model="data.incident_id" :class="[
                  'w-full p-3 rounded-lg border focus:ring-2 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white',
                  (!data.assistance_id || filteredIncidents.length === 0)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'focus:ring-blue-500'
                ]" :disabled="!data.assistance_id || filteredIncidents.length === 0">
                  <option disabled value="">Select incident</option>
                  <option v-for="incident in filteredIncidents" :key="incident.id" :value="incident.id">
                    {{ incident.type }}
                  </option>
                </select>
                <span class="text-sm text-red-500" v-if="errors.incident_id && errors.incident_id.length">{{
                  errors.incident_id[0] }}</span>
              </div>

              <div class="form-group">
                <label for="actions_id" class="block text-sm font-medium mb-2">Type of
                  Action
                  <ToolTip Information="This is the type of action that is being reported." />
                </label>
                <select id="actions_id" v-model="data.actions_id"
                  class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                  <option disabled value="">Select action</option>
                  <option v-for="action in actions" :key="action.id" :value="action.id">{{ action.actions }}</option>
                </select>
                <span class="text-sm text-red-500" v-if="errors.actions_id && errors.actions_id.length">{{
                  errors.actions_id[0] }}</span>
              </div>

              <div class="form-group">
                <label for="urgency_id" class="block text-sm font-medium mb-2">Urgency
                  <ToolTip Information="This is the urgency of the report." />
                </label>
                <select id="urgency_id" v-model="data.urgency_id"
                  class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                  <option disabled value="">Select urgency</option>
                  <option v-for="urgency in urgencies" :key="urgency.id" :value="urgency.id">
                    {{ urgency.urgency }}
                  </option>
                </select>
                <span class="text-sm text-red-500" v-if="errors.urgency_id && errors.urgency_id.length">{{
                  errors.urgency_id[0] }}</span>
              </div>
            </div>

            <h2 class="text-2xl font-bold mb-6 mt-12">Time Information</h2>
            <div class="space-y-4 grid grid-cols-2 gap-4 mb-8">
              <div class="form-group relative">
                <label for="date_received" class="block text-sm font-medium mb-2">
                  Date Received
                  <ToolTip Information="This is the date the report was received." />
                </label>
                <input type="date" id="date_received" v-model="data.date_received" @click="openDatePicker"
                  class="appearance-none w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                <span @click="openDatePicker"
                  class="material-icons calendar_month absolute right-3 top-11 text-gray-800 dark:text-white" />

                <span class="text-sm text-red-500" v-if="errors.date_received && errors.date_received.length">{{
                  errors.date_received[0] }}</span>
              </div>
              <div class="form-group relative">
                <label for="arrivalDate" class="block text-sm font-medium mb-2">
                  Time of Arrival on Site
                  <ToolTip Information="This is the time the report was received." />
                </label>
                <input type="time" id="arrival_on_site" v-model="data.arrival_on_site" @click="openTimePicker"
                  class="appearance-none w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                <span @click="openTimePicker"
                  class="material-icons schedule absolute right-3 top-11 text-gray-800 dark:text-white" />

                <span class="text-sm text-red-500" v-if="errors.arrival_on_site && errors.arrival_on_site.length">{{
                  errors.arrival_on_site[0] }}</span>
              </div>
              <div class="form-group relative">
                <label for="time" class="block text-sm font-medium mb-2">
                  Time of Incident
                  <ToolTip Information="This is the time of the incident." />
                </label>
                <input type="time" id="time" v-model="data.time" @click="openTimePicker2"
                  class="appearance-none w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                <span @click="openTimePicker2"
                  class="material-icons schedule absolute right-3 top-11 text-gray-800 dark:text-white" />

                <span class="text-sm text-red-500" v-if="errors.time && errors.time.length">{{ errors.time[0] }}</span>
              </div>
            </div>
          </div>

          <div class="w-px bg-gray-300 mx-4"></div>

          <!-- right side -->
          <div class="w-1/2 pl-4">
            <h2 class="text-2xl font-bold mb-6">Place Information</h2>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group relative">
                  <label for="place" class="block text-sm font-medium mb-2">
                    Place of Incident
                    <ToolTip Information="This is the place of the incident." />
                  </label>

                  <!-- Searchable Input -->
                  <input id="place" v-model="searchQuery" @focus="isDropdownOpen = true" @blur="closeDropdown"
                    placeholder="Search Barangay..."
                    class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />

                  <!-- Dropdown List -->
                  <ul v-if="isDropdownOpen && filteredBarangays.length"
                    class="absolute z-50 bg-white dark:bg-slate-900 w-full shadow-lg rounded-md mt-1 max-h-52 overflow-y-auto border border-gray-200 dark:border-black">
                    <li v-for="barangay in filteredBarangays" :key="barangay.id"
                      @mousedown.prevent="selectBarangay(barangay)"
                      class="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600">
                      {{ barangay.name }}
                    </li>
                  </ul>

                  <!-- Error Message -->
                  <span class="text-sm text-red-500" v-if="errors.barangay_id && errors.barangay_id.length">
                    {{ errors.barangay_id[0] }}
                  </span>
                </div>
                <div class="form-group">
                  <label for="landmark" class="block text-sm font-medium mb-2">
                    Location Details
                    <ToolTip Information="This is the location details of the incident." />
                  </label>
                  <input id="landmark" v-model="data.landmark" placeholder="Enter location details/landmarks"
                    class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                  <span class="text-sm text-red-500" v-if="errors.landmark && errors.landmark.length">{{
                    errors.landmark[0] }}</span>
                </div>
              </div>

              <div class="form-group">
                <div id="map" class="mb-4 h-64 z-10"></div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="longitude" class="block text-sm font-medium mb-2">
                    Longitude
                    <ToolTip Information="This is the longitude of the incident." />
                  </label>
                  <input disabled id="longitude" v-model="data.longitude" placeholder="Enter Longitude"
                    class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                  <span class="text-sm text-red-500" v-if="errors.longitude && errors.longitude.length">{{
                    errors.longitude[0] }}</span>
                </div>
                <div class="form-group">
                  <label for="latitude" class="block text-sm font-medium mb-2">
                    Latitude
                    <ToolTip Information="This is the latitude of the incident." />
                  </label>
                  <input disabled id="latitude" v-model="data.latitude" placeholder="Enter Latitude"
                    class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                  <span class="text-sm text-red-500" v-if="errors.latitude && errors.latitude.length">{{
                    errors.latitude[0] }}</span>
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

  <Toast v-if="message.length > 0" :message="message" icon="check_circle" type="success" />
  <Toast v-if="errors.length > 0" :message="errors" icon="error" type="error" />
</template>

<style scoped>
#map {
  height: 35vh;
  width: 100%;
}

/* Hide the default date & time picker icons in WebKit browsers (Chrome, Safari, Edge) */
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
  opacity: 0;
  pointer-events: none;
}

/* Hide the default date & time picker icons in Firefox */
input[type="date"],
input[type="time"] {
  -moz-appearance: textfield;
}
</style>