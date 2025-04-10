<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import ToolTip from '../../components/ToolTip.vue';
import { useDatabaseStore } from '../../stores/databaseStore';

// Props
const props = defineProps({
  selectedYear: Number,
  selectedMonth: Number
});


const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];


// 🎯 Adjust selected months and years correctly
const selectedMonth2 = ref(months[props.selectedMonth - 1]); // Current month
const selectedMonth1 = ref(
  props.selectedMonth === 1 ? months[11] : months[props.selectedMonth - 2] // Previous month
);
const selectedYear1 = ref(
  props.selectedMonth === 1 ? props.selectedYear - 1 : props.selectedYear // Adjust year for Dec → Jan transition
);
const selectedYear2 = ref(props.selectedYear); // Keep the current year

// console.log(`📆 Previous Month: ${selectedMonth1.value}, Year: ${selectedYear1.value}`);
// console.log(`📆 Current Month: ${selectedMonth2.value}, Year: ${selectedYear2.value}`);

// Update values when props change
watch(() => [props.selectedYear, props.selectedMonth], () => {
  selectedMonth2.value = months[props.selectedMonth - 1]; // Current month
  selectedMonth1.value = props.selectedMonth === 1 ? months[11] : months[props.selectedMonth - 2]; // Previous month
  selectedYear1.value = props.selectedMonth === 1 ? props.selectedYear - 1 : props.selectedYear; // Adjust year if needed
  selectedYear2.value = props.selectedYear; // Keep current year
});

let refreshInterval = null;
const databaseStore = useDatabaseStore();

onMounted(() => {

    databaseStore.fetchData();
    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);

});

const computedProperties = {
    reports: "reportsList",
};

const {
    reports,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

// Function to count reports for a given month
const getReportCountForMonth = (month, year) => { 
    if (!month || !year) return 0; 

    const monthIndex = months.indexOf(month) + 1; // Convert to 1-based index (Jan = 1)
    
    // console.log(`🔍 Checking reports for ${month} ${year} (Index: ${monthIndex})`);

    const filteredReports = reports.value.filter(report => {
        const reportDate = new Date(report.date_received);
        const reportMonth = reportDate.getMonth() + 1;
        const reportYear = reportDate.getFullYear();

        // console.log(`📅 Report Date: ${report.date_received} (Month: ${reportMonth}, Year: ${reportYear})`);

        return reportMonth === monthIndex && reportYear === year;
    });

    // console.log(`✅ Found ${filteredReports.length} reports for ${month} ${year}`);

    return filteredReports.length;
};


// Compute Month over Month Growth Rate == value2 - value1 / value1 * 100
const percentageChange = computed(() => {
    const count1 = getReportCountForMonth(selectedMonth1.value, selectedYear1.value);
    const count2 = getReportCountForMonth(selectedMonth2.value, selectedYear2.value);

    if (count1 === 0) return count2 > 0 ? 100 : 0; // Avoid division by zero

    return ((count2 - count1) / count1) * 100;
});
</script>

<template>
    <!-- Title -->
    <h2 class="text-base font-medium dark:text-white">
        Growth Rate of Incidents
        <ToolTip
            Information="The growth rate of incidents is the percentage change in the number of incidents between two months." />
            <p class="text-xs">Compared to previous month</p>
    </h2>

    <!-- Month Selection -->
    <div class="grid grid-cols-3 gap-2 items-center">
        <!-- Month 1 Selection -->
        <div class="col-span-1">
            <!-- <select v-model="selectedMonth1" :disabled="!selectedYear1"
                class="w-full px-2 py-1 text-sm font-medium bg-teal-500 text-white rounded-md shadow hover:bg-teal-600 transition duration-200 disabled:opacity-50">
                <option value="" disabled>Month 1</option>
                <option v-for="month in months" :key="month" :value="month">
                    {{ month }}
                </option>
            </select> -->
        </div>

        <!-- Month 2 Selection -->
        <div class="col-span-1">
            <!-- <select v-model="selectedMonth2" :disabled="!selectedMonth1"
                class="w-full px-2 py-1 text-sm font-medium bg-teal-500 text-white rounded-md shadow hover:bg-teal-600 transition duration-200 disabled:opacity-50">
                <option value="" disabled>Month 2</option>
                <option v-for="month in filteredMonths2" :key="month" :value="month">
                    {{ month }}
                </option>
            </select> -->
        </div>

        <!-- Year Selection -->
        <!-- <div class="col-span-1">
            <select v-model="selectedYear1"
                class="w-full px-2 py-1 text-sm font-medium bg-teal-500 text-white rounded-md shadow hover:bg-teal-600 transition duration-200">
                <option value="" disabled>Select Year</option>
                <option v-for="year in years" :key="year" :value="year">
                    {{ year }}
                </option>
            </select>
        </div> -->
        <!-- <monthYearPicker v-model:selectedMonth="selectedMonth1" v-model:selectedYear="selectedYear1"/> -->

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
