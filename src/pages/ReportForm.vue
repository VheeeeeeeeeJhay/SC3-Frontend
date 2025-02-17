<template>
  <div :class="bgClass" class="min-h-screen">
    <header class="bg-gray-800 shadow">
      <!-- <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-white">
          Incident Report Form
        </h1>
      </div> -->
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <form @submit.prevent="submitForm" class="space-y-8 bg-gray-200 shadow-sm rounded-lg p-6">
        <div class="space-y-8 divide-y divide-gray-200">
          <div class="space-y-6 sm:space-y-5">
            <div>
              <h3 class="text-lg font-medium leading-6 text-gray-900">Report Details</h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">Please fill out all required fields.</p>
            </div>

            <div class="space-y-6 sm:space-y-5">
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="source" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Source of Report
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <select id="source" v-model="formData.source" class="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                    <option disabled value="">Select source</option>
                    <option v-for="option in reportSources" :key="option.value" :value="option.value">
                      {{ option.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="incidentType" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Case Classification
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <select id="incidentType" v-model="formData.incidentType" class="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                    <option disabled value="">Select classification</option>
                    <option v-for="option in incidentTypes" :key="option.value" :value="option.value">
                      {{ option.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="incident" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Incident/Case
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <select id="incident" v-model="formData.incident" class="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                    <option disabled value="">Select incident</option>
                    <option v-for="option in incident" :key="option.value" :value="option.value">
                      {{ option.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="actionType" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Type of Action
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <select id="actionType" v-model="formData.actionType" class="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                    <option disabled value="">Select action</option>
                    <option v-for="option in actionTypes" :key="option.value" :value="option.value">
                      {{ option.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="receivedDate" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Date Received
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input type="datetime-local" id="receivedDate" v-model="formData.receivedDate" class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>

              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="arrivalDate" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Date of Arrival on Site
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input type="datetime-local" id="arrivalDate" v-model="formData.arrivalDate" class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>

              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="TimeofIncident" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Time of Incident
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input type="datetime-local" id="TimeofIncident" v-model="formData.TimeofIncident" class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>

              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="place" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Place of Incident
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input type="text" id="place" v-model="formData.place" placeholder="Enter place (128 barangay)" class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>

              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="longitude" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Longitude
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input type="text" id="longitude" v-model="formData.Longitude" placeholder="Enter Longitude" class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>

              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="latitude" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Latitude
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input type="text" id="latitude" v-model="formData.Latitude" placeholder="Enter Latitude" class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>

              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="details" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Location Details
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input type="text" id="details" v-model="formData.details" placeholder="Enter location details/landmarks" class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-5">
          <div class="flex justify-end">
            <button type="button" @click="clearForm" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Clear
            </button>
            <button type="submit" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Submit Report
            </button>
          </div>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
  source: '',
  incidentType: '',
  incident: '',
  place: '',
  Longitude: '',
  Latitude: '',
  details: '',
  actionType: '',
  receivedDate: '',
  arrivalDate: '',
  TimeofIncident: ''
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
