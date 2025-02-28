<script setup>
import FormInput from '../../components/FormInput.vue';
import axiosClient from '../../axios';
import { onMounted, ref, computed, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRouter
import PrimaryButton from '../../components/PrimaryButton.vue';
import { useThemeStore } from '../../stores/themeStore';
import router from '../../router';

//Import API key
const API_KEY = import.meta.env.VITE_API_KEY;

// For dark mode
const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "bg-slate-800 border border-black text-white hover:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:outline-none"
    : "bg-sky-50 border border-gray-200 text-sky-900 hover:border-gray-300 focus:ring-2 focus:ring-sky-400 focus:outline-none";
});


// // ✅ Define props correctly
// const props = defineProps({
//   barangay_data: Object
// });
const props = defineProps({
    barangay_data: Object
});
const emit = defineEmits(['updateValue']);

const updateValue = (event) => {
  emit('updateValue', event.target.value);
};

// const barangay = reactive({ ...props.barangay_data }); // Creates a reactive copy
// console.log(barangay.id); // You can access barangay.id



// const barangay_Id = ref(props.barangay_data.id);
// const names = ref(props.barangay_data?.name);
// const longitudes = ref(props.barangay_data?.longitude);
// const latitudes = ref(props.barangay_data?.latitude);

// const names = ref(props.barangay_data?.name);
// const longitudes = ref(props.barangay_data?.longitude);
// const latitudes = ref(props.barangay_data?.latitude);

// const names = ref(props.barangay_data.name);
// const longitudes = ref(props.barangay_data.longitude);
// const latitudes = ref(props.barangay_data.latitude);

// watch(() => props.barangay_data.name, (newName) => {
//     names.value = newName;
// });

// watch(() => props.barangay_data.longitude, (newLongitude) => {
//     longitudes.value = newLongitude;
// });

// watch(() => props.barangay_data.latitude, (newLatitude) => {
//     latitudes.value = newLatitude;
// });
// watch(() => names.value, (newName) => {
//     names.value = newName;
// });

// watch(() => longitudes.value, (newLongitude) => {
//     longitudes.value = newLongitude;
// });

// watch(() => latitudes.value, (newLatitude) => {
//     latitudes.value = newLatitude;
// });


const errors = ref('');


function formSubmit(ID) {
    const formData = new FormData();
    formData.append('name', names.value);
    formData.append('longitude', longitudes.value);
    formData.append('latitude', latitudes.value);
    errors.value = '';
    
    axiosClient.put(`/api/911/barangay/${ID}`, formData, {
        headers: {
            'x-api-key': API_KEY
        }
    })
    .then(response => {
        router.push({ name: 'Barangay' });
        console.log('Barangay updated successfully');
    })
    .catch(error => {
        // console.error('Update error:', error);
        errors.value = error.response?.data?.errors || {'error': ['An error occurred during update']};
    });
}
</script>

<template>
    <!-- <div v-if="isLoading" class="flex justify-center"> -->
        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span class="sr-only">Loading...</span>
        </div>
    <!-- </div>
    <div v-else> -->
        <div>
            <div>{{ names }}</div><div>{{ longitudes }}</div><div>{{ latitudes }}</div>
            <form @submit.prevent="formSubmit(barangay_Id)" class="space-y-4" :themeClasses>
                <div>{{ props.barangay_data }}</div>

                <div class="space-y-1">
                    <label for="name" class="block text-sm font-medium">Barangay Name</label>
                    <FormInput name="name" class="px-4 py-2 border rounded-md w-full" :value="props.barangay_data.name" v-model="names"/>
                </div>

                <div class="space-y-1">
                    <label for="longitude" class="block text-sm font-medium">Longitude</label>
                    <FormInput name="longitude" class="px-4 py-2 border rounded-md w-full" :value="props.barangay_data.longitude" v-model="longitudes" type="number"/>
                </div>

                <div class="space-y-1">
                    <label for="latitude" class="block text-sm font-medium">Latitude</label>
                    <FormInput name="latitude" class="px-4 py-2 border rounded-md w-full" :value="props.barangay_data.latitude" v-model="latitudes" type="number"/>         
                </div> 

                <PrimaryButton type="submit" name="Update Barangay" class="text-white bg-green-600 hover:bg-green-700 w-full" />
            </form>

            <div v-if="errors" class="text-red-500 mt-2">
                <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
            </div>
        </div>
    <!-- </div> -->
</template>