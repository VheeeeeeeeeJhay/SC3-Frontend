<script setup>
    import { ref } from 'vue';
    import axiosClient from "../../axios.js";
    import { useRouter } from 'vue-router';
    import logo from '../../assets/baguio-logo.png';
    import smart from '../../assets/smart-city1.jpg';
    
    const router = useRouter();
    const data = ref({
        email: ''
    });
    
    const errors = ref({
        email: [],
    });
    
    const submit = () => {
        axiosClient.post("/forgot-password", data.value, {
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY
            }
        })
        .then(response => {
            console.log('Password reset link sent');
            router.push({ name: 'ForgotPasswordSuccess' }); // Redirect to success page or message
        })
        .catch(error => {
            console.log(error.response.data.message);
            errors.value = error.response.data.errors;
        })
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
      
            <!-- Reset Password Email Form -->
            <div class="bg-white p-6 rounded-xl shadow-lg w-80">
              <h2 class="text-gray-800 text-lg text-center font-semibold mb-4">
                Forgot Your Password?
              </h2>
              <p class="text-sm text-gray-600 mb-4 text-center">
                Enter your email address to receive a password reset link.
              </p>
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
                  </p>
                </div>
                <button
                  type="submit"
                  class="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700"
                >
                  Reset Password
                </button>
              </form>
              <div class="text-sm text-center mt-4">
                <RouterLink :to="{ name: 'Login' }" class="text-blue-600 hover:underline">
                  Return to login
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </template>
      
    
    <style scoped></style>
    