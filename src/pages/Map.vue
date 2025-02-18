<script setup>
import { ref, computed } from 'vue';
import { useThemeStore } from '../stores/themeStore';
import axios from 'axios';
import axiosClient from '../axios';
import router from '../router.js';
import PrimaryButton from '../components/PrimaryButton.vue';

const themeStore = useThemeStore();

const bgClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-slate-900' : 'bg-gray-900';
})
const textClass = computed(() => {
  return themeStore.isDarkMode ? 'text-gray-100' : 'text-gray-900';
})
const boxClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-800' : 'bg-white';
})
const chartClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-700 border-gray-500' : 'bg-gray-200 border-gray-900';
})

const data = ref({
  name: ''
})

const errors = ref({
  name: []
});

function formSubmit() {
  const formData = new FormData()
  formData.append('name', data.value.name)
  axiosClient.post("/api/911/barangay", formData, {
    headers: {
      'x-api-key':'$m@rtC!ty'
    }
    })
    .then(response => {
      formData.value.name = '';
      router.push({ name: 'Map' })
    })
    // .catch(error => {
    //   console.log(error.response.data)
    //   errors.value = error.response.data.errors;
    // })
}

// function formSubmit() {
//   axiosClient.get('/sanctum/csrf-cookie').then(response => {
//     axiosClient.post("/api/911/barangay", formData.value)
//       .then(response => {
//         console.log('successfully added!' + response) 
//         formData.value.name = '';
//         router.push({ name: 'Map' })
//       })
//       .catch(error => {
//         console.log(error.response.data)
//         errors.value = error.response.data.errors;
//       })
//   });
// }
</script>

<template>
    <div :class="bgClass" style="min-height: 100vh;">
        <div class="mx-4" :class="boxClass">
          {{ data.name }}
        <!-- <h1 class="text-2xl font-bold mb-6 text-gray-100" :class="textClass">Heat Map here</h1>
        
        <img src="https://th.bing.com/th/id/R.450d7cb80e9013f6d80ad1547a3414c5?rik=f20epSYlcY25AQ&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2ff%2f9%2ff%2f327112.jpg&ehk=iBETV2e95IbNX0zVk%2bZgxp%2bIG0HrkXfGDa7ycjRQ%2bIA%3d&risl=&pid=ImgRaw&r=0" class="w-full h-[700px]" alt="Mapa to"/> -->
        <form @submit.prevent="formSubmit" class="mt-4">
            <input 
                type="text" 
                v-model="data.name" 
                placeholder="Enter value" 
                class="px-4 py-2 border rounded-md mr-2"
                :class="themeStore.isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'"
            />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.name ? errors.name[0] : '' }}
            </p>
            <!-- <button 
                type="submit" 
                class="px-4 py-2 rounded-md"
                :class="themeStore.isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'"
            >
                Submit
            </button> -->
            <!-- <button type="submit" class=" col-span-3 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Sign Up</button> -->
            <PrimaryButton name="Submit" type="submit" class="bg-green-500 hover:bg-green-600 hover:shadow-md"/>
        </form>
        
    </div>
    </div>
</template>


<style scoped>
.form-group :deep(.p-dropdown),
.form-group :deep(.p-inputtext) {
    width: 100%;
}
</style>
