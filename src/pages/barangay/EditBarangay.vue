<script setup>
import FormInput from '../../components/FormInput.vue';
import axiosClient from '../../axios';
import { onMounted, ref, computed, watch } from 'vue';
import PrimaryButton from '../../components/PrimaryButton.vue';
import { useRouter } from 'vue-router';


const router = useRouter();


// Props
const props = defineProps({
  barangay: Object
});

// const barangay_Id = ref(props.barangay); // Make it reactive

// console.log("Barangay ID from Props:", barangay_Id.value);

const barangayData = ref({
    id: '',
    name: '',
    longitude: '',
    latitude: ''
});


// watch(() => props.barangay, () => {
//     barangayData.name = props.barangay.name;
//     barangayData.longitude = props.barangay.longitude;
//     barangayData.latitude = props.barangay.latitude;
// }, { immediate: true, deep: true });
watch(() => props.barangay, (newBarangay) => {
  if (newBarangay) {
    barangayData.value = {
      id: newBarangay.id || '',
      name: newBarangay.name || '',
      longitude: newBarangay.longitude || '',
      latitude: newBarangay.latitude || ''
    };
  }
}, { immediate: true, deep: true });


const submitLoading = ref(false);

// const isLoading = ref(false);
const errors = ref('');
const success = ref('');

// const fetchData = () => {
//     axiosClient.get(`/api/911/barangay-edit/${barangay_Id.value}`, {
//         headers: {
//             'x-api-key': import.meta.env.VITE_API_KEY
//         }
//     })
//     .then((res) => {
//         console.log("Fetched Data:", res.data);
//         data.value = { ...res.data }; // Ensuring we copy raw values
//         isLoading.value = false;
//     })
//     .catch((error) => {
//         console.error('Error fetching data:', error);
//         isLoading.value = false;
//     });
// }

onMounted(() => {
    // isLoading.value = true;
    // fetchData();
});

const formSubmit = () => {
    submitLoading.value = true;
    // Convert ref values to JSON (instead of using FormData)
    const payload = {
        name: barangayData.value.name ?? '',
        longitude: barangayData.value.longitude ?? '',
        latitude: barangayData.value.latitude ?? ''
    };
    
    axiosClient.put(`/api/911/barangay-update/${barangayData.value.id}`, payload, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY,
            // 'Content-Type': 'application/json' // Ensure JSON format
        }
    })
    .then(response => {
        console.log(response.data.message);
        success.value = response.data.message;
    })
    .catch(error => {
        if (error.response) {
            console.error('Error updating barangay:', error.response.data);
            errors.value = error.response.data.errors || { message: 'Something went wrong' };
        } else {
            console.error('Unexpected error:', error);
        }
    })
}
</script>


<template>

    <!-- Form -->
    <div class="flex justify-center">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg w-96">
            <!-- <h2 class="text-xl font-semibold text-gray-900 dark:text-white text-center mb-4">Update Barangay</h2> -->

            <form @submit.prevent="formSubmit" class="space-y-4"><div class="dark:text-white">{{ barangay }}</div><div class="dark:text-white">{{ barangayData }}</div>
                <!-- Barangay Name -->
                <div class="space-y-1">
                    <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Barangay Name</label>
                    <!-- <FormInput 
                        name="name" 
                        class="px-4 py-2 border rounded-md w-full dark:bg-gray-800 dark:text-white" 
                        v-model="barangayData.name" 
                        placeholder="Enter Barangay Name" :value="barangay.name"/> -->
                    <input type="text" class="px-4 py-2 border rounded-md w-full dark:bg-gray-800 dark:text-white" v-model="barangay.name" placeholder="Enter Barangay Name"/>
                </div>

                <!-- Longitude -->
                <div class="space-y-1">
                    <label for="longitude" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
                    <!-- <FormInput 
                        name="longitude" 
                        class="px-4 py-2 border rounded-md w-full dark:bg-gray-800 dark:text-white" 
                        v-model="barangayData.longitude" 
                        type="number" 
                        placeholder="Enter longitude" :value="barangay.longitude"/> -->
                    <input type="number" class="px-4 py-2 border rounded-md w-full dark:bg-gray-800 dark:text-white" v-model="barangay.longitude" placeholder="Enter longitude" />
                </div>

                <!-- Latitude -->
                <div class="space-y-1">
                    <label for="latitude" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
                    <!-- <FormInput 
                        name="latitude" 
                        class="px-4 py-2 border rounded-md w-full dark:bg-gray-800 dark:text-white" 
                        v-model="barangayData.latitude" 
                        type="number" 
                        placeholder="Enter latitude" :value="barangay.latitude"/> -->
                    <input type="number" class="px-4 py-2 border rounded-md w-full dark:bg-gray-800 dark:text-white" v-model="barangay.latitude" placeholder="Enter latitude" />
                </div> 

               <!-- Submit Button -->
               <PrimaryButton v-if="!submitLoading"
                    type="submit" 
                    name="Update Barangay" 
                    class="text-white bg-green-600 hover:bg-green-700 w-full py-2 rounded-lg font-semibold transition-all duration-200" />
                    <PrimaryButton v-else type="button" disabled name="Updating..." class="text-white bg-green-900 w-full" />
            </form>

            <!-- Error Messages -->
            <div v-if="errors" class="text-red-500 mt-4 text-sm text-center">
                <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
            </div>
        </div>
    </div>
    <Toast v-if="success" :message="success" />
    <Toast v-if="errors" :message="errors" />
</template>
