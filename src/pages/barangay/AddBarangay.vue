<script setup>
import { ref, inject, defineEmits } from 'vue';
import axiosClient from '../../axios.js';
import FormInput from '../../components/FormInput.vue';

const data = ref({
  name: '',
  longitude: '',
  latitude: '',
})

const clearData = () => {
  errors.value = [];
  data.value.name = '';
  data.value.longitude = '';
  data.value.latitude = '';
}

// const message = ref('');
const errors = ref({
  name: [],
  longitude: [],
  latitude: [],
});
// const type = ref('');
// const icon = ref('');
// const classes = ref('');

const addToast = inject('addToast'); // Inject global toast function
const emit = defineEmits(['close']);


const formSubmit = async () => {
  // try {
  console.log(data.value);
  const formData = new FormData();
  formData.append('name', data.value.name);
  formData.append('longitude', data.value.longitude);
  formData.append('latitude', data.value.latitude);
  
  await axiosClient.post("/api/911/barangay", formData, {
    headers: {
      'x-api-key': import.meta.env.VITE_API_KEY
    }
  })
    .then((response) => {
      addToast(response.data.message, 'success', 'check_circle'); // Add success toast
      clearData();
      emit('close');
    })
    .catch ((error) => {
      errors.value = error.response.data.errors;
      addToast(error.response.data.message, 'error', 'error'); // Add error toast
    })
};
</script>

<template>
  <div class="max-w-lg mx-auto bg-sky-50 dark:bg-slate-900 p-2">
    <!-- <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Add Barangay</h2> -->
    <form @submit.prevent="formSubmit" class="space-y-4">

      <!-- Barangay Name -->
      <div class="space-y-1">
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Barangay Name</label>
        <div class="relative">
          <FormInput v-model="data.name" type="text" name="name" placeholder="Enter Barangay Name"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
          <span class="text-sm text-red-500" v-if="errors.name && errors.name.length">{{ errors.name[0] }}</span>
        </div>
      </div>

      <!-- Longitude -->
      <div class="space-y-1">
        <label for="longitude" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
        <div class="relative">
          <FormInput v-model="data.longitude" type="text" name="longitude" placeholder="Enter Longitude"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
          <span class="text-sm text-red-500" v-if="errors.longitude && errors.longitude.length">{{ errors.longitude[0]
            }}</span>
        </div>
      </div>

      <!-- Latitude -->
      <div class="space-y-1">
        <label for="latitude" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
        <div class="relative">
          <FormInput v-model="data.latitude" type="text" name="latitude" placeholder="Enter Latitude"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
          <span class="text-sm text-red-500" v-if="errors.latitude && errors.latitude.length">{{ errors.latitude[0]
            }}</span>
        </div>
      </div>

      <!-- Submit Button -->
      <PrimaryButton name="Add Barangay" type="submit"
        class="w-full py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-all">
      </PrimaryButton>

    </form>

  </div>
</template>
