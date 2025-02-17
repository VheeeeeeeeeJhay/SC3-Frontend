<script setup>

import { ref, computed, onMounted } from "vue";
import axiosClient from "../axios.js";
import router from "../router.js";
import { useThemeStore } from '../stores/themeStore';

const themeStore = useThemeStore();

const bgClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-slate-900' : 'bg-stone-200';
})
const textClass = computed(() => {
  return themeStore.isDarkMode ? 'text-gray-100' : 'text-gray-900';
})
const boxClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-800' : 'bg-white';
})
const chartClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-700 border-gray-500' : 'bg-gray-200 border-gray-900';
})

import PieChart from "../components/charts/PieChart.vue";




</script>

<template>
    <div :class="bgClass" style="min-height: 100vh;">
      <header>
        <div class="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold tracking-tight" :class="textClass">
            Dashboard
          </h1>
        </div>
      </header>

      <main class="flex-1 my-3">
    <!-- Grid layout for the charts -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
      <!-- First chart in the first row -->

          <PieChart />
        
      
      <!-- Second chart in the first row (empty for now, you can add it later) -->

          <!-- Replace this with your actual BarChart component -->
          <!-- <BarChart /> -->


      <!-- Third chart in the first row (empty for now, you can add it later) -->

          <!-- Replace this with your actual LineChart component -->
          <!-- <LineChart /> -->

    </div>
  </main>
    </div>
</template>

<style scoped>

</style>