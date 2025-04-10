<script setup>

import { ref, computed, onMounted, watch } from "vue";
import axiosClient from "../axios.js";
import PieChart from "../components/charts/PieChart.vue";
import LineChart from "../components/charts/LineChart.vue";
import BarChart from "../components/charts/BarChart.vue";
import IncidentGrowthRate from "../components/widgets/IncidentGrowthRate.vue";
import RecentIncident from "../components/widgets/RecentIncident.vue";
import TotalReportsReceived from "../components/widgets/TotalReportsReceived.vue";
import TopPerforming from "../components/widgets/TopPerforming.vue";
import DateRangePicker from "../components/DateRangePicker.vue";
import monthYearPicker from "../components/monthYearPicker.vue";
import TestMail from "../mail/TestMail.vue";
//import MonthPicker from "vue-month-picker";

// /👾👾👾👾👾👾👾👾/ //
// Fetch Data From Backend //

// const incidents = ref([]);
// const reports = ref([]);

// const currentYear = new Date().getFullYear();
// const currentMonthIndex = new Date().getMonth(); // 0-based index (January = 0)
// const years = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => 2020 + i); // Ensure inclusion of the current year

// const months = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December'
// ];

// const selectedYear1 = ref(2025);
// const selectedMonth1 = ref(months[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1]); // Previous month
// const selectedMonth2 = ref(months[currentMonthIndex]); // Current month
// const monthPicker1 = ref("January");



// const filteredMonths2 = computed(() => {
//   if (!selectedYear1.value || !selectedMonth1.value) return [];

//   const selectedDateIndex = months.indexOf(selectedMonth1.value);

//   // If the same year, filter to exclude previous months
//   if (selectedYear1.value === currentYear) {
//     return months.slice(selectedDateIndex + 1);
//   }

//   // Different year, allow all months
//   return months;
// });

// // Reset months when year or month selection changes
// watch(selectedYear1, () => {
//   selectedMonth1.value = null;
//   selectedMonth2.value = null;
// });

// watch(selectedMonth1, () => {
//   selectedMonth2.value = null;
// });



// onMounted(() => {
//   axiosClient.get('/api/911/dashboard', {
//     headers: {
//       'x-api-key': import.meta.env.VITE_API_KEY
//     }
//   })
//     .then((res) => {
//       setTimeout(() => {
//         incidents.value = res.data;
//         reports.value = res.data.report;
//         console.log(reports.value, 'report data')
//       }, 1500);
//     })
//     .catch((error) => {
//       console.error('Error fetching data:', error);
//       // errorMessage.value = 'Failed to load incidents. Please try again later.';
//     });
// });

// // Function to count reports for a given month
// const getReportCountForMonth = (month) => {
//   if (!month) return 0;

//   const monthIndex = months.indexOf(month) + 1; // Convert to 1-based index (Jan = 1)
//   return reports.value.filter(report => {
//     const reportDate = new Date(report.date_received);
//     return reportDate.getMonth() + 1 === monthIndex;
//   }).length;
// };

// // Compute percentage change dynamically
// const percentageChange = computed(() => {
//   const count1 = getReportCountForMonth(selectedMonth1.value);
//   const count2 = getReportCountForMonth(selectedMonth2.value);

//   if (count1 === 0) return count2 > 0 ? 100 : 0; // Avoid division by zero

//   return ((count2 - count1) / count1) * 100;
// });

//for filters
const currentYear = new Date().getFullYear();
const selectedYear1 = ref(currentYear);
const selectedMonth1 = ref(new Date().getMonth() + 1); // JS months are 0-based
const startDate = ref(null);
const endDate = ref(null);

const updateDateRange = ({ start, end }) => {
  startDate.value = start;
  endDate.value = end;
  console.log("Date Range:", startDate.value, endDate.value);
};

//for image capture
// import domtoimage from 'dom-to-image'

// const captureTarget = ref(null)
// const exportedImageUrl = ref(null)

// const exportAsImage = () => {
//   if (!captureTarget.value) return;

