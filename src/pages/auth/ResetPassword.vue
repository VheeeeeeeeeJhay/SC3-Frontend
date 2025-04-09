<script setup>
    import { ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import axiosClient from "../../axios.js";
    
    const route = useRoute();
const token = ref(route.params.token);
const email = ref(route.query.email);
    
    const dataNewPassword = ref({
        token: token.value,
        email: email.value,
        password: '',
        password_confirmation: ''
    });
    
    const errorsNewPassword = ref({
        password: [],
        password_confirmation: []
    });
    
    const submitNewPassword = () => {
        axiosClient.post("/reset-password", dataNewPassword.value, {
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY
            }
        })
        .then(response => {
            console.log('Password reset successful:', response.data);
            router.push({ name: 'Login' }); // Redirect to login after reset
        })
        .catch(error => {
            console.log('Error:', error.response?.data?.message || 'An error occurred');
            errorsNewPassword.value = error.response?.data?.errors || {};
        })
    }
    </script>
    
    <template>
        <div>
            <form @submit.prevent="submitNewPassword" class="flex flex-col gap-4">
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" id="password" v-model="dataNewPassword.password"
                        class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <p class="text-sm mt-1 text-red-600">
                        {{ errorsNewPassword.password ? errorsNewPassword.password[0] : '' }}
                    </p>
                </div>
                <div>
                    <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" id="password_confirmation" v-model="dataNewPassword.password_confirmation"
                        class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <p class="text-sm mt-1 text-red-600">
                        {{ errorsNewPassword.password_confirmation ? errorsNewPassword.password_confirmation[0] : '' }}
                    </p>
                </div>
                <button type="submit" class="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700">
                    Reset Password
                </button>
            </form>
        </div>
    </template>
    
    <style scoped></style>
    