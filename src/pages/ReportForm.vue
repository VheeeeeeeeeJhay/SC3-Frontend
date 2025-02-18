<script setup>
import { ref, computed, onMounted } from 'vue';
import { useThemeStore } from '../stores/themeStore';
import PrimaryButton from '../components/PrimaryButton.vue';

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
  console.log('Form submitted:', formData.value);
};

const clearForm = () => {
  formData.value = {
    source: '',
    incidentType: '',
    incident: '',
    actionType: '',
    receivedDate: '',
    arrivalTime: '',
    incidentTime: '',
    place: '',
    details: '',
    Longitude: '',
    Latitude: '',
  }
};

const formData = ref({
    source: '',
    incidentType: '',
    incident: '',
    actionType: '',
    receivedDate: '',
    arrivalTime: '',
    incidentTime: '',
    place: '',
    details: '',
    Longitude: '',
    Latitude: '',
});
</script>

<template>
    <div :class="bgClass" style="min-height: 100vh;">

        <main class="flex-1 my-2 px-2">
            <div>{{ formData }}</div>
            <form @submit.prevent="submitForm" class="space-y-6 mx-auto max-w-3xl p-4">
                <div class="bg-gray-100 p-6 rounded-lg shadow-lg">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Source Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="form-group">
                            <label for="source" class="block text-sm font-medium mb-2 text-gray-700">Source of Report</label>
                            <select id="source" v-model="formData.source" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                                <option disabled value="">Select source</option>
                                <option v-for="option in reportSources" :key="option.value" :value="option.value">{{ option.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="incidentType" class="block text-sm font-medium mb-2 text-gray-700">Case Classification</label>
                            <select id="incidentType" v-model="formData.incidentType" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                                <option disabled value="">Select classification</option>
                                <option v-for="option in incidentTypes" :key="option.value" :value="option.value">{{ option.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="incident" class="block text-sm font-medium mb-2 text-gray-700">Incident/Case</label>
                            <select id="incident" v-model="formData.incident" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                                <option disabled value="">Select incident</option>
                                <option v-for="option in incident" :key="option.value" :value="option.value">{{ option.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="actionType" class="block text-sm font-medium mb-2 text-gray-700">Type of Action</label>
                            <select id="actionType" v-model="formData.actionType" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                                <option disabled value="">Select action</option>
                                <option v-for="option in actionTypes" :key="option.value" :value="option.value">{{ option.name }}</option>
                            </select>
                        </div>
                    </div>

                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Time Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="form-group">
                            <label for="receivedDate" class="block text-sm font-medium mb-2 text-gray-700">Date Received</label>
                            <input type="date" id="receivedDate" v-model="formData.receivedDate" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                        <div class="form-group">
                            <label for="arrivalDate" class="block text-sm font-medium mb-2 text-gray-700">Time of Arrival on Site</label>
                            <input type="time" id="arrivalDate" v-model="formData.arrivalTime" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                        <div class="form-group">
                            <label for="incidentTime" class="block text-sm font-medium mb-2 text-gray-700">Time of Incident</label>
                            <input type="time" id="incidentTime" v-model="formData.incidentTime" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                    </div>

                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Place Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label for="place" class="block text-sm font-medium mb-2 text-gray-700">Place of Incident</label>
                            <select id="place" v-model="formData.place" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200">
                                <option disabled value="">Select Barangay (128)</option>
                                <option v-for="option in barangay" :key="option.value" :value="option.value">{{ option.name }}</option>
                            </select>
                        </div>
                        <div class="form-group md:col-span-2">
                            <label for="details" class="block text-sm font-medium mb-2 text-gray-700">Location Details</label>
                            <input id="details" v-model="formData.details" placeholder="Enter location details/landmarks" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                        <div class="form-group">
                            <label for="longitude" class="block text-sm font-medium mb-2 text-gray-700">Longitude</label>
                            <input id="longitude" v-model="formData.Longitude" placeholder="Enter Longitude" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                        <div class="form-group">
                            <label for="latitude" class="block text-sm font-medium mb-2 text-gray-700">Latitude</label>
                            <input id="latitude" v-model="formData.Latitude" placeholder="Enter Latitude" class="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 mt-8">
                        <PrimaryButton type="button" name="Clear" @click="clearForm" class="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200" />
                        <PrimaryButton type="submit" name="submit" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200" />
                    </div>
                </div>
            </form>
</main>
    </div>
</template>

<style scoped>

</style>