//   const now = new Date()
//   const timestamp = now.toISOString().replace(/[:.]/g, '-')
//   const filename = `Barchart-${timestamp}.png`

//   domtoimage.toPng(captureTarget.value)
//     .then((dataUrl) => {
//       // Save dataUrl for preview
//       exportedImageUrl.value = dataUrl

//       // Trigger download
//       const link = document.createElement('a')
//       link.download = filename
//       link.href = dataUrl
//       link.click()
//     })
//     .catch((error) => {
//       console.error('oops, something went wrong!', error)
//     })
// }

import domtoimage from 'dom-to-image';

// Refs for capture targets
const captureTarget1 = ref(null);
const captureTarget2 = ref(null);

// Array to hold the exported image URLs
const exportedImageUrls = ref([]);

// Export the images from specific capture targets
const exportAsImage = (chartNumber) => {
  let captureTarget;
  
  // Choose the capture target based on the chartNumber (1 for BarChart, 2 for LineChart)
  if (chartNumber === 1) {
    captureTarget = captureTarget1;
  } else if (chartNumber === 2) {
    captureTarget = captureTarget2;
  }

  if (!captureTarget.value) return;

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const filename = `Chart-${chartNumber}-${timestamp}.png`;

  domtoimage.toPng(captureTarget.value)
    .then((dataUrl) => {
      // Store the exported image URL
      exportedImageUrls.value.push(dataUrl);
    })
    .catch((error) => {
      console.error('Error exporting image:', error);
    });
};

// Download specific image from the preview
const downloadImage = (imageUrl, index) => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const filename = `Chart-${index + 1}-${timestamp}.png`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = imageUrl;
  link.click();
};

// Download all images individually
const downloadAll = () => {
  if (exportedImageUrls.value.length === 0) return;

  // Loop through each image and download them one by one
  exportedImageUrls.value.forEach((imageUrl, index) => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const filename = `Chart-${index + 1}-${timestamp}.png`;

    const link = document.createElement('a');
    link.download = filename;
    link.href = imageUrl;
    link.click(); // Trigger the download
  });
};

