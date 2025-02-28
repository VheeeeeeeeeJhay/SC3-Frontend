<script setup>
import { RouterLink } from 'vue-router';
import PrimaryButton from '../../components/PrimaryButton.vue';
import Loader2 from '../../components/loader2.vue';
</script>

<template>
  <div class="justify-center items-center flex flex-col h-screen w-screen bg-red-400">
    <Loader2 />
    <h1 class="text-[90px] font-bold tracking-tight text-gray-900">Page Not Found</h1>
    <RouterLink :to="{ name: 'Dashboard' }">
      <!-- <br /> -->
      <PrimaryButton class="bg-green-500 hover:bg-green-600 hover:shadow-md font-bold text-white" name="Go Back" type="submit"/>
    </RouterLink>
  </div>
</template>

<style scoped>
</style>