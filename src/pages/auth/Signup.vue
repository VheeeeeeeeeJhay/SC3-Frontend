<script setup>
import { ref, inject } from "vue";
import axiosClient from "../../axios.js";
import router from "../../router.js";
import logo from "../../assets/baguio-logo.png";
import smart from "../../assets/smart-city1.jpg";
import { useAuthValidation } from "../../composables/useAuthValidation.js";

const data = ref({
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  password: '',
  password_confirmation: '',
  for_911: true,
  for_inventory: true,
})

const { firstNameError, lastNameError, emailError, passwordError, confirmPasswordError } = useAuthValidation(data);

const success = ref({
  message: [],
})

const errors = ref({
  firstName: [],
  middleName: [],
  lastName: [],
  email: [],
  password: [],
  password_confirmation: [],
})

const addToast = inject('addToast'); 
const submitLoading = ref(false)

const submit = () => {
  submitLoading.value = true
  console.log(data.value);
  axiosClient.get('/sanctum/csrf-cookie').then(response => {
    axiosClient.post("/register", data.value, {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY
      }
    })
      .then(response => {
        success.value.message = response.data.message;
        console.log(response.data)
        addToast(response.data.message, 'success', 'check_circle');
        // if (!data.value.password_confirmation) {
        //   errors.value.password_confirmation = [];
        // } else if (data.value.password_confirmation == data.value.password) {
        //   errors.value.password_confirmation = [];
        // }
        router.push({ name: 'Login' })
      })
      .catch(error => {
        console.log(error.response.data)
        errors.value = error.response.data.errors;
        for (const key in errors.value) {
          addToast(errors.value[key][0], 'error', 'error');
        }
        // if (data.value.password_confirmation == '') {
        //   addToast('The confirm password field in required', 'error', 'error');
        //   errors.value.password_confirmation = ['The confirm password field in required'];
        // } else if (data.value.password_confirmation != data.value.password) {
        //   addToast('The confirm password field does not match', 'error', 'error');
        //   errors.value.password_confirmation = ['The confirm password field does not match'];
        // }
      })
      .finally(() => {
        submitLoading.value = false
      })
  });
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-blue-900 relative"
  :style="{
      backgroundImage: `url(${smart})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }"
  >
    <!-- Main Container -->
    <div class="w-full px-4 sm:px-8 py-8 bg-black/50 backdrop-blur-md  shadow-inner">
      <div class="flex flex-col sm:flex-row justify-center items-center gap-8 max-w-6xl mx-auto">
      <!-- City Logo and Title -->
      <div class="text-center">
        <img :src="logo" alt="City of Baguio Logo" class="w-70 mx-auto mb-4" />
        <h1 class="text-white text-2xl font-bold leading-tight">
          Smart City Command<br />
          and Control Center<br />
          911 Dashboard
        </h1>
      </div>

      <!-- Registration Form -->
      <div class="bg-white p-6 rounded-xl shadow-lg max-w-lg">
        <h2 class="text-gray-800 text-lg font-semibold mb-4">Account Registration</h2>
        <form @submit.prevent="submit" class="grid grid-cols-3 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
            <input type="text" name="firstName" id="firstName" v-model="data.firstName"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.firstName ? errors.firstName[0] : '' }}
              {{ firstNameError }}
            </p>
          </div>
          <div>
            <label for="middleName" class="block text-sm font-medium text-gray-700">Middle Name</label>
            <input type="text" v-model="data.middleName" id="middleName"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.middleName ? errors.middleName[0] : '' }}
            </p>
          </div>
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
            <input type="text" v-model="data.lastName" id="lastName"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.lastName ? errors.lastName[0] : '' }}
              {{ lastNameError }}
            </p>
          </div>
          <div class="col-span-3">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" autocomplete="email" v-model="data.email"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.email ? errors.email[0] : '' }}
              {{ emailError }}
            </p>
          </div>

          <div class="col-span-3">
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" id="password" v-model="data.password"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.password ? errors.password[0] : '' }}
              {{ passwordError }}
            </p>
          </div>

          <div class="col-span-3">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" name="password" id="passwordConfirmation" v-model="data.password_confirmation"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.password_confirmation ? errors.password_confirmation[0] : '' }}
              {{ confirmPasswordError }}
            </p>
          </div>

          <button :disabled="submitLoading" type="submit" :class="[!submitLoading ? 'col-span-3 bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700' : 'col-span-3 bg-teal-900 text-white py-2 rounded-md']">
          {{ submitLoading ? 'Signing Up...' : 'Sign Up' }}
          </button>
        </form>

        <div class="text-sm text-center mt-4">
          <router-link :to="{ name: 'Login' }" class="text-teal-600 hover:underline">
            Already have an account? Sign in
          </router-link>
        </div>
      </div>
    </div>
    </div>
    
  </div>
</template>

<style scoped></style>