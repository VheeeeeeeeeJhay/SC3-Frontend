<script setup>
import { ref, inject } from 'vue';
import axiosClient from '../../axios.js';
import logo from '../../assets/baguio-logo.png';
import smart from '../../assets/smart-city1.jpg';
import breathe from '../../assets/breathe-baguio.png';
import { useRouter } from 'vue-router';

const router = useRouter();

const errors = ref({});

const addToast = inject('addToast');

const Verify = () => {
    axiosClient.post("/email/verification-notification", {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
    .then(response => {
        console.log('Email verification link sent');
        addToast('Email verification link sent', 'success', 'check_circle');
    })
    .catch(error => {
        console.log(error.response.data.message);
        addToast(error.response.data.message, 'error', 'error');
    })
};

const logout = () => {
    axiosClient.post("/logout").then(() => {
        router.push({ name: "Login" });
    });
};
</script>

<template>
    <div class="justify-center items-center flex flex-col h-screen w-screen bg-gray-300" :style="{
        backgroundImage: `url(${smart})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    }">
        <div class="w-full px-4 sm:px-8 py-8 bg-black/50 backdrop-blur-md shadow-inner">
        <div class="flex flex-col justify-center items-center max-w-6xl mx-auto">
            <div class="flex">
            <img :src="logo" alt="City of Baguio Logo" class="w-70 mx-auto" />
            <img :src="breathe" alt="Breathe Baguio" class="w-120 mx-auto" />
            </div>
            <h1 class="text-[60px] font-bold tracking-tigh text-red-500">You're Not Verified</h1>
            <p class="text-white text-[25px] font-bold">Please verify your email address to access the dashboard.</p>
            <div class="flex gap-4">
                <button 
                    @click="Verify"
                    class="mt-4 px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 hover:shadow-md transition"
                >
                    Verify Email
                </button>

                <button 
                    @click="logout"
                    class="mt-4 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 hover:shadow-md transition"
                >
                    Logout
                </button>
            </div>
        </div>
        </div>
    </div>
</template>