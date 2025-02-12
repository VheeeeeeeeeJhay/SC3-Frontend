<script setup>
import { PhotoIcon } from '@heroicons/vue/24/solid'
import { ref, computed } from "vue";
import axiosClient from "../axios.js";
import router from "../router.js";
import { useThemeStore } from '../stores/themeStore';

const themeStore = useThemeStore();


const bgClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-900' : 'bg-gray-100';
})
const textClass = computed(() => {
  return themeStore.isDarkMode ? 'text-gray-100' : 'text-gray-900';
})
const boxClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-800' : 'bg-white';
})
const chartClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-500' : 'bg-gray-200';
})

</script>

<template>
    <div :class="bgClass" style="min-height: 100vh;">
      <header :class="boxClass">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold tracking-tight" :class="textClass">
            Analytics
          </h1>
        </div>
      </header>
      <main class="flex-1" :class="boxClass">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <p :class="textClass">Dashboard</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
            <div class="rounded-lg shadow-lg p-4 border border-gray-700 h-[350px]" :class="chartClass">
                <h2 class="text-lg font-semibold mb-2" :class="textClass">Distribution of incident</h2>
                <div class="h-[calc(100%-2rem)]">                 
                    <!-- <PieChart /> -->
                </div>
            </div>
            <div class="bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-700 h-[350px]">
                <h2 class="text-lg font-semibold mb-2" :class="textClass">Crime chuchu</h2>
                <div class="h-[calc(100%-2rem)]">                
                    <!-- <BarChart /> -->
                </div>
            </div>
            <div class="bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-700 md:col-span-2 h-[350px]">
                <h2 class="text-lg font-semibold mb-2" :class="textClass">Crime Rate</h2>
                <div class="h-[calc(100%-2rem)]">
                    <!-- <LineChart /> -->
                </div>
            </div>
        </div>


      </main>
    </div>
</template>

<style scoped>

</style>