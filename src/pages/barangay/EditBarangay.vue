<script setup>
import FormInput from '../../components/FormInput.vue';
import axiosClient from '../../axios';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRouter
import PrimaryButton from '../../components/PrimaryButton.vue';


const route = useRoute();
const router = useRouter(); // Initialize router
const barangay_Id = route.params.id; // Get the barangay ID from route params
const data = ref({
    name: '',
    longitude: '',
    latitude: ''
});

onMounted(() => {
    axiosClient.get(`/api/911/barangay/${barangay_Id}/edit`, {
        headers: {
            'x-api-key': '$m@rtC!ty'
        }
    })
    .then((res) => {
        console.log(res);
        data.value = res.data; // Assuming the response contains the barangay data
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });
});

const errors = ref('');

function formSubmit() {
    console.log(data.value);
    const formData = new FormData();
    formData.append('name', data.value.name);
    formData.append('longitude', data.value.longitude);
    formData.append('latitude', data.value.latitude);
    errors.value = ''; // Clear previous errors

    axiosClient.put(`/api/911/barangay/${barangay_Id}/update`, formData, {
        headers: {
            'x-api-key': '$m@rtC!ty'
        }
    })
    .then(response => {
        router.push({ name: 'Barangay' });
    })
    .catch(error => {
        console.log(error.response.data.data);
        errors.value = error.response.data.errors; // Store the errors
    });
}
</script>

<template>
  <div class="mt-10 bg-white">
    <div>{{ data }}</div>
    <form @submit.prevent="formSubmit">
        <FormInput 
                name="name" 
                class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" 
                v-model="data.name"
            />
            <FormInput 
                name="longitude" 
                class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" 
                v-model="data.longitude"
            />
            <FormInput 
                name="latitude" 
                class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" 
                v-model="data.latitude"
            />
            <PrimaryButton type="submit" name="Update Barangay" class="text-white bg-green-500 hover:bg-green-600 hover:shadow-md" />
    </form>
    <div v-if="errors" class="text-red-500 mt-2">
        <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
    </div>
  </div>
</template>