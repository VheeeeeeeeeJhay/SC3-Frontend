<script setup>
import { useRouter } from 'vue-router';
import logo from '../../assets/baguio-logo.png';
import smart from '../../assets/smart-city1.jpg';
import breathe from '../../assets/breathe-baguio.png';

const router = useRouter();

const goHome = () => {
    router.push('/');
};
</script>

<template>
    <!-- <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-200">
        <h1 class="text-6xl font-bold">404</h1>
        <p class="text-xl mt-2">na verify na ang iyong email. mahal ka ni Andre</p>
        <button 
            @click="goHome"
            class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
            Go to Dashboard
        </button>
    </div> -->
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
            <h1 class="text-[60px] font-bold tracking-tight text-gray-900 text-teal-500">You're Now Verified</h1>
            <p class="text-white text-[25px] font-bold">You can now access the dashboard.</p>
            <div class="flex">
                <button 
                    @click="goHome"
                    class="mt-4 px-6 py-2 px-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 hover:shadow-md transition"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
        </div>
    </div>
</template>