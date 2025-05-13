<script setup>
import { onMounted, onUnmounted } from 'vue';
import PrimaryButton from '../../components/PrimaryButton.vue';
import logo from '../../assets/baguio-logo.png';
import smart from '../../assets/smart-city1.jpg';
import axiosClient from '../../axios.js';
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
    axiosClient.post("/logout").then(() => {
        router.push({ name: "Login" });
    });
};

// Function to handle automatic logout when user leaves the page
const handleBeforeUnload = () => {
    logout();
};

// Add event listener when component mounts
onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
});

// Clean up event listener when component unmounts
onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<template>
    <div class="justify-center items-center flex flex-col h-screen w-screen bg-gray-300" :style="{
        backgroundImage: `url(${smart})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    }">
        <div class="w-full px-4 sm:px-8 py-8 bg-black/50 backdrop-blur-md  shadow-inner">
            <div class="flex flex-col  justify-center items-center max-w-6xl mx-auto">
                <img :src="logo" alt="City of Baguio Logo" class="w-70 mx-auto" />
                <h1 class="text-[90px] font-bold tracking-tigh text-red-500">Unauthorized Access</h1>
                <p class="text-white text-[20px] font-bold">Access denied: User is not authorized for 911 system</p>
                <p class="text-white text-[20px] font-bold">Please contact your administrator for assistance.</p>
                <PrimaryButton @click="logout"
                    class="bg-teal-500 hover:bg-teal-600 hover:shadow-md font-bold text-white" name="Logout..."
                    type="submit" />
            </div>
        </div>
    </div>
</template>

<style scoped></style>