<script setup>
import axiosClient from '../../axios.js';
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import ToolTip from '../../components/ToolTip.vue';

const incidents = ref([]);
const reports = ref([]);

const currentYear = new Date().getFullYear();
const currentMonthIndex = new Date().getMonth(); // 0-based index (January = 0)
const years = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => 2020 + i); // Ensure inclusion of the current year

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const selectedYear1 = ref(2025);
const selectedMonth1 = ref(months[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1]); // Previous month
const selectedMonth2 = ref(months[currentMonthIndex]); // Current month

const filteredMonths2 = computed(() => {
    if (!selectedYear1.value || !selectedMonth1.value) return [];

    const selectedDateIndex = months.indexOf(selectedMonth1.value);

    // If the same year, filter to exclude previous months
    if (selectedYear1.value === currentYear) {
        return months.slice(selectedDateIndex + 1);
    }

    // Different year, allow all months
    return months;
});

// Reset months when year or month selection changes
watch(selectedYear1, () => {
    selectedMonth1.value = null;
    selectedMonth2.value = null;
});

watch(selectedMonth1, () => {
    selectedMonth2.value = null;
});

let interval_id = null;

const fetchData = async () => {
    try {
        const response = await axiosClient.get('/api/911/dashboard', {
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY
            }
        })
        incidents.value = response.data;
        reports.value = response.data.report;
        console.log(reports.value, 'report data')
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};


onMounted(() => {
    // axiosClient.get('/api/911/dashboard', {
    //     headers: {
    //         'x-api-key': import.meta.env.VITE_API_KEY
    //     }
    // })
    //     .then((res) => {
    //         setTimeout(() => {
    //             incidents.value = res.data;
    //             reports.value = res.data.report;
    //             console.log(reports.value, 'report data')
    //         }, 1500);
    //     })
    //     .catch((error) => {
    //         console.error('Error fetching data:', error);
    //         // errorMessage.value = 'Failed to load incidents. Please try again later.';
    //     });

    fetchData();

    interval_id = setInterval(fetchData, 5000);
});

onBeforeUnmount(() => {
    clearInterval(interval_id);
});

// Function to count reports for a given month
const getReportCountForMonth = (month) => {
    if (!month) return 0;

    const monthIndex = months.indexOf(month) + 1; // Convert to 1-based index (Jan = 1)
    return reports.value.filter(report => {
        const reportDate = new Date(report.date_received);
        return reportDate.getMonth() + 1 === monthIndex;
    }).length;
};

// Compute percentage change dynamically
const percentageChange = computed(() => {
    const count1 = getReportCountForMonth(selectedMonth1.value);
    const count2 = getReportCountForMonth(selectedMonth2.value);

    if (count1 === 0) return count2 > 0 ? 100 : 0; // Avoid division by zero

    return ((count2 - count1) / count1) * 100;
});



const formatDate = (date) => date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

// const currentDate = ref(new Date());
const selectedEndDate = ref(formatDate(new Date())); // Current day
const selectedStartDate = ref(formatDate(new Date(new Date().setDate(new Date().getDate() - 6)))); // 6 days ago
const selectedDateRange = ref({ start: selectedStartDate.value, end: selectedEndDate.value });
</script>

<template>
    <!-- Title -->
    <h2 class="text-base font-medium dark:text-white">
        Growth Rate of Incidents
        <ToolTip
            Information="The growth rate of incidents is the percentage change in the number of incidents between two months." />
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
        <div class="flex justify-center items-center">
            <svg v-if="percentageChange < 0" xmlns="http://www.w3.org/2000/svg" height="100px" viewBox="0 0 24 24"
                width="100px" fill="#75FB4C">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z" />
            </svg>
            <svg v-if="percentageChange > 0" xmlns="http://www.w3.org/2000/svg" height="100px" viewBox="0 0 24 24"
                width="100px" fill="#EA3323">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
            </svg>
            <svg v-if="percentageChange == 0" xmlns="http://www.w3.org/2000/svg" height="100px" viewBox="0 0 24 24"
                width="100px" fill="#666666">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M22 12l-4-4v3H3v2h15v3l4-4z" />
            </svg>
        </div>

        <!-- Percentage Change Display -->
        <div class="flex justify-center items-center space-x-2">
            <div class="text-5xl font-bold"
                :class="percentageChange == 0 ? 'text-gray-500' : percentageChange >= 0 ? 'text-red-500' : 'text-green-500'">
                {{ percentageChange.toFixed(2) }}%
            </div>
        </div>
    </div>
</template>

<style scoped></style>
