<script setup>
import FormInput from '../../components/FormInput.vue';
import axiosClient from '../../axios';
import { onMounted, ref, computed, watch, inject, defineEmits } from 'vue';
import PrimaryButton from '../../components/PrimaryButton.vue';
import { useRouter } from 'vue-router';

const addToast = inject('addToast'); // Inject global toast function

const router = useRouter();
const emit = defineEmits(['close']);
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


watch(() => props.barangay, (newBarangay) => {
  if (newBarangay) {
    barangayData.value = {
      id: newBarangay.id,
      name: newBarangay.name,
      longitude: newBarangay.longitude,
      latitude: newBarangay.latitude
    };
  }
}, { immediate: true, deep: true });

const submitLoading = ref(false);

const errors = ref({
    name: [],
    longitude: [],
    latitude: []
});

const formSubmit = () => {
    submitLoading.value = true;
    // Convert ref values to JSON (instead of using FormData)
    const payload = {
        name: barangayData.value.name,
        longitude: barangayData.value.longitude,
        latitude: barangayData.value.latitude
    };
    
    axiosClient.put(`/api/911/barangay-update/${barangayData.value.id}`, payload, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY,
            // 'Content-Type': 'application/json' // Ensure JSON format
        }
    })
    .then(response => {
        addToast(response.data.message, 'success', 'check_circle'); // Add success toast
        emit('close');
        // closeModal();
    })
    .catch(error => {
        errors.value = error.response.data.errors;
        addToast(error.response.data.message, 'error', 'error');
    })
    .finally(() => {
        submitLoading.value = false;
    });
}
</script>


<template>
    <!-- Form -->
    <div class="flex justify-center">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg w-96">
            <form @submit.prevent="formSubmit" class="space-y-4">
                <!-- Barangay Name -->
                <div class="space-y-1">
                    <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Barangay Name</label>
                    <input type="text" class="px-4 py-2 border rounded-md w-full dark:bg-gray-800 dark:text-white" v-model="barangayData.name" placeholder="Enter Barangay Name"/>
                    <span class="text-sm text-red-500" v-if="errors.name && errors.name.length">{{ errors.name[0] }}</span>
                </div>

                <!-- Longitude -->
                <div class="space-y-1">
                    <label for="longitude" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
                    <input type="text" class="px-4 py-2 border rounded-md w-full dark:bg-gray-800 dark:text-white" v-model="barangayData.longitude" placeholder="Enter longitude" />
                    <span class="text-sm text-red-500" v-if="errors.longitude && errors.longitude.length">{{ errors.longitude[0] }}</span>
                </div>

                <!-- Latitude -->
                <div class="space-y-1">
                    <label for="latitude" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
                    <input type="text" class="px-4 py-2 border rounded-md w-full dark:bg-gray-800 dark:text-white" v-model="barangayData.latitude" placeholder="Enter latitude" />
                    <span class="text-sm text-red-500" v-if="errors.latitude && errors.latitude.length">{{ errors.latitude[0] }}</span>
                </div> 
                
               <PrimaryButton
                :disabled="submitLoading"
                type="submit" 
                :name="!submitLoading ? 'Update Barangay' : 'Updating...'" 
                :class="[!submitLoading ? 'text-white bg-teal-600 hover:bg-teal-700 w-full py-2 rounded-lg font-semibold transition-all duration-200' : 'text-white bg-teal-800 w-full py-2 rounded-lg font-semibold transition-all duration-200']" />
            </form>
        </div>
    </div>
</template>
