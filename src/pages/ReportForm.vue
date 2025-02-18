<script setup>
import { ref, computed, onMounted } from 'vue';
import { useThemeStore } from '../stores/themeStore';
import axiosClient from '../axios';

const themeStore = useThemeStore();

const bgClass = computed(() => themeStore.isDarkMode ? 'bg-slate-900' : 'bg-gray-800');
const textClass = computed(() => themeStore.isDarkMode ? 'text-gray-100' : 'text-gray-900');
const chartClass = computed(() => {
    return themeStore.isDarkMode ? 'bg-gray-700 border-gray-500' : 'bg-gray-700 border-gray-900';
})

const submitForm = () => {
//   console.log('Form submitted:', data.value);
//   const formData = new FormData();
//   formData.append('source_id', data.value.source)
//   formData.append('time', data.value.incidentTime)
//   formData.append('incident_id', data.value.incident)
//   formData.append('date_received', data.value.receivedDate)
//   formData.append('arrival_on_site', data.value.arrivalTime)
//   formData.append('name', 'vicnent')
//   formData.append('location_id', data.value.location)
//   formData.append('actions_id', data.value.actionType)
//   formData.append('assistance_id', data.value.incidentType)
//   console.log(formData)
//   formData.append('longitude', data.value.)
//   formData.append('latitude', data.value.)
  axiosClient.post('/api/911/report', formData, {
    headers: {
      'x-api-key':'$m@rtC!ty'
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

const clearForm = () => {
  data.value = {
    source: '',
    incidentType: '',
    incident: '',
    actionType: '',
    receivedDate: '',
    arrivalTime: '',
    incidentTime: '',
    location: '',
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
    location: '',
    details: '',
    Longitude: '',
    Latitude: '',
});

const sources = ref([]);
const actions = ref([]);
const incidents = ref([]);
const assistance = ref([]);
const locations = ref([]);

onMounted(() => {
    axiosClient.get('/api/911/report', {
        headers: {
            'x-api-key': '$m@rtC!ty'
        }
    })
    .then((res) => {
        sources.value = res.data.sources;
        actions.value = res.data.actions;
        incidents.value = res.data.incidents;
        assistance.value = res.data.assistance;
        locations.value = res.data.locations;
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        console.log('theres an error')
    });
})
</script>

<template>
    <div :class="bgClass" style="min-height: 100vh;" class="m-8">
        <header>
            <div class="text-white">{{ sources }}</div><br>
            <div class="text-white">{{ actions }}</div><br>
            <div class="text-white">{{ incidents }}</div><br>
            <div class="text-white">{{ assistance }}</div><br>
            <div class="text-white">{{ locations }}</div><br>
            <div class="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
                <h1 class="text-3xl font-bold tracking-tight text-white" :class="textClass">
                    Incident Report Form
                </h1>
            </div>
        </header>

        <main class="flex-1 my-6 px-6">
            <div>{{ data }}</div>
            <form @submit.prevent="submitForm" class="space-y-8 mx-auto max-w-4xl p-6 ">
                <!-- Report Details -->
                <div class="bg-gray-950 p-6 rounded-lg shadow">
                    <h2 class="text-lg font-semibold text-gray-100 mb-4">Report Details</h2>

                    <!-- Incident Information -->
                    <h2 class="text-md font-semibold text-gray-300 mb-3">Incident Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div class="form-group">
                            <label for="source" class="block text-sm font-medium mb-2 text-gray-100">Source of
                                Report</label>
                            <select id="source" v-model="data.source"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600" required>
                                <option disabled value="">Select source</option>
                                <option v-for="source in sources" :key="source.id" :value="source.sources">
                                    {{ source.sources }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="incidentType" class="block text-sm font-medium mb-2 text-gray-100">Case
                                Classification</label>
                            <select id="incidentType" v-model="data.incidentType"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600" required>
                                <option disabled value="">Select classification</option>
                                <option v-for="assistance in assistance" :key="assistance.id" :value="assistance.assistance">
                                    {{ assistance.assistance }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="incident"
                                class="block text-sm font-medium mb-2 text-gray-100">Incident/Case</label>
                            <select id="incident" v-model="data.incident"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600" required>
                                <option disabled value="">Select incident</option>
                                <option v-for="incident in incidents" :key="incident.id" :value="incident.type">
                                    {{ incident.type }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Action Type -->
                    <h2 class="text-md font-semibold text-gray-300 mb-3">Action Information</h2>
                    <div class="grid grid-cols-1 mb-6">
                        <div class="form-group">
                            <label for="actionType" class="block text-sm font-medium mb-2 text-gray-100">Type of
                                Action</label>
                            <select id="actionType" v-model="data.actionType"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600" required>
                                <option disabled value="">Select action</option>
                                <option v-for="action in actions" :key="action.id" :value="action.actions">
                                    {{ action.actions }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Time Information -->
                    <h2 class="text-md font-semibold text-gray-300 mb-3">Date and Time Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div class="form-group">
                            <label for="receivedDate" class="block text-sm font-medium mb-2 text-gray-100">Date
                                Received</label>
                            <input type="date" id="receivedDate" v-model="data.receivedDate"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                                required />
                        </div>

                        <div class="form-group">
                            <label for="arrivalDate" class="block text-sm font-medium mb-2 text-gray-100">Time of
                                Arrival on Site
                            </label>
                            <input type="time" id="arrivalDate" v-model="data.arrivalTime"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                                required />
                        </div>

                        <div class="form-group">
                            <label for="incidentTime" class="block text-sm font-medium mb-2 text-gray-100">Time of
                                Incident</label>
                            <input type="time" id="incidentTime" v-model="data.incidentTime"
                            class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                            required />
                        </div>
                    </div>
<hr>
                    <!-- Location Details -->
                    <h2 class="text-md font-semibold text-gray-300 mb-3">Location Details</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label for="place" class="block text-sm font-medium mb-2 text-gray-100">Place of
                                Incident</label>
                                <select id="place" v-model="data.location"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600" required>
                                <option disabled value="">Select Barangay (128)</option>
                                <option v-for="location in locations" :key="location.id" :value="location.burnham">
                                    {{ location.name }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="details" class="block text-sm font-medium mb-2 text-gray-100">Location
                                Details</label>
                            <input id="details" v-model="data.details"
                                placeholder="Enter location details/landmarks"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                                required />
                        </div>

                        <div class="form-group">
                            <label for="longitude"
                                class="block text-sm font-medium mb-2 text-gray-100">Longitude</label>
                            <input id="longitude" v-model="data.Longitude" placeholder="Enter Longitude"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                                required />
                        </div>

                        <div class="form-group">
                            <label for="latitude" class="block text-sm font-medium mb-2 text-gray-100">Latitude</label>
                            <input id="latitude" v-model="data.Latitude" placeholder="Enter Latitude"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                                required />
                        </div>

                        <div class="form-group"></div>
                        <!-- Buttons -->
                        <div class="flex justify-end space-x-4">
                            <button type="button" @click="clearForm"
                                class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                                Clear
                            </button>
                            <button type="submit" class="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-600">
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>

            </form>
        </main>
    </div>
</template>

<style scoped>
/* Ensure all form input elements inside .form-group are styled correctly */
.form-group select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid #4b5563;
    /* Tailwind gray-600 */
    background-color: #ffffff;
    /* Tailwind gray-800 */
    color: #4b5563;
    /* Tailwind gray-600 */
}

.form-group :deep(input) {
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid #4b5563;
    /* Tailwind gray-600 */
    background-color: #ffffff;
    /* Tailwind gray-800 */
    color: #4b5563;
    /* Tailwind gray-600 */
}
</style>
