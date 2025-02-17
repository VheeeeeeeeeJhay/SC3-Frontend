<script setup>

import { ref, computed } from "vue";
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

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
            <div class="rounded-lg shadow-lg p-4 border h-[350px] mx-4" :class="chartClass">
                <h2 class="text-lg font-semibold mb-2" :class="textClass">Distribution of incident</h2>
                <div class="h-[calc(100%-2rem)]">                 
                    <!-- <PieChart /> -->
                </div>
            </div>
            <div class="rounded-lg shadow-lg p-4 border h-[350px] mx-4" :class="chartClass">
                <h2 class="text-lg font-semibold mb-2" :class="textClass">Crime chuchu</h2>
                <div class="h-[calc(100%-2rem)]">                
                    <!-- <BarChart /> -->
                </div>
            </div>
            <div class="rounded-lg shadow-lg p-4 border md:col-span-2 h-[350px] mx-4" :class="chartClass">
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