<script setup>
import { ref, onMounted, watchEffect, watch, computed, shallowRef, onUnmounted, inject } from 'vue';
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

const route = useRoute();
const router = useRouter();
const report_Id = route.params.id;

const store = useArrayStore();
const storage = ref({});
storage.value = store.getData();

// Full Name of Auth User
const fullName = computed(() => {
    return user.value.firstName + ' ' + user.value.lastName
})
const data = ref({
    name: fullName.value,
    source: storage.value.source.id,
    assistance: storage.value.assistance.id,
    incident: storage.value.incident.id,
    actions: storage.value.actions.id,
    date_received: storage.value.date_received,
    arrival_on_site: storage.value.arrival_on_site,
    time: storage.value.time,
    barangay: storage.value.barangay.id,
    landmark: storage.value.landmark,
    longitude: storage.value.longitude,
    latitude: storage.value.latitude,
    urgency: storage.value.urgency.id,
    description: storage.value.description,
});


const originalData = shallowRef('');

const errors = ref([]); // Define errors
let map = null;
let marker = null;

const databaseStore = useDatabaseStore();


let refreshInterval = null;

const addToast = inject('addToast'); 

const updateForm = async () => {
    const payload = {
        // user_id: user.value.id,
        source_id: data.value.source,
        time: data.value.time,
        incident_id: data.value.incident,
        date_received: data.value.date_received,
        arrival_on_site: data.value.arrival_on_site,
        name: data.value.name,
        landmark: data.value.landmark,
        barangay_id: data.value.barangay,
        actions_id: data.value.actions,
        assistance_id: data.value.assistance,
        longitude: data.value.longitude,
        latitude: data.value.latitude,
        urgency_id: data.value.urgency,
        description: data.value.description
    };

    axiosClient.put(`/api/911/report/${report_Id}`, payload, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY,
        }
    })
    .then(response => {
        originalData.value = { ...data.value };
        addToast(response.data.message, 'success', 'check_circle');
        router.push({ name: 'ReportTable' });
    })
    .catch (error => {
        errors.value = error.response?.data.errors || 'Failed to update report. Please try again later.';
        addToast(error.response.data.message, 'error', 'error');
    })
};


onMounted(() => {
    databaseStore.fetchData();

    initMap();

    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);
});

onUnmounted(() => {
  // Clear the interval when the component is unmounted or page is reloaded
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
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
    return data.value.assistance
        ? incidents.value.filter(incident => incident.assistance_id === data.value.assistance)
        : [];
});


//Map scripts
const { coords } = useGeolocation();

const initMap = () => {
    if (!latitude || !longitude) {
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
    marker = leaflet.marker([storage.value.latitude, storage.value.longitude]).addTo(map)
        .bindPopup(`Original Marker: (${storage.value.latitude}, ${storage.value.longitude})`)
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
                .bindPopup(`Selected Marker at (<strong>${newLat.toFixed(4)}, ${newLng.toFixed(4)}</strong>)`)
                .openPopup();

            // Update the stored user marker
            userMarker.value.latitude = newLat;
            userMarker.value.longitude = newLng;

            // Update form inputs
            data.value.latitude = newLat.toFixed(4);
            data.value.longitude = newLng.toFixed(4);
        } else {
            alert("You cannot place markers outside Baguio City.");
        }
    });
};

// Watch geolocation changes but don’t override manual marker selection
watchEffect(() => {
    // if (storage.value.barangay.latitude && storage.value.barangay.longitude) {
    //     console.log("Updated Coordinates:", storage.value.barangay.latitude, storage.value.barangay.longitude);
    // }

    if (coords.value.latitude && coords.value.longitude &&
        isFinite(coords.value.latitude) && isFinite(coords.value.longitude)) {
        // Only update if user hasn't set a marker
        if (!userMarker.value.latitude || !userMarker.value.longitude) {
            storage.value.barangay.latitude = coords.value.latitude.toFixed(5);
            storage.value.barangay.longitude = coords.value.longitude.toFixed(5);
        }
    } else {
        // If geolocation fails, default to Baguio City
        if (!userMarker.value.latitude || !userMarker.value.longitude) {
            storage.value.barangay.latitude = "16.404000";
            storage.value.barangay.longitude = "120.599000";
        }
    }
});

