<script setup>
import { ref, onMounted, watchEffect, watch, computed, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosClient from '../../axios.js';
import FormInput from '../../components/FormInput.vue';
import { useGeolocation } from '@vueuse/core';
import { userMarker } from '../../stores/mapStore.js';
import PrimaryButton from '../../components/PrimaryButton.vue';
import leaflet from 'leaflet';

import useUserStore from '../../stores/user.js';

// Get Auth User Information
const userStore = useUserStore();
const user = computed(() => userStore.user);
console.log("USER ID:", user.value.id);

const route = useRoute();
const router = useRouter();
const report_Id = route.params.id;

// Full Name of Auth User
const fullName = computed(() => {
    return user.value.firstName + ' ' + user.value.lastName
})
const data = ref({
    name: fullName.value,
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

// Store Fetch Data From Backend In An Array
const originalData = shallowRef(null); // Store original data

const sources = ref([]);
const actions = ref([]);
const incidents = ref([]);
const assistance = ref([]);
const barangays = ref([]);

const errorMessage = ref(''); // Define errorMessage
const isLoading = ref(false); // Define loading state
let map = null;
let marker = null;

onMounted(() => {
    //fetch data for dropdowns
    axiosClient.get('/api/911/report', {
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
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            errorMessage.value = 'Failed to load data. Please try again later.';
        });


    //fetch data for report item to be updated
    axiosClient.get(`/api/911/report-edit/${report_Id}`, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
        .then((res) => {
            console.log("API Response:", res.data);
            originalData.value = { ...res.data }; // Store original data
            data.value = { ...res.data };;

            // Ensure dropdown fields store the correct IDs
            data.value.source = res.data.source?.id ?? '';
            data.value.classification = res.data.assistance?.id ?? '';
            data.value.incident = res.data.incident?.id ?? '';
            data.value.barangay = res.data.barangay?.id ?? '';
            data.value.actions = res.data.actions?.id ?? '';
            data.value.details = res.data.landmark ?? '';
            data.value.latitude = res.data.latitude ?? '';
            data.value.longitude = res.data.longitude ?? '';
            data.value.receivedDate = res.data.date_received?.split('T')[0] ?? ''; // Extract YYYY-MM-DD
            data.value.arrival_on_site = res.data.arrival_on_site?.slice(0, 5) ?? ''; // Extract HH:mm
            data.value.time = res.data.time?.slice(0, 5) ?? ''; // Extract HH:mm
            // Initialize the map AFTER data is received
            initMap();
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            errorMessage.value = 'Failed to load data. Please try again later.';
        });
});

// Filter The Incident/Case Base On The Assistance Type
const filteredIncidents = computed(() => {
    return data.value.classification
        ? incidents.value.filter(incident => incident.assistance_id === data.value.classification)
        : [];
});


const updateForm = () => {
    const payload = {
        // user_id: user.value.id,
        source_id: data.value.source,
        time: data.value.time,
        incident_id: data.value.incident,
        date_received: data.value.receivedDate,
        arrival_on_site: data.value.arrival_on_site,
        name: data.value.name, // Ensure this matches API expectations
        landmark: data.value.details,
        barangay_id: data.value.barangay,
        actions_id: data.value.actions,
        assistance_id: data.value.classification, // Use `classification` instead of `incidentType`
        longitude: data.value.longitude,
        latitude: data.value.latitude
    };

    console.log("Updating Report with data:", payload);

    axiosClient.put(`/api/911/report/${report_Id}`, payload, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY,
        }
    })
        .then(response => {
            console.log('Report updated successfully:', response.data);
            // Optionally, refresh the originalData reference
            originalData.value = { ...data.value };
        })
        .catch(error => {
            console.error('Error updating report:', error.response?.data || error.message);
        });
};


//Map scripts
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
    <div>
        <div v-if="isLoading" class="flex justify-center">
            <div role="status">
                <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor" />
                    <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill" />
                </svg>
                <span class="sr-only">Loading...</span>
            </div>
        </div>
        <div v-else>
            <div style="min-height: 100vh;" class="">
                <!-- Go Back Button -->
                <div class="mt-6 px-2 flex justify-between">
                    <h1 class="text-2xl font-bold dark:text-white">Edit Report</h1>
                    <Button type="button" name="Back" @click.prevent="router.back()"
                        class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
                        <span class="material-icons mr-2">
                            arrow_back
                        </span>
                        Back
                    </Button>
                </div>

                <main class="flex-1 my-2 ">

                    <form @submit.prevent="updateForm" class="space-y-6 mt-6 max-w-6xl">
                        <div
                            class="p-6 rounded-lg shadow-lg flex bg-sky-50 text-gray-800 dark:bg-slate-800 dark:text-white">
                            <div class="w-1/2 pr-4">
                                <h2 class="text-2xl font-bold mb-6">Report Information</h2>
                                <div class="grid grid-cols-2 gap-4 mb-8">
                                    
                                    <div class="form-group">
                                        <label for="incidentType" class="block text-sm font-medium mb-2"
                                            :class="themeClasses">
                                            Case Classification
                                            <ToolTip
                                                Information="This is the type of assistance that is being reported." />
                                        </label>
                                        <select id="incidentType" v-model="data.classification"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                                            <option disabled value="">Select classification</option>
                                            <option v-for="assistance in assistance" :key="assistance.id"
                                                :value="assistance.id">{{ assistance.assistance }}</option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <!-- <FormInput name="source" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.source.sources" /> -->
                                        <label for="source" class="block text-sm font-medium mb-2">
                                            Source of Report
                                            <ToolTip
                                                Information="This is the type of assistance that is being reported." />
                                        </label>
                                        <select id="source" v-model="data.source"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                                            <option disabled value="">Select source</option>
                                            <option v-for="source in sources" :key="source.id" :value="source.id">
                                                {{ source.sources || "No Source Available" }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label for="incident" class="block text-sm font-medium mb-2"
                                            :class="themeClasses">
                                            Incident/Case
                                            <ToolTip
                                                Information="This is the type of incident that is being reported." />
                                        </label>
                                        <select id="incident" v-model="data.incident"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white"
                                            :disabled="!data.classification || filteredIncidents.length === 0">
                                            <option disabled value="">Select incident</option>
                                            <option v-for="incident in filteredIncidents" :key="incident.id"
                                                :value="incident.id">
                                                {{ incident.type }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="actionType" class="block text-sm font-medium mb-2"
                                            :class="themeClasses">
                                            Type of Action
                                            <ToolTip Information="This is the type of action that is being reported." />
                                        </label>
                                        <select id="actionType" v-model="data.actions"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                                            <option disabled value="">Select action</option>
                                            <option v-for="action in actions" :key="action.id" :value="action.id">{{
                                                action.actions }}</option>
                                        </select>
                                    </div>
                                </div>

                                <h2 class="text-2xl font-bold mb-6 mt-12">Time Information</h2>
                                <div class="space-y-4">
                                    <div class="form-group">
                                        <label for="receivedDate" class="block text-sm font-medium mb-2">
                                            Date Received
                                            <ToolTip Information="This is the date when the report was received." />
                                        </label>
                                        <input type="date" id="receivedDate" v-model="data.receivedDate"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                    </div>
                                    <div class="form-group">
                                        <label for="arrival_on_site" class="block text-sm font-medium mb-2">
                                            Time of Arrival on Site {{ arrival_on_site }}
                                            <ToolTip Information="This is the time when the report was received." />
                                        </label> 
                                        <input type="time" id="arrival_on_site" v-model="data.arrival_on_site"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                    </div>
                                    <div class="form-group">
                                        <label for="time" class="block text-sm font-medium mb-2">
                                            Time of Incident
                                            <ToolTip Information="This is the time when the incident occurred." />
                                        </label>
                                        <input type="time" id="time" v-model="data.time"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
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
                                            <label for="place" class="block text-sm font-medium mb-2"
                                                :class="themeClasses">
                                                Place of Incident
                                                <ToolTip Information="This is the place where the incident occurred." />
                                            </label>
                                            <select id="place" v-model="data.barangay"
                                                class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                                                <option disabled value="">Select Barangay (128)</option>
                                                <option v-for="barangay in barangays" :key="barangay.id"
                                                    :value="barangay.id">{{ barangay.name }}</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="details" class="block text-sm font-medium mb-2"
                                                :class="themeClasses">
                                                Location Details
                                                <ToolTip
                                                    Information="This is the location where the incident occurred." />
                                            </label>
                                            <input id="details" v-model="data.details"
                                                placeholder="Enter location details/landmarks"
                                                class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <div id="map" class="mb-4 h-64 z-10"></div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div class="form-group">
                                            <label for="longitude" class="block text-sm font-medium mb-2"
                                                :class="themeClasses">
                                                Longitude
                                                <ToolTip
                                                    Information="This is the longitude of the location where the incident occurred." />
                                            </label>
                                            <input id="longitude" v-model="data.longitude" placeholder="Enter Longitude"
                                                class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                        </div>
                                        <div class="form-group">
                                            <label for="latitude" class="block text-sm font-medium mb-2"
                                                :class="themeClasses">
                                                Latitude
                                                <ToolTip
                                                    Information="This is the latitude of the location where the incident occurred." />
                                            </label>
                                            <input id="latitude" v-model="data.latitude" placeholder="Enter Latitude"
                                                class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                        </div>
                                    </div>
                                    <div class="flex justify-end space-x-4 mt-8">
                                        <!-- <PrimaryButton type="button" name="Clear" @click="clearForm"
                              class="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200" /> -->
                                        <PrimaryButton type="submit" name="Update Report"
                                            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    </div>
</template>

<style scoped>
#map {
    height: 50vh;
    width: 100%;
    border: 1px solid #ccc;
}
</style>