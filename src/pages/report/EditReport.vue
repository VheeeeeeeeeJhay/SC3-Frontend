<script setup>
import { ref, onMounted, watchEffect, watch, computed, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosClient from '../../axios.js';
import { useGeolocation } from '@vueuse/core';
import { userMarker } from '../../stores/mapStore.js';
import leaflet from 'leaflet';
import useUserStore from '../../stores/user.js';
import ReportFormSkeleton from '../../components/skeleton/ReportFormSkeleton.vue';
import { useArrayStore } from '../../stores/arrayStore';  // Import the Pinia store
import { useDatabaseStore } from '../../stores/databaseStore';

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
    urgency: '',
});
console.log("Data:", data.value.name);

const originalData = shallowRef('');

// const sources = ref([]);
// const actions = ref([]);
// const incidents = ref([]);
// const assistance = ref([]);
// const barangays = ref([]);
// const urgencies = ref([]);

const errors = ref([]); // Define errors
let map = null;
let marker = null;

const databaseStore = useDatabaseStore();

let refreshInterval = null;

const findData = async () => {
    try {
        const response = await axiosClient.get(`/api/911/report-edit/${report_Id}`, {
        headers: {
                'x-api-key': import.meta.env.VITE_API_KEY
            }
        })
        console.log("API Response:", response.data);
        originalData.value = { ...response.data }; // Store original data
        data.value = { ...response.data };
        // Ensure dropdown fields store the correct IDs
        data.value.source = response.data.source?.id ?? '';
        data.value.classification = response.data.assistance?.id ?? '';
        data.value.incident = response.data.incident?.id ?? '';
        data.value.barangay = response.data.barangay?.id ?? '';
        data.value.actions = response.data.actions?.id ?? '';
        data.value.details = response.data.landmark ?? '';
        data.value.latitude = response.data.latitude ?? '';
        data.value.longitude = response.data.longitude ?? '';
        data.value.receivedDate = response.data.date_received?.split('T')[0] ?? ''; // Extract YYYY-MM-DD
        data.value.arrival_on_site = response.data.arrival_on_site?.slice(0, 5) ?? ''; // Extract HH:mm
        data.value.time = response.data.time?.slice(0, 5) ?? ''; // Extract HH:mm
        data.value.urgency = response.data.urgency?.id ?? '';
        console.log(data.value);
        // Initialize the map AFTER data is received
        // initMap();
    } catch (error) {
        console.error('Error fetching data:', error);
        errors.value = error.response?.data.error || 'Failed to load data. Please try again later.';
    }
}

// =========================================================================================================================================================
// =========================================================================================================================================================
// =========================================================================================================================================================
// =========================================================================================================================================================
// =========================================================================================================================================================
// =========================================================================================================================================================
const store = useArrayStore();
const storage = ref({});
storage.value = store.getData();
console.log(storage.value);
console.log(storage.value.barangay.name);
console.log(storage.value.barangay.longitude);
console.log(storage.value.barangay.latitude);


// storage.value = Object.values(store.getData());
// console.log(storage.value);
// storage.value = Object.entries(store.getData());
// console.log(storage.value);

// const computedArray = computed(() => Object.values(storage.value));
// const report = computedArray()

// const report = computed(() => Object.values(storage.value));
// console.log(report.value);


const updateForm = async () => {
    const payload = {
        // user_id: user.value.id,
        source_id: data.value.source,
        time: data.value.time,
        incident_id: data.value.incident,
        date_received: data.value.receivedDate,
        arrival_on_site: data.value.arrival_on_site,
        name: data.value.name,
        landmark: data.value.details,
        barangay_id: data.value.barangay,
        actions_id: data.value.actions,
        assistance_id: data.value.classification,
        longitude: data.value.longitude,
        latitude: data.value.latitude,
        urgency_id: data.value.urgency
    };
    try {
        axiosClient.put(`/api/911/report/${report_Id}`, payload, {
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
            }
        })
        .then(response => {
            console.log('Report updated successfully:', response.data);
            // Optionally, refresh the originalData reference
            originalData.value = { ...data.value };
            router.push({ name: 'ReportTable' });
        })
    } catch (error) {
        console.error('Error updating report:', error.response?.data.errors);
        errors.value = error.response?.data.errors || 'Failed to update report. Please try again later.';
    }
};

