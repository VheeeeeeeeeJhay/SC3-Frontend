<script setup>
import axiosClient from "../../axios.js";
import { ref, inject } from "vue";
import router from "../../router.js";
import logo from '../../assets/baguio-logo.png';
import smart from '../../assets/smart-city1.jpg';
import { useAuthValidation } from "../../composables/useAuthValidation.js";


const data = ref({
  email: '',
  password: '',
})

const { emailError, passwordError } = useAuthValidation(data);

const submitLoading = ref(false)

const errors = ref({
  email: [],
  password: [],
})

const addToast = inject('addToast'); 

const submit = () => {
  
  submitLoading.value = true
  if(emailError.value || passwordError.value) {
    addToast('Please correct the errors in the form', 'error', 'error');
    submitLoading.value = false
    return;
  }
  axiosClient.get('/sanctum/csrf-cookie').then(response => {
    axiosClient.post("/login", data.value, {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY
      }
    })
      .then(response => {
        addToast('Login successful!', 'success', 'check_circle');
        router.push({ name: 'Overview' })
      })
      .catch(error => {
        // console.log(error.response.data.message)
        errors.value = error.response.data.errors;
        for (const key in errors.value) {
          addToast(errors.value[key][0], 'error', 'error');
        }
        // addToast(error.response.data.message, 'error', 'error');
      })
      .finally(() => {
        submitLoading.value = false
      })
  });
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-blue-900 relative"
    :style="{
      backgroundImage: `url(${smart})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }"
  >
    <!-- Full-Width Transparent Wrapper Card -->
    <div class="w-full px-4 sm:px-8 py-8 bg-black/50 backdrop-blur-md  shadow-inner">
      <!-- Centered Inner Content -->
      <div class="flex flex-col sm:flex-row justify-center items-center gap-8 max-w-6xl mx-auto">
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
          <form @submit.prevent="submit" class="flex flex-col gap-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                v-model="data.email"
                class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-sm mt-1 text-red-600">
                {{ errors.email ? errors.email[0] : '' }}
                {{ emailError }}
              </p>
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                v-model="data.password"
                class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-sm mt-1 text-red-600">
                {{ errors.password ? errors.password[0] : '' }}
                {{ passwordError }}
              </p>
            </div>
            <button
              type="submit"
              :class="[!submitLoading ? 'w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700' : 'w-full bg-teal-900 text-white py-2 rounded-md']"
              :disabled="submitLoading"
            >
              {{ submitLoading ? 'Logging in...' : 'Login In' }}
            </button>
          </form>
          <div class="text-sm text-center mt-4">
            <RouterLink :to="{ name: 'Signup' }" class="text-teal-600 hover:underline">
              Don't have an account? Sign up
            </RouterLink>
          </div>
          <div class="text-sm text-center mt-2">
            <RouterLink :to="{ name: 'ForgotPassword' }" class="text-teal-600 hover:underline">
              Forgot Password?
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
