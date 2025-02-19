<script setup>
import { ref, computed, onMounted } from 'vue';
import { useThemeStore } from '../stores/themeStore';
import PrimaryButton from '../components/PrimaryButton.vue';
import axiosClient from '../axios';

const themeStore = useThemeStore();
const theme = ref(localStorage.getItem("theme") || "light");
onMounted(() => {
    if (localStorage.getItem("theme") === "dark") {
        document.documentElement.classList.add("dark");
        theme.value = "dark";
    }
    console.log(theme.value);
});


const bgClass = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-800 border-black text-white" : "bg-sky-950 border-gray-200 text-sky-900"
})


const reportSources = [
  { name: '911', value: '911' },
  { name: 'CDRRMO', value: 'cdrrmo' },
  { name: 'Icom Radio', value: 'icomradio' },
  { name: 'EMS Hotline', value: 'emshotline' },
  { name: 'Other', value: 'other' }
];

const incidentTypes = [
  { name: 'Medical Assistance', value: 'medical' },
  { name: 'Police Assistance', value: 'police' },
  { name: 'Fire Assistance', value: 'fire' },
  { name: 'Rescue Assistance', value: 'rescue' },
  { name: 'General Assistance', value: 'general' },
  { name: 'Other', value: 'other' }
];

const incident = [
  { name: 'Brawl', value: 'brawl' },
  { name: 'Assault', value: 'assault' },
  { name: 'Vandalism', value: 'vandalism' },
  { name: 'Traffic Violation', value: 'traffic' },
  { name: 'Suspicious Activity', value: 'suspicious' },
  { name: 'Other', value: 'other' }
];

const actionTypes = [
  { name: 'Solved', value: 'solved' },
  { name: 'Pending', value: 'pending' },
  { name: 'Referred', value: 'referred' }
];

const barangay = [
  { name: 'Itogon', value: 'itogon' },
  { name: 'Bakakeng', value: 'bakakeng' },
  { name: 'St. Antonio', value: 'stAntonio' }
]

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
    <div style="min-height: 100vh;">
        <div class="text-white">{{ sources }}</div><br>
            <div class="text-white">{{ actions }}</div><br>
            <div class="text-white">{{ incidents }}</div><br>
            <div class="text-white">{{ assistance }}</div><br>
            <div class="text-white">{{ locations }}</div><br>

        <main class="flex-1 my-2 px-2">
            <div>{{ data }}</div>
            <form @submit.prevent="submitForm" class="space-y-6 mx-auto max-w-3xl p-4">
                <div class="bg-gray-100 p-6 rounded-lg shadow-lg">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Source Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="form-group">
                            <label for="source" class="block text-sm font-medium mb-2 text-gray-700">Source of Report</label>
                            <select id="source" v-model="data.source" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                                <option disabled value="">Select source</option>
                                <option v-for="source in sources" :key="source.id" :value="source.sources">
                                    {{ source.sources }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="incidentType" class="block text-sm font-medium mb-2 text-gray-700">Case Classification</label>
                            <select id="incidentType" v-model="data.incidentType" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                                <option disabled value="">Select classification</option>
                                <option v-for="assistance in assistance" :key="assistance.id" :value="assistance.assistance">{{ assistance.assistance }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="incident" class="block text-sm font-medium mb-2 text-gray-700">Incident/Case</label>
                            <select id="incident" v-model="data.incident" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                                <option disabled value="">Select incident</option>
                                <option v-for="incident in incidents" :key="incident.id" :value="incident.type">{{ incident.type }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="actionType" class="block text-sm font-medium mb-2 text-gray-700">Type of Action</label>
                            <select id="actionType" v-model="data.actionType" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                                <option disabled value="">Select action</option>
                                <option v-for="action in actions" :key="action.id" :value="action.actions">{{ action.actions }}</option>
                            </select>
                        </div>
                    </div>

                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Time Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="form-group">
                            <label for="receivedDate" class="block text-sm font-medium mb-2 text-gray-700">Date Received</label>
                            <input type="date" id="receivedDate" v-model="data.receivedDate" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                        <div class="form-group">
                            <label for="arrivalDate" class="block text-sm font-medium mb-2 text-gray-700">Time of Arrival on Site</label>
                            <input type="time" id="arrivalDate" v-model="data.arrivalTime" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                        <div class="form-group">
                            <label for="incidentTime" class="block text-sm font-medium mb-2 text-gray-700">Time of Incident</label>
                            <input type="time" id="incidentTime" v-model="data.incidentTime" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                    </div>

                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Place Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label for="place" class="block text-sm font-medium mb-2 text-gray-700">Place of Incident</label>
                            <select id="place" v-model="data.location" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                                <option disabled value="">Select Barangay (128)</option>
                                <option v-for="location in locations" :key="location.id" :value="location.burnham">{{ location.name }}</option>
                            </select>
                        </div>
                        <div class="form-group md:col-span-2">
                            <label for="details" class="block text-sm font-medium mb-2 text-gray-700">Location Details</label>
                            <input id="details" v-model="data.details" placeholder="Enter location details/landmarks" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                        <div class="form-group">
                            <label for="longitude" class="block text-sm font-medium mb-2 text-gray-700">Longitude</label>
                            <input id="longitude" v-model="data.Longitude" placeholder="Enter Longitude" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                        <div class="form-group">
                            <label for="latitude" class="block text-sm font-medium mb-2 text-gray-700">Latitude</label>
                            <input id="latitude" v-model="data.Latitude" placeholder="Enter Latitude" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 mt-8">
                        <PrimaryButton type="button" name="Clear" @click="clearForm" class="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200" />
                        <PrimaryButton type="submit" name="Add Report" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200" />
                    </div>
                </div>
            </form>
</main>
    </div>
</template>

<style scoped>

</style>