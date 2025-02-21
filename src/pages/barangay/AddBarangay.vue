<script setup>
import { ref } from 'vue';
import PrimaryButton from '../../components/PrimaryButton.vue';
import router from '../../router.js';
import axiosClient from '../../axios.js';
import FormInput from '../../components/FormInput.vue';

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
        <form @submit.prevent="formSubmit">
            <!-- <p class="text-sm mt-1 text-red-600">
              {{ errors.name ? errors.name[0] : '' }}
            </p> -->

            <FormInput v-model="data.name" type="text" name="name" placeholder="Enter Barangay Name" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" />
            <p class="text-sm mt-1 text-red-600">{{ errors.name ? errors.name[0] : '' }}</p>

            <FormInput v-model="data.longitude" type="text" name="longitude" placeholder="Enter longitude" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" />
            <p class="text-sm mt-1 text-red-600">{{ errors.longitude ? errors.longitude[0] : '' }}</p>

            <FormInput v-model="data.latitude" type="text" name="latitude" placeholder="Enter latitude" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" />
            <p class="text-sm mt-1 text-red-600">{{ errors.latitude ? errors.latitude[0] : '' }}</p>

            <PrimaryButton name="Add Barangay" type="submit" class="bg-green-500 hover:bg-green-600 hover:shadow-md" />
        </form>
    </div>
</template>