<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axiosClient from '../../axios.js';

const totalReports = ref(0);
let interval_id = null;

const fetchData = async () => {
    try {
        const response = await axiosClient.get('/api/911/total-reports', {
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY
            }
        });
        totalReports.value = response.data.total;
        console.log(totalReports.value, 'total reports');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

onMounted(() => {
    fetchData();

    interval_id = setInterval(fetchData, 5000);
});

onBeforeUnmount(() => {
    clearInterval(interval_id);
});
</script>

<template>
    <!-- Title -->
    <h2 class="text-base font-medium dark:text-white">
        Total Reports Received
        <ToolTip Information="The total reports received is the total number of reports received in the system." />
    </h2>

    <!-- Month Selection -->
    <div class="grid grid-cols-3 gap-2 items-center">
        <!-- Month 1 Selection -->
        <div class="col-span-1">
            <select v-model="selectedMonth1" :disabled="!selectedYear1"
                class="w-full px-2 py-1 text-sm font-medium bg-teal-500 text-white rounded-md shadow hover:bg-teal-600 transition duration-200 disabled:opacity-50">
                <option value="" disabled>Month 1</option>
                <option v-for="month in months" :key="month" :value="month">
                    {{ month }}
                </option>
            </select>
        </div>

        <!-- Month 2 Selection -->
        <div class="col-span-1">
            <select v-model="selectedMonth2" :disabled="!selectedMonth1"
                class="w-full px-2 py-1 text-sm font-medium bg-teal-500 text-white rounded-md shadow hover:bg-teal-600 transition duration-200 disabled:opacity-50">
                <option value="" disabled>Month 2</option>
                <option v-for="month in filteredMonths2" :key="month" :value="month">
                    {{ month }}
                </option>
            </select>
        </div>

        <!-- Year Selection -->
        <div class="col-span-1">
            <select v-model="selectedYear1"
                class="w-full px-2 py-1 text-sm font-medium bg-teal-500 text-white rounded-md shadow hover:bg-teal-600 transition duration-200">
                <option value="" disabled>Select Year</option>
                <option v-for="year in years" :key="year" :value="year">
                    {{ year }}
                </option>
            </select>
        </div>
    </div>

    <div class="flex justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" height="100px" viewBox="0 0 24 24" width="100px" fill="#54808C">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z" />
        </svg>

        <!-- Percentage Change Display -->
        <div class="flex justify-center items-center space-x-2">
            <div class="text-5xl font-bold dark:text-white">
                {{ totalReports }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
