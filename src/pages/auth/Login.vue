<script setup>

import GuestLayout from "../../components/GuestLayout.vue";
import axiosClient from "../../axios.js";
import { ref } from "vue";
import router from "../../router.js";
import logo from '../../assets/baguio-logo.png';


const data = ref({
  email: '',
  password: '',
})
const errorMessage = ref('')

const submit = () => {
  axiosClient.get('/sanctum/csrf-cookie').then(response => {
    axiosClient.post("/login", data.value, {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY
      }
      })
      .then(response => {
        router.push({ name: 'Dashboard' })
      })
      .catch(error => {
        console.log(error.response)
        console.log('there was an error')
        errorMessage.value = error.response.data.message;
      })
  });
}

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-blue-900 relative">

    <!-- Main Container -->
    <div class="flex flex-col sm:flex-row items-center gap-8 z-10">
      <!-- City Logo and Title -->
      <div class="text-center">
        <img :src="logo" alt="City of Baguio Logo" class="w-70 mx-auto mb-4" />
        <h1 class="text-white text-2xl font-bold leading-tight">
          Smart City Command<br />
          and Control Center<br />
          <i>911 Dashboard</i>
        </h1>
      </div>

      <!-- Login Form -->
      <div class="bg-white p-6 rounded-xl shadow-lg w-80">
        <h2 class="text-gray-800 text-lg text-center font-semibold mb-4">Sign in to your account</h2>

        <form @submit.prevent="submit" class="flex flex-col gap-4">
          <div v-if="errorMessage" class="mt-4 py-2 px-3 rounded text-white bg-red-400">
            {{ errorMessage }}
          </div>
          <!-- <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" autocomplete="email" required="" v-model="data.email"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div> -->

          <!-- Replace IftaLabel and InputText -->
      <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" v-model="data.email" required
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      
      <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" v-model="data.password" required
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
          
          <!-- <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" id="password" autocomplete="current-password" required="" v-model="data.password" class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div> -->

          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Sign In</button>
        </form>

        <div class="text-sm text-center mt-4">
          <RouterLink :to="{ name: 'Signup' }" class="text-blue-600 hover:underline">Don't have an account? Sign up</RouterLink>
        </div>

        <div class="text-sm text-center mt-2">
          <button @click="handleForgotPassword" class="text-blue-600 hover:underline">Forgot Password?</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>