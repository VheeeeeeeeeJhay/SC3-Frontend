<script setup>
import FormInput from '../../components/FormInput.vue';
import axiosClient from '../../axios';
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRouter
import PrimaryButton from '../../components/PrimaryButton.vue';
import { useThemeStore } from '../../stores/themeStore';
// For dark mode
const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "bg-slate-800 border border-black text-white hover:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:outline-none"
    : "bg-sky-50 border border-gray-200 text-sky-900 hover:border-gray-300 focus:ring-2 focus:ring-sky-400 focus:outline-none";
});

const route = useRoute();
const router = useRouter(); // Initialize router
const barangay_Id = route.params.id; // Get the barangay ID from route params

// ✅ Define props correctly
const props = defineProps({
  barangay: Object
});
const data = ref({
    name: '',
    longitude: '',
    latitude: ''
});

const isLoading = ref(false);

onMounted(() => {
    isLoading.value = true;
    axiosClient.get(`/api/911/barangay-edit/${barangay_Id}`, {
        headers: {
            'x-api-key': '$m@rtC!ty'
        }
    })
    .then((res) => {
        setTimeout(() => {
            console.log(res);
            data.value = res.data; // Assuming the response contains the barangay data
            isLoading.value = false;
        }, 1500);
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        isLoading.value = false;
    });
});

const errors = ref('');

console.log(data.value);

watch(
  () => props.barangay,
  (newBarangay) => {
    if (newBarangay) {
      data.value = { ...newBarangay }; // ✅ Copy data correctly
    }
  },
  { immediate: true } // ✅ Run immediately when component is mounted
);

function formSubmit() {
    console.log(data.value);
    // const formData = new FormData();
    // formData.append('name', data.value.name);
    // formData.append('longitude', data.value.longitude);
    // formData.append('latitude', data.value.latitude);
    // errors.value = '';
    axiosClient.put(`/api/911/barangay-update/${data.value.id}`, data.value, {
        headers: {
            'x-api-key': '$m@rtC!ty'
        }
    })
    .then(response => {
        router.push({ name: 'Barangay' });
        console.log('Barangay updated ba');
    })
    .catch(error => {
        console.log(error.response.data.data);
        errors.value = error.response.data.errors;
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
            <form @submit.prevent="formSubmit" class="space-y-4" :themeClasses>
                <div class="space-y-1">
                    <label for="name" class="block text-sm font-medium">Barangay Name</label>
                    <FormInput name="name" class="px-4 py-2 border rounded-md w-full" v-model="data.name"/>
                </div>

                <div class="space-y-1">
                    <label for="longitude" class="block text-sm font-medium">Longitude</label>
                    <FormInput name="longitude" class="px-4 py-2 border rounded-md w-full" v-model="data.longitude" type="number"/>
                </div>

                <div class="space-y-1">
                    <label for="latitude" class="block text-sm font-medium">Latitude</label>
                    <FormInput name="latitude" class="px-4 py-2 border rounded-md w-full" v-model="data.latitude" type="number"/>         
                </div> 

               <PrimaryButton type="submit" name="Update Barangay" class="text-white bg-green-600 hover:bg-green-700 w-full" />
            </form>

            <div v-if="errors" class="text-red-500 mt-2">
                <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
            </div>
        </div>
    </div>
</template>