console.log(data.value);

onMounted(() => {

    // fetchData();
    findData();
    // initMap();
    databaseStore.fetchData();

    initMap();

    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);
    
});

const computedProperties = {
    sources: "sources",
    actions: "actions",
    incidents: "incidents",
    assistance: "assistance",
    urgencies: "urgencies",
    barangays: "barangays",
};

const { 
    sources, 
    actions, 
    incidents, 
    assistance, 
    urgencies, 
    barangays 
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);


// Filter The Incident/Case Base On The Assistance Type
const filteredIncidents = computed(() => {
    return data.value.classification
        ? incidents.value.filter(incident => incident.assistance_id === data.value.classification)
        : [];
});


//Map scripts
const { coords } = useGeolocation();

const initMap = () => {
    if (!latitude || !longitude) {
        console.error("Latitude or Longitude is missing");
        return;
    }

    if (map) return; // Prevent reinitialization

    map = leaflet.map('map').setView([storage.value.latitude, storage.value.longitude], 13);

    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Define Baguio City boundaries
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

    map.addEventListener("click", (e) => {
        const { lat: newLat, lng: newLng } = e.latlng;

        if (bounds.contains([newLat, newLng])) {
            // Remove previous marker if exists
            if (marker) {
                map.removeLayer(marker);
            }

            // Add a new marker
            marker = leaflet.marker([newLat, newLng])
                .addTo(map)
                .bindPopup(`Selected Marker at (<strong>${newLat.toFixed(5)}, ${newLng.toFixed(5)}</strong>)`)
                .openPopup();

            // Update the stored user marker
            userMarker.value.latitude = newLat;
            userMarker.value.longitude = newLng;

            // Update form inputs
            data.value.latitude = newLat.toFixed(5);
            data.value.longitude = newLng.toFixed(5);
        } else {
            alert("You cannot place markers outside Baguio City.");
        }
    });
};

// Watch geolocation changes but don’t override manual marker selection
watchEffect(() => {
    if (data.value.latitude && data.value.longitude) {
        console.log("Updated Coordinates:", data.value.latitude, data.value.longitude);
    }

    if (coords.value.latitude && coords.value.longitude &&
        isFinite(coords.value.latitude) && isFinite(coords.value.longitude)) {
        // Only update if user hasn't set a marker
        if (!userMarker.value.latitude || !userMarker.value.longitude) {
            data.value.latitude = coords.value.latitude.toFixed(5);
            data.value.longitude = coords.value.longitude.toFixed(5);
        }
    } else {
        // If geolocation fails, default to Baguio City
        if (!userMarker.value.latitude || !userMarker.value.longitude) {
            data.value.latitude = "16.404000";
            data.value.longitude = "120.599000";
        }
    }
});