// Handle print functionality (Save as PDF)
const handlePrint = () => {
  if (exportedImageUrls.value.length === 0) return;

  const printWindow = window.open('', '_blank', 'width=800,height=600');

  // Construct HTML for the print preview with all images
  let imagesHtml = exportedImageUrls.value
    .map((imageUrl) => `<img src="${imageUrl}" alt="Chart" style="width: 100%; max-height: 600px; margin-bottom: 20px;" />`)
    .join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Charts PDF</title>
        <style>
          body {
            margin: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
          img {
            max-width: 80%;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        ${imagesHtml}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for images to load before printing
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };
};

// Remove a specific image from the preview
const removeImage = (index) => {
  exportedImageUrls.value.splice(index, 1);
};

// Clear all images from the preview
const clearAllImages = () => {
  exportedImageUrls.value = [];
};
</script>

<template>
  <div>

    <!-- Separate Export Buttons for Each Chart -->
    <button 
      @click="exportAsImage(1)" 
      class="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
    >
      Export Bar Chart as Image
    </button>
    <button 
      @click="exportAsImage(2)" 
      class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
    >
      Export Line Chart as Image
    </button>

    <!-- Preview Section -->
    <div v-if="exportedImageUrls.length" class="preview-box">
      <h3>Preview:</h3>
      <div class="flex flex-wrap gap-4">
        <div v-for="(image, index) in exportedImageUrls" :key="index" class="relative">
          <img 
            :src="image" 
            alt="Exported Chart Preview" 
            class="cursor-pointer transition-transform duration-300 ease-in-out w-24 h-24"
          />
          <!-- Download Button for Each Image -->
          <button 
            @click="downloadImage(image, index)" 
            class="absolute top-0 right-0 bg-gray-700 text-white p-1 rounded-full text-xs hover:bg-gray-800 transition-all"
          >
            Download
          </button>
          <!-- Remove Button for Each Image -->
          <button 
            @click="removeImage(index)" 
            class="absolute top-0 left-0 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition-all"
          >
            X
          </button>
        </div>
      </div>

      <!-- Download All Button -->
      <button 
        @click="downloadAll" 
        class="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-300"
      >
        Download All Images
      </button>

      <!-- Save All Images as PDF -->
      <button 
        @click="handlePrint" 
        class="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300" 
        :disabled="!exportedImageUrls.length"
      >
        Save All as PDF
      </button>

      <!-- Cancel Button to Remove All Images -->
      <button 
        @click="clearAllImages" 
        class="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
      >
        Cancel
      </button>
    </div>
  </div>
  <div class="min-h-screen p-4">

    <!-- Title -->
    <div class="mt-6 px-2 flex items-center justify-between">
      <h1 class="text-2xl font-bold dark:text-white">Overview</h1>
      <div class="flex items-center space-x-6">
        <monthYearPicker class="flex-1" v-model:selectedMonth="selectedMonth1" v-model:selectedYear="selectedYear1" />
        <DateRangePicker class="max-w-xs" @dateRangeSelected="updateDateRange" />
      </div>
    </div>

    <main class="mx-auto my-6 max-w-7xl px-4 sm:px-6 lg:px-8">

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Incident Growth Rate Card -->
        <div class="p-4 bg-white dark:bg-black border-2 border-gray-950 dark:border-blue-950 rounded-2xl shadow-xl dark:shadow-inner transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500">
          <!-- <IncidentGrowthRate :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" /> -->
        </div>

        <!-- Total Reports Card -->
        <div class="p-4 bg-white dark:bg-black border-2 border-gray-200 dark:border-blue-950 rounded-2xl shadow-xl dark:shadow-inner transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500">
          <TotalReportsReceived :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate" :endDate="endDate" />
        </div>

        <!-- Top Performing Card -->
        <div class="p-4 bg-white dark:bg-black border-2 border-gray-200 dark:border-blue-950 rounded-2xl shadow-xl dark:shadow-inner transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500">
          <TopPerforming :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate" :endDate="endDate" />
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Line Chart Card -->
        <div ref="captureTarget2" class="capture-box">
          <div class="p-4 bg-white dark:bg-black border-4 border-gray-200 dark:border-blue-950 rounded-2xl shadow-xl dark:shadow-inner transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500">
            <LineChart :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate" :endDate="endDate" />
          </div>
        </div>

        <!-- Bar Chart Card -->
        <div ref="captureTarget1" class="capture-box">
          <div class="p-4 bg-white dark:bg-black border-2 border-gray-200 dark:border-blue-950 rounded-2xl shadow-xl dark:shadow-inner transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-400">
            <!-- <BarChart :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate" :endDate="endDate" class="w-full h-full" /> -->
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Pie Chart Card -->
        <div class="p-4 bg-white dark:bg-black border-2 border-gray-200 dark:border-blue-950 rounded-2xl shadow-xl dark:shadow-inner transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500">
          <!-- <PieChart :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate" :endDate="endDate" /> -->
        </div>

        <!-- Recent Incident Card -->
        <div class="p-4 bg-white dark:bg-black border-2 border-gray-200 dark:border-blue-950 rounded-2xl shadow-xl dark:shadow-inner transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500 text-gray-800 dark:text-white">
          <!-- <RecentIncident /> -->
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
#pie-chart {
  background-color: white !important;
}

.apexcharts-toolbar {
  background-color: black !important;
  color: white !important;
  border-radius: 5px;
  padding: 5px;
}

.apexcharts-menu {
  background-color: black !important;
  color: white !important;
}

.apexcharts-menu-item {
  color: white !important;
}

.apexcharts-menu-item:hover {
  background-color: gray !important;
}

/* Responsive Design Adjustments */
@media (max-width: 768px) {
  .grid-cols-1 {
    grid-template-columns: 1fr;
  }
}
</style>
