<script setup>
import { ref, computed } from 'vue';
import { useThemeStore } from '../stores/themeStore';

const themeStore = useThemeStore();

const bgClass = computed(() => themeStore.isDarkMode ? 'bg-slate-900' : 'bg-gray-800');
const textClass = computed(() => themeStore.isDarkMode ? 'text-gray-100' : 'text-gray-900');
const chartClass = computed(() => {
    return themeStore.isDarkMode ? 'bg-gray-700 border-gray-500' : 'bg-gray-700 border-gray-900';
})

const formData = ref({
    source: '',
    incidentType: '',
    incident: '',
    place: '',
    Longitude: '',
    Latitude: '',
    details: '',
    actionType: '',
    incidentTime: '',
    arrivalTime: '',
    dateReceived: ''
});

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

const submitForm = () => {
  console.log('Form submitted:', formData.value);
};

const clearForm = () => {
  Object.keys(formData.value).forEach(key => {
    formData.value[key] = '';
  });
};
</script>

<template>
    <div :class="bgClass" style="min-height: 100vh;">
        <header>
            <div class="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
                <h1 class="text-3xl font-bold tracking-tight text-white" :class="textClass">
                    Incident Report Form
                </h1>
            </div>
        </header>

        <main class="flex-1 my-6 px-6">
            <div>{{ formData }}</div>
            <form @submit.prevent="submitForm" class="space-y-8 mx-auto max-w-4xl p-6">

                <!-- Report Details -->
                <div class="bg-gray-950 p-6 rounded-lg shadow">
                    <h2 class="text-lg font-semibold text-gray-100 mb-4">Report Details</h2>

                    <!-- Incident Information -->
                    <h2 class="text-md font-semibold text-gray-300 mb-3">Incident Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div class="form-group">
                            <label for="source" class="block text-sm font-medium mb-2 text-gray-100">Source of
                                Report</label>
                            <select id="source" v-model="formData.source"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600" required>
                                <option disabled value="">Select source</option>
                                <option v-for="option in reportSources" :key="option.value" :value="option.value">
                                    {{ option.name }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="incidentType" class="block text-sm font-medium mb-2 text-gray-100">Case
                                Classification</label>
                            <select id="incidentType" v-model="formData.incidentType"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600" required>
                                <option disabled value="">Select classification</option>
                                <option v-for="option in incidentTypes" :key="option.value" :value="option.value">
                                    {{ option.name }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="incident"
                                class="block text-sm font-medium mb-2 text-gray-100">Incident/Case</label>
                            <select id="incident" v-model="formData.incident"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600" required>
                                <option disabled value="">Select incident</option>
                                <option v-for="option in incident" :key="option.value" :value="option.value">
                                    {{ option.name }}
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
                            <select id="actionType" v-model="formData.actionType"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600" required>
                                <option disabled value="">Select action</option>
                                <option v-for="option in actionTypes" :key="option.value" :value="option.value">
                                    {{ option.name }}
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
                            <input type="date" id="receivedDate" v-model="formData.receivedDate"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                                required />
                        </div>

                        <div class="form-group">
                            <label for="arrivalDate" class="block text-sm font-medium mb-2 text-gray-100">Time of
                                Arrival on Site
                            </label>
                            <input type="time" id="arrivalDate" v-model="formData.arrivalTime"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                                required />
                        </div>

                        <div class="form-group">
                            <label for="incidentTime" class="block text-sm font-medium mb-2 text-gray-100">Time of
                                Incident</label>
                            <input type="time" id="incidentTime" v-model="formData.incidentTime"
                            class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                            required />
                        </div>
                    </div>

                    <!-- Location Details -->
                    <h2 class="text-md font-semibold text-gray-300 mb-3">Location Details</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label for="place" class="block text-sm font-medium mb-2 text-gray-100">Place of
                                Incident</label>
                            <input id="place" v-model="formData.place" placeholder="Enter place (128 barangay)"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                                required />
                        </div>

                        <div class="form-group">
                            <label for="longitude"
                                class="block text-sm font-medium mb-2 text-gray-100">Longitude</label>
                            <input id="longitude" v-model="formData.Longitude" placeholder="Enter Longitude"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                                required />
                        </div>

                        <div class="form-group">
                            <label for="latitude" class="block text-sm font-medium mb-2 text-gray-100">Latitude</label>
                            <input id="latitude" v-model="formData.Latitude" placeholder="Enter Latitude"
                                class="w-full bg-gray-800 text-gray-100 p-2 rounded-lg border border-gray-600"
                                required />
                        </div>

                        <div class="form-group">
                            <label for="details" class="block text-sm font-medium mb-2 text-gray-100">Location
                                Details</label>
                            <input id="details" v-model="formData.details"
                                placeholder="Enter location details/landmarks"
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
