<script setup>

import { ref, computed, onMounted } from "vue";
import axiosClient from "../axios.js";
import router from "../router.js";
import { useThemeStore } from '../stores/themeStore';
import PieChart from "../components/charts/PieChart.vue";
import LineChart from "../components/charts/LineChart.vue";
import BarChart from "../components/charts/BarChart.vue";

const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-800 border-black text-white" : "bg-sky-50 border-gray-200 text-sky-900"
})



const incidents = [
  { name: 'Brawl', value: 'brawl' },
  { name: 'Assault', value: 'assault' },
  { name: 'Vandalism', value: 'vandalism' },
  { name: 'Traffic Violation', value: 'traffic' },
  { name: 'Suspicious Activity', value: 'suspicious' },
  { name: 'Other', value: 'other' }
];

const dateFilters = [
  { name: 'Today', value: 'today' },
  { name: 'This Week', value: 'week' },
  { name: 'This Month', value: 'month' },
  { name: 'This Year', value: 'year' },
];

const selectedMonth1 = ref('');
const selectedMonth2 = ref('');

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];



const formatDate = (date) => date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

const currentDate = ref(new Date());
const selectedEndDate = ref(formatDate(new Date())); // Current day
const selectedStartDate = ref(formatDate(new Date(new Date().setDate(new Date().getDate() - 6)))); // 6 days ago
const selectedDateRange = ref({ start: selectedStartDate.value, end: selectedEndDate.value });
</script>

<template>
  <div class="min-h-screen">
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      <div class="grid grid-cols-3 gap-6">
        <div class="col-span-1 p-6 rounded-lg shadow" :class="themeClasses">
          <PieChart/>
        </div>
        
        <div class="col-span-1 p-6 rounded-lg shadow" :class="themeClasses">
          <h2 class="text-xl font-semibold mb-4" :class="themeClasses">Recent Activities</h2>
          
            
        </div>
        <div class="col-span-1 p-6 rounded-lg shadow" :class="themeClasses">
          <h2 class="text-xl font-semibold mb-4" :class="themeClasses">Growth Rate of Incidents</h2>
          <div class="text-4xl font-bold text-green-500 dark:text-green-500 text-center mb-4">
            23%
            <svg class="w-6 h-6 inline-block ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4"/>
            </svg>
          </div>
          <div class="flex justify-center space-x-4">
            <select v-model="selectedMonth1" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
              <option value="" disabled>Select Month 1</option>
              <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
            </select>
            <select v-model="selectedMonth2" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
              <option value="" disabled>Select Month 2</option>
              <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="mt-6 grid grid-cols-2 gap-6">
        <!-- linechart -->
        <div class="p-6 rounded-lg shadow" :class="themeClasses">
            <LineChart/>
        </div>
      
      
          <div class="p-6 rounded-lg shadow" :class="themeClasses">
            <BarChart :dateRange="selectedDateRange" class="w-full"/>
          </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
#pie-chart {
  background-color: white !important;
}
</style>