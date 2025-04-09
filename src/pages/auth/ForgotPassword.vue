<script setup>
    import { ref } from 'vue';
    import axiosClient from "../../axios.js";
    import { useRouter } from 'vue-router';
    
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
        <div>
            <form @submit.prevent="submit" class="flex flex-col gap-4">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" v-model="data.email"
                        class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <p class="text-sm mt-1 text-red-600">
                        {{ errors.email ? errors.email[0] : '' }}
                    </p>
                </div>
                <button type="submit" class="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700">
                    Reset Password
                </button>
            </form>
        </div>
    </template>
    
    <style scoped></style>
    