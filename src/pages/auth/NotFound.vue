<script setup>
import { RouterLink } from 'vue-router';
import PrimaryButton from '../../components/PrimaryButton.vue';
import logo from '../../assets/baguio-logo.png';
import smart from '../../assets/smart-city1.jpg';
import breathe from '../../assets/breathe-baguio.png';
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
        <h1 class="text-[90px] font-bold tracking-tigh text-red-500">404</h1>
        <p class="text-white text-[45px] font-bold">Ooops, Page not found</p>
        <RouterLink :to="{ name: 'Overview' }">
          <PrimaryButton class="bg-teal-500 hover:bg-teal-600 hover:shadow-md font-bold text-white" name="Go Back"
            type="submit" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped></style>