let singleMarker;
watch(() => storage.value.barangay.id, (newBarangayId) => {
    const selectedBarangay = barangays.value.find(b => b.id === newBarangayId);

    if (selectedBarangay) {
        storage.value.barangay.longitude = selectedBarangay.longitude || '';
        storage.value.barangay.latitude = selectedBarangay.latitude || '';


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
        storage.value.barangay.longitude = '';
        storage.value.barangay.latitude = '';
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
                <button type="button" name="Back" @click.prevent="router.back()"
                    class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
                    <span class="material-icons mr-2">
                        arrow_back
                    </span>
                    Back
                </button>
            </div>


            <main class="flex-1 my-2">
                <form @submit.prevent="updateForm" class="space-y-6 mt-6 mx-auto max-w-6xl">
                    <div
                        class="p-6 rounded-lg shadow-lg flex bg-sky-50 text-gray-800 dark:bg-slate-800 dark:text-white">
                        <div class="w-1/2 pr-4">
                            <h2 class="text-2xl font-bold mb-4 ">Report Information</h2>
                            <div class="grid grid-cols-2 grid-rows-1 gap-2">

                            <div class="form-group">
                                <label for="source_id" class="block text-sm font-medium mb-2">Source of
                                Report
                                <ToolTip Information="This is the source of the report." />
                                </label>
                                <select id="source_id" v-model="data.source"
                                class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                                <option disabled value="">Select source</option>
                                <option v-for="source in sources" :key="source.id" :value="source.id">
                                    {{ source.sources || "No Source Available" }}
                                </option>
                                </select>
                                <span class="text-sm text-red-500" v-if="errors.source && errors.source.length">{{
                                errors.source[0] }}</span>
                            </div>

                            <div class="form-group">
                                <label for="actions_id" class="block text-sm font-medium mb-2">Type of
                                Action
                                <ToolTip Information="This is the type of action that is being reported." />
                                </label>
                                <select id="actions_id" v-model="data.actions"
                                class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                                <option disabled value="">Select action</option>
                                <option v-for="action in actions" :key="action.id" :value="action.id">{{ action.actions }}</option>
                                </select>
                                <span class="text-sm text-red-500" v-if="errors.actions && errors.actions.length">{{
                                errors.actions[0] }}</span>
                            </div>

                            <div class="form-group">
                                <label for="assistance_id" class="block text-sm font-medium mb-2">Case
                                Classification
                                <ToolTip Information="This is the type of assistance that is being reported." />
                                </label>
                                <select id="assistance_id" v-model="data.assistance"
                                class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                                <option disabled value="">Select classification</option>
                                <option v-for="assistance in assistance" :key="assistance.id" :value="assistance.id">{{
                                    assistance.assistance }}</option>
                                </select>
                                <span class="text-sm text-red-500" v-if="errors.assistance && errors.assistance.length">{{
                                errors.assistance[0] }}</span>
                            </div>

                            <div class="form-group">
                                <label for="incident_id" class="block text-sm font-medium mb-2">
                                Incident/Case
                                <ToolTip Information="This is the incident or case that is being reported." />
                                </label>
                                <select id="incident_id" v-model="data.incident" :class="[
                                'w-full p-3 rounded-lg border focus:ring-2 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white',
                                (!data.assistance || filteredIncidents.length === 0)
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'focus:ring-blue-500'
                                ]" :disabled="!data.assistance || filteredIncidents.length === 0">
                                <option disabled value="">Select incident</option>
                                <option v-for="incident in filteredIncidents" :key="incident.id" :value="incident.id">
                                    {{ incident.type }}
                                </option>
                                </select>
                                <span class="text-sm text-red-500" v-if="errors.incident && errors.incident.length">{{
                                errors.incident[0] }}</span>
                            </div>

                            <div class="form-group col-span-2">
                                <label for="description" class="block text-sm font-medium mb-2">Description
                                <ToolTip Information="This is the description of the report." />
                                </label>
                                <textarea id="description" v-model="data.description" placeholder="Enter description of case"
                                class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white"></textarea>
                            </div>

                            <div class="form-group row-start-4">
                                <label for="urgency_id" class="block text-sm font-medium mb-2">Urgency
                                <ToolTip Information="This is the urgency of the report." />
                                </label>
                                <select id="urgency_id" v-model="data.urgency"
                                class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white">
                                <option disabled value="">Select urgency</option>
                                <option v-for="urgency in urgencies" :key="urgency.id" :value="urgency.id">
                                    {{ urgency.urgency }}
                                </option>
                                </select>
                                <span class="text-sm text-red-500" v-if="errors.urgency && errors.urgency.length">{{
                                errors.urgency[0] }}</span>
                            </div>
                            </div>
                            

                            <h2 class="text-2xl font-bold mb-4 mt-6">Time Information</h2>
                            <div class="grid grid-cols-2 grid-rows-1 gap-2">
                                <div class="form-group relative">
                                    <label for="receivedDate" class="block text-sm font-medium mb-2">
                                        Date Received
                                        <ToolTip Information="This is the date when the report was received." />
                                    </label>
                                    <input type="date" id="receivedDate" v-model="data.date_received"
                                        @click="openDatePicker"
                                        class=" appearance-none w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                    <span @click="openDatePicker"
                                        class="material-icons calendar_month absolute right-3 top-11 text-gray-800 dark:text-white" />
                                </div>
                                <div class="form-group relative">
                                    <label for="arrival_on_site" class="block text-sm font-medium mb-2">
                                        Time of Arrival on Site
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
                                    <input type="time" id="time" v-model="data.time" @click="openTimePicker2" step="60"
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
                                        <input id="details" v-model="data.landmark"
                                            placeholder="Enter location details/landmarks"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                        <span class="text-sm text-red-500" v-if="errors.landmark && errors.landmark.length">{{ errors.landmark[0] }}</span>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <div id="map" class="mb-4 h-64 z-5"></div>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="form-group">
                                        <label for="longitude" class="block text-sm font-medium mb-2">
                                            Longitude
                                            <ToolTip
                                                Information="This is the longitude of the location where the incident occurred." />
                                        </label>
                                        <input readonly id="longitude" v-model="data.longitude" placeholder="Enter Longitude"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                        <span class="text-sm text-red-500" v-if="errors.longitude && errors.longitude.length">{{
                                            errors.longitude[0] }}</span>
                                        </div>
                                    <div class="form-group">
                                        <label for="latitude" class="block text-sm font-medium mb-2">
                                            Latitude
                                            <ToolTip
                                                Information="This is the latitude of the location where the incident occurred." />
                                        </label>
                                        <input readonly id="latitude" v-model="data.latitude" placeholder="Enter Latitude"
                                            class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-black dark:text-white" />
                                        <span class="text-sm text-red-500" v-if="errors.latitude && errors.latitude.length">{{
                                        errors.latitude[0] }}</span>
                                    </div>
                                </div>
                                <div class="flex justify-end space-x-4 mt-8">
                                    <PrimaryButton type="submit" name="Update Report"
                                        class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200" />
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