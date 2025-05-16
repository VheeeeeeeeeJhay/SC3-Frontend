<script setup>
import { ref } from 'vue';
import { useAuthValidation } from '../../composables/useAuthValidation.js';
import { inject } from 'vue';
import axiosClient from '../../axios.js';

const addToast = inject('addToast');

const data = ref({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    password_confirmation: '',
    for_911: true,
    for_inventory: false,
    for_traffic: false,
})

const errors = ref({
  firstName: [],
  middleName: [],
  lastName: [],
  email: [],
  password: [],
  password_confirmation: [],
})

const { firstNameError, lastNameError, emailError, passwordError, confirmPasswordError } = useAuthValidation(data);

const isModalOpen = ref(false);

const isLoading = ref(false);

const submit = async () => {
    const formData = new FormData();
    formData.append('firstName', data.value.firstName)
    formData.append('middleName', data.value.middleName)
    formData.append('lastName', data.value.lastName)
    formData.append('email', data.value.email)
    formData.append('password', data.value.password)
    formData.append('password_confirmation', data.value.password_confirmation)
    formData.append('for_911', data.value.for_911)
    formData.append('for_inventory', data.value.for_inventory)
    formData.append('for_traffic', data.value.for_traffic)
    await axiosClient.post('/api/911/users', formData, {
        headers: {
        'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
    .then(response => {
        console.log('sana gumana');
    // message.value = response.data.message;
    addToast(response.data.message, 'success', 'check_circle');
    // clearForm();
    databaseStore.fetchData();
    refreshInterval = setInterval(() => {
            databaseStore.fetchData(); // runs again every 50s
        }, 50000);
    })
    .catch(error => {
    errors.value = error.response.data.errors;
    if (errors.value) {
        for (const key in errors.value) {
        const messages = errors.value[key]; // This is an array of messages
        messages.forEach(message => {
            addToast(message, 'error', 'error');
        });
        }
    } else if (error.response.data.error) {
        addToast(error.response.data.error, 'error', 'error');
    }
    })
}

</script>

<template>
  <div class="max-w-lg mx-auto p-2">
    <form @submit="submit" class="grid grid-cols-3 gap-4">
        <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
            <input type="text" name="firstName" id="firstName" v-model="data.firstName" placeholder="First Name"
                class="w-full px-2 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
            <p class="text-sm mt-1 text-red-600">
                {{ errors.firstName ? errors.firstName[0] : '' }}
                {{ firstNameError }}
            </p>
        </div>
        <div>
            <label for="middleName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Middle Name</label>
            <input type="text" v-model="data.middleName" id="middleName" placeholder="Middle Name"
                class="w-full px-2 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
            <p class="text-sm mt-1 text-red-600">
                {{ errors.middleName ? errors.middleName[0] : '' }}
            </p>
        </div>
        <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
            <input type="text" v-model="data.lastName" id="lastName" placeholder="Last Name"
                class="w-full px-2 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
            <p class="text-sm mt-1 text-red-600">
                {{ errors.lastName ? errors.lastName[0] : '' }}
                {{ lastNameError }}
            </p>
        </div>
        <div class="col-span-3">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" name="email" id="email" autocomplete="email" v-model="data.email" placeholder="Enter Email"
                class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
            <p class="text-sm mt-1 text-red-600">
                {{ errors.email ? errors.email[0] : '' }}
                {{ emailError }}
            </p>
        </div>

        <div class="col-span-3">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" name="password" id="password" v-model="data.password" placeholder="Enter Password"
                class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
            <p class="text-sm mt-1 text-red-600">
                {{ errors.password ? errors.password[0] : '' }}
                {{ passwordError }}
            </p>
        </div>

        <div class="col-span-3">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input type="password" name="password" id="passwordConfirmation" v-model="data.password_confirmation" placeholder="Confirm Password"
                class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
            <p class="text-sm mt-1 text-red-600">
                {{ errors.password_confirmation ? errors.password_confirmation[0] : '' }}
                {{ confirmPasswordError }}
            </p>
        </div>

        <button type="submit"
            :class="[!isLoading ? 'col-span-3 bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700' : 'col-span-3 bg-teal-900 text-white py-2 rounded-md']">
            {{ isLoading ? 'Creating User...' : 'Create User' }}
        </button>
    </form>
  </div>

</template>

<style scoped></style>