<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import axiosClient from '../../axios.js';
import DateRangePicker from '../DateRangePicker.vue';

// 📌 Reactive variables
const totalReports = ref([]); // Store all reports
const filteredReports = ref([]); // Store filtered reports
let interval_id = null;

// 📌 Fetch Data from API
const fetchData = async () => {
    try {
        const response = await axiosClient.get('/api/911/report-display', {
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY
            }
        });
        console.log("Full API Response:", response.data[0]);
        totalReports.value = response.data; // Store the entire reports array
        console.log(totalReports.value.length, '✅ Total Reports Loaded');
        // totalReports.value = response.data.Target; // Store full reports array
        // console.log(totalReports.value, 'total reports data')  
        filterReports(); // Apply filtering immediately
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

onMounted(() => {
    fetchData();
    interval_id = setInterval(fetchData, 60000);
});

onBeforeUnmount(() => {
    clearInterval(interval_id);
});

// 📌 Date & Selection Variables
const currentYear = new Date().getFullYear();
const selectedOption = ref("day"); // Default to 'day'
const selectedMonth1 = ref("");
const selectedYear1 = ref(currentYear);
const selectedStartDate = ref(new Date());
const selectedEndDate = ref(new Date());

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => 2020 + i);

// 📌 Format Date for Filtering
const formatDate = (date) => date.toISOString().split('T')[0];

// 📌 Update date range (For 'week' option)
const updateDateRange = (range) => {
    selectedStartDate.value = new Date(range.start);
    selectedEndDate.value = new Date(range.end);
    filterReports(); // Re-filter reports when date changes
};

// 📌 Filter Reports Based on Selected Option
const filterReports = () => {
    const today = formatDate(new Date());

    if (selectedOption.value === "day") {
        filteredReports.value = totalReports.value.filter(report => 
            formatDate(new Date(report.date_received)) === today
        );
    } 
    else if (selectedOption.value === "week") {
        filteredReports.value = totalReports.value.filter(report => {
            const reportDate = new Date(report.date_received);
            return reportDate >= selectedStartDate.value && reportDate <= selectedEndDate.value;
        });
    } 
    else if (selectedOption.value === "month") {
        const monthIndex = months.indexOf(selectedMonth1.value) + 1;
        const year = selectedYear1.value;
        
        filteredReports.value = totalReports.value.filter(report => {
            const reportDate = new Date(report.date_received);
            return reportDate.getMonth() + 1 === monthIndex && reportDate.getFullYear() === year;
        });
    }
};

// 📌 Watchers to re-filter reports on selection change
import { watch } from 'vue';

watch([selectedOption, selectedMonth1, selectedYear1, selectedStartDate, selectedEndDate], () => {
    filterReports();
});

</script>

<template>
    <!-- Title -->
    <h2 class="text-base font-medium dark:text-white">
        Total Reports Received
        <ToolTip Information="The total reports received is the total number of reports received in the system." />
    </h2>

    <!-- Month Selection -->
    <!-- Selection Dropdown -->
    <div class="grid grid-cols-3 gap-3 items-center">
        <div>
            <select 
                v-model="selectedOption" 
                class="w-full px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition duration-200"
            >
                <option value="day">This Day</option>
                <option value="week">By Week</option>
                <option value="month">By Month</option>
            </select>
        </div>

        <!-- Date Range for 'This Week' -->
        <div class="col-span-2" v-if="selectedOption === 'week'">
            <DateRangePicker @dateRangeSelected="updateDateRange"/>
        </div>

        <!-- Month & Year Selection for 'This Month' -->
        <div v-if="selectedOption === 'month'" class="flex col-span-2 gap-2 items-center">
            <div>
                <select 
                    v-model="selectedMonth1" 
                    :disabled="!selectedYear1"
                    class="w-full px-3 py-2 text-sm font-medium bg-teal-500 text-white rounded-lg shadow hover:bg-teal-600 transition duration-200 disabled:opacity-50"
                >
                    <option v-for="month in months" :key="month" :value="month">
                        {{ month }}
                    </option>
                </select>
            </div>

            <div>
                <select 
                    v-model="selectedYear1"
                    class="w-full px-3 py-2 text-sm font-medium bg-teal-500 text-white rounded-lg shadow hover:bg-teal-600 transition duration-200"
                >
                    <option v-for="year in years" :key="year" :value="year">
                        {{ year }}
                    </option>
                </select>
            </div>
        </div>
    </div>

    <!-- Total Reports Display -->
    <div class="flex justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" height="100px" viewBox="0 0 24 24" width="100px" fill="#54808C">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z" />
        </svg>

        <!-- Percentage Change Display -->
        <div class="flex justify-center items-center space-x-2">
            <div class="text-5xl font-bold dark:text-white">
                {{ filteredReports.length }}
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>