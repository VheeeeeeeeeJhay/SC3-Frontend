<script setup>
import FormInput from '../../components/FormInput.vue';
import axiosClient from '../../axios';
import { onMounted, ref, computed, watch } from 'vue';
import PrimaryButton from '../../components/PrimaryButton.vue';
import { useThemeStore } from '../../stores/themeStore';
import { useRouter } from 'vue-router';
const router = useRouter();

// Dark mode
const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "bg-slate-800 border border-black text-white hover:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:outline-none"
    : "bg-sky-50 border border-gray-200 text-gray-800 hover:border-gray-300 focus:ring-2 focus:ring-sky-400 focus:outline-none";
});

// Props
const props = defineProps({
  barangay: Number
});
const barangay_Id = ref(props.barangay); // Make it reactive

console.log("Barangay ID from Props:", barangay_Id.value);

const data = ref({
    name: '',
    longitude: '',
    latitude: ''
});

const isLoading = ref(false);
const errors = ref(null);

onMounted(() => {
    isLoading.value = true;
    axiosClient.get(`/api/911/barangay-edit/${barangay_Id.value}`, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
    .then((res) => {
        console.log("Fetched Data:", res.data);
        data.value = { ...res.data }; // Ensuring we copy raw values
        isLoading.value = false;
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        isLoading.value = false;
    });
});

function formSubmit() {
    console.log("Submitting data:", data.value);

    // Convert ref values to JSON (instead of using FormData)
    const payload = {
        name: data.value.name ?? '',
        longitude: data.value.longitude ?? '',
        latitude: data.value.latitude ?? ''
    };

    console.log("Payload being sent:", payload);

    axiosClient.put(`/api/911/barangay-update/${barangay_Id.value}`, payload, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY,
            // 'Content-Type': 'application/json' // Ensure JSON format
        }
    })
    .then(response => {
        console.log('Barangay updated successfully!', response.data);
        router.push({ name: 'Barangay' });
    })
    .catch(error => {
        if (error.response) {
            console.error('Error updating barangay:', error.response.data);
            errors.value = error.response.data.errors || { message: 'Something went wrong' };
        } else {
            console.error('Unexpected error:', error);
        }
    });
}
</script>


<template>
    <div v-if="isLoading" class="flex justify-center">
        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span class="sr-only">Loading...</span>
        </div>
    </div>
    <div v-else>
        <div>
            <form @submit.prevent="formSubmit" class="space-y-4  p-6 rounded-lg  w-96">
                <div class="space-y-1">
                    <label for="name" class="block text-sm font-medium text-gray-700">Barangay Name</label>
                    <FormInput name="name" class="px-4 py-2 border rounded-md w-full" v-model="data.name" placeholder="Enter Barangay Name"/>
                </div>

                <div class="space-y-1">
                    <label for="longitude" class="block text-sm font-medium text-gray-700">Longitude</label>
                    <FormInput name="longitude" class="px-4 py-2 border rounded-md w-full" v-model="data.longitude" type="number" placeholder="Enter longitude"/>
                </div>

                <div class="space-y-1">
                    <label for="latitude" class="block text-sm font-medium text-gray-700">Latitude</label>
                    <FormInput name="latitude" class="px-4 py-2 border rounded-md w-full" v-model="data.latitude" type="number" placeholder="Enter latitude"/>         
                </div> 

               <PrimaryButton type="submit" name="Update Barangay" class="text-white bg-green-600 hover:bg-green-700 w-full" />
            </form>

            <div v-if="errors" class="text-red-500 mt-2">
                <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
            </div>
        </div>
    </div>
</template>