let singleMarker;
watch(() => data.value.barangay, (newBarangayId) => {
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

const openTimePicker = () => {
    document.getElementById("arrival_on_site").showPicker();
};
const openTimePicker2 = () => {
    document.getElementById("time").showPicker();
};
const openDatePicker = () => {
    document.getElementById("receivedDate").showPicker();
};

</script>

<template>
    <div>
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


            <main class="flex-1 my-2">
                <form @submit.prevent="updateForm" class="space-y-6 mt-6 mx-auto max-w-6xl">
                    <div
                        class="p-6 rounded-lg shadow-lg flex bg-sky-50 text-gray-800 dark:bg-slate-800 dark:text-white">
                        <div class="w-1/2 pr-4">
                            <h2 class="text-2xl font-bold mb-6">Report Information</h2>
                            <div class="grid grid-cols-2 gap-4 mb-8">

                                <div class="form-group">
                                    <label for="incidentType" class="block text-sm font-medium mb-2">
                                        Case Classification
                                        <ToolTip Information="This is the type of assistance that is being reported." />
                                    </label>
                                    <select id="incidentType" v-model="data.classification"
                                        class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                                        <option disabled value="">Select classification</option>
                                        <option v-for="assistance in assistance" :key="assistance.id"
                                            :value="assistance.id">{{ assistance.assistance }}</option>
                                    </select>
                                    <span class="text-sm text-red-500" v-if="errors.classification && errors.classification.length">{{ errors.classification[0] }}</span>
                                </div>

                                <div class="form-group">
                                    <!-- <FormInput name="source" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.source.sources" /> -->
                                    <label for="source" class="block text-sm font-medium mb-2">
                                        Source of Report
                                        <ToolTip Information="This is the type of assistance that is being reported." />
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
                                    <label for="incident" class="block text-sm font-medium mb-2">
                                        Incident/Case
                                        <ToolTip Information="This is the type of incident that is being reported." />
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
                                    <label for="actionType" class="block text-sm font-medium mb-2">
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

                                <div class="form-group">
                                    <label for="urgency" class="block text-sm font-medium mb-2">
                                        Urgency
                                        <ToolTip Information="This is the urgency of the report." />
                                    </label>
                                    <select id="urgency" v-model="data.urgency"
                                        class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                                        <option disabled value="">Select urgency</option>
                                        <option v-for="urgency in urgencies" :key="urgency.id" :value="urgency.id">
                                            {{ urgency.urgency }}</option>
                                    </select>
                                </div>
                            </div>

                            <h2 class="text-2xl font-bold mb-6 mt-12">Time Information</h2>
                            <div class="space-y-4 grid grid-cols-2 gap-4 mb-8">
                                <div class="form-group relative">
                                    <label for="receivedDate" class="block text-sm font-medium mb-2">
                                        Date Received
                                        <ToolTip Information="This is the date when the report was received." />
                                    </label>
                                    <input type="date" id="receivedDate" v-model="data.receivedDate"
                                        @click="openDatePicker"
                                        class=" appearance-none w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                    <span @click="openDatePicker"
                                        class="material-icons calendar_month absolute right-3 top-11 text-gray-800 dark:text-white" />
                                </div>
                                <div class="form-group relative">
                                    <label for="arrival_on_site" class="block text-sm font-medium mb-2">
                                        Time of Arrival on Site {{ arrival_on_site }}
                                        <ToolTip Information="This is the time when the report was received." />
                                    </label>

                                    <input type="time" id="arrival_on_site" v-model="data.arrival_on_site"
                                        @click="openTimePicker"
                                        class="appearance-none w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 
                                            bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white pr-10" />

                                    <!-- Custom Clock Icon that triggers the input -->
                                    <span @click="openTimePicker"
                                        class="material-icons schedule absolute right-3 top-11 text-gray-800 dark:text-white" />
                                </div>
                                <div class="form-group relative">
                                    <label for="time" class="block text-sm font-medium mb-2">
                                        Time of Incident
                                        <ToolTip Information="This is the time when the incident occurred." />
                                    </label>
                                    <input type="time" id="time" v-model="data.time" @click="openTimePicker2"
                                        class="appearance-none w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 
                                        bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white pr-10" />

                                    <span @click="openTimePicker2"
                                        class="material-icons schedule absolute right-3 top-11 text-gray-800 dark:text-white" />
                                </div>
                            </div>
                        </div>

                        <div class="w-px bg-gray-300 mx-4"></div>

                        <!-- right side -->
                        <div class="w-1/2 pl-4">
                            <h2 class="text-2xl font-bold mb-6">Place Information</h2>
                            <div class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="form-group">
                                        <label for="place" class="block text-sm font-medium mb-2">
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
                                        <label for="details" class="block text-sm font-medium mb-2">
                                            Location Details
                                            <ToolTip Information="This is the location where the incident occurred." />
                                        </label>
                                        <input id="details" v-model="data.details"
                                            placeholder="Enter location details/landmarks"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                        <span class="text-sm text-red-500" v-if="errors.details && errors.details.length">{{ errors.details[0] }}</span>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <div id="map" class="mb-4 h-64 z-10"></div>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="form-group">
                                        <label for="longitude" class="block text-sm font-medium mb-2">
                                            Longitude
                                            <ToolTip
                                                Information="This is the longitude of the location where the incident occurred." />
                                        </label>
                                        <input id="longitude" v-model="data.longitude" placeholder="Enter Longitude"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                    </div>
                                    <div class="form-group">
                                        <label for="latitude" class="block text-sm font-medium mb-2">
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

            <!-- <ReportFormSkeleton v-else /> -->
        </div>
    </div>
    <!-- </div> -->
</template>

<style scoped>
#map {
    height: 35vh;
    width: 100%;
    border: 1px solid #ccc;
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