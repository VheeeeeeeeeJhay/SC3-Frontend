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

const submit = () => {
    isLoading.value = true;
    
    // Transform boolean values to integers for backend compatibility
    const formData = {
        ...data.value,
        for_911: data.value.for_911 ? 1 : 0,
        for_inventory: data.value.for_inventory ? 1 : 0,
        for_traffic: data.value.for_traffic ? 1 : 0
    };

    axiosClient.post("/register", formData, {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY
      }
    })
      .then(response => {
        console.log(response.data);
        addToast(response.data.message, 'success', 'check_circle');
        // Close the modal after successful registration
        isModalOpen.value = false;
        // Clear form data
        Object.keys(data.value).forEach(key => data.value[key] = '');
        // Clear errors
        Object.keys(errors.value).forEach(key => errors.value[key] = []);
      })
      .catch(error => {
        console.error('Registration error:', error.response?.data);
        if (error.response?.data?.errors) {
            // Set all errors at once
            errors.value = error.response.data.errors;
            // Show all error messages
            Object.values(errors.value).forEach(fieldErrors => {
                fieldErrors.forEach(error => {
                    addToast(error, 'error', 'error');
                });
            });
        } else {
            addToast('An error occurred during registration', 'error', 'error');
        }
      })
      .finally(() => {
        isLoading.value = false;
      })
}

</script>

<template>
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

        <button type="submit"
            :class="[!isLoading ? 'col-span-3 bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700' : 'col-span-3 bg-teal-900 text-white py-2 rounded-md']">
            {{ isLoading ? 'Creating User...' : 'Create User' }}
        </button>
    </form>
</template>

<style scoped></style>