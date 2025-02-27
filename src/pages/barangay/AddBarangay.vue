<script setup>
import { ref, computed } from 'vue';
import PrimaryButton from '../../components/PrimaryButton.vue';
import router from '../../router.js';
import axiosClient from '../../axios.js';
import FormInput from '../../components/FormInput.vue';
import { useThemeStore } from '../../stores/themeStore';
// For dark mode
const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "bg-slate-800 border border-black text-white hover:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:outline-none"
    : "bg-sky-50 border border-gray-200 text-gray-800 hover:border-gray-300 focus:ring-2 focus:ring-sky-400 focus:outline-none";
});


const data = ref({
  name: '',
  longitude: '',
  latitude: '',
})

const errors = ref({
  name: [],
  longitude: [],
  latitude: [],
});

function formSubmit() {
  console.log(data.value)
  const formData = new FormData()
  formData.append('name', data.value.name)
  formData.append('longitude', data.value.longitude)
  formData.append('latitude', data.value.latitude)
  errors.value = '';
  axiosClient.post("/api/911/barangay", formData, {
    headers: {
      'x-api-key':'$m@rtC!ty'
    }
    })
    .then(response => {
      data.value.name = '';
      data.value.longitude = '';
      data.value.latitude = '';
      router.push({ name: 'Barangay' })
    })
    .catch(error => {
      console.log(error.response.data)
      errors.value = error.response.data.errors;
    })
}
</script>

<template>
    <div>
        <form @submit.prevent="formSubmit" class="space-y-4" :themeClasses>
          <div class="space-y-1">
            <label for="name" class="block text-sm font-medium">Barangay Name</label>
            <FormInput v-model="data.name" type="text" name="name" placeholder="Enter Barangay Name" class="px-4 py-2 border rounded-md w-full" />
            <p class="text-sm mt-1 text-red-600">{{ errors.name ? errors.name[0] : '' }}</p>
          </div>

          <div class="space-y-1">
            <label for="longitude" class="block text-sm font-medium">Longitude</label>
            <FormInput v-model="data.longitude" type="text" name="longitude" placeholder="Enter longitude" class="px-4 py-2 border rounded-md w-full" />
            <p class="text-sm mt-1 text-red-600">{{ errors.longitude ? errors.longitude[0] : '' }}</p>
          </div>

          <div class="space-y-1">
            <label for="latitude" class="block text-sm font-medium">Latitude</label>
            <FormInput v-model="data.latitude" type="text" name="latitude" placeholder="Enter latitude" class="px-4 py-2 border rounded-md w-full" />
            <p class="text-sm mt-1 text-red-600">{{ errors.latitude ? errors.latitude[0] : '' }}</p>
          </div>

          <PrimaryButton name="Add Barangay" type="submit" class="text-white bg-green-600 hover:bg-green-700 w-full" />
        </form>
    </div>
</template>