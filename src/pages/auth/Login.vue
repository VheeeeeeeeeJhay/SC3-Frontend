<script setup>

import GuestLayout from "../../components/layout/GuestLayout.vue";
import axiosClient from "../../axios.js";
import { ref } from "vue";
import router from "../../router.js";
import logo from '../../assets/baguio-logo.png';
import Loader1 from "../../components/loading/loader1.vue";

const data = ref({
  email: '',
  password: '',
})

const submitLoading = ref(false)

const errors = ref({
  email: [],
  password: [],
})

const submit = () => {
  submitLoading.value = true
  axiosClient.get('/sanctum/csrf-cookie').then(response => {
    axiosClient.post("/login", data.value, {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY
      }
    })
      .then(response => {
        router.push({ name: 'Overview' })
      })
      .catch(error => {
        console.log(error.response.data.message)
        errors.value = error.response.data.errors;
      })
      .finally(() => {
        submitLoading.value = false
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
        <h2 class="text-gray-800 text-lg text-center font-semibold mb-4">Login to your account</h2>
        <Toast v-if="errors.length > 0" :message="errors" />
        <form @submit.prevent="submit" class="flex flex-col gap-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" v-model="data.email"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.email ? errors.email[0] : '' }}
            </p>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input type="password" id="password" v-model="data.password"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.password ? errors.password[0] : '' }}
            </p>
          </div>
          <button type="submit"
            :class="[!submitLoading ? 'w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700' : 'w-full bg-blue-900 text-white py-2 rounded-md']"
            :disabled="submitLoading">
            {{ submitLoading ? 'Logging in...' : 'Login In' }}
          </button>
        </form>
        <div class="text-sm text-center mt-4">
          <RouterLink :to="{ name: 'Signup' }" class="text-blue-600 hover:underline">
            Don't have an account? Sign up
          </RouterLink>
        </div>
        <div class="text-sm text-center mt-2">
          <button @click="handleForgotPassword" class="text-blue-600 hover:underline">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
