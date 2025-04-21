<script setup>

import { ref, computed, onMounted, watch, } from "vue";
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

// Fullscreen card logic
const fullscreenCard = ref(null);
const expandCard = (cardName) => {
  fullscreenCard.value = cardName;
};
const closeFullscreen = () => {
  fullscreenCard.value = null;
};

// Handle Escape key to exit fullscreen
const handleKeydown = (e) => {
  if (e.key === "Escape") {
    closeFullscreen();
  }
};
onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

// Map string identifiers to components
const componentMap = {
  IncidentGrowthRate,
  TotalReportsReceived,
  TopPerforming,
  LineChart,
  BarChart,
  PieChart,
  RecentIncident,
};

const fullscreenCardComponent = computed(() => {
  return componentMap[fullscreenCard.value] || null;
});

import domtoimage from 'dom-to-image';

// Refs for capture targets
const captureTarget1 = ref(null);
const captureTarget2 = ref(null);
const captureTarget3 = ref(null);

// Array to hold the exported image URLs
const exportedImageUrls = ref([]);

// Export the images from specific capture targets
const exportAsImage = (chartNumber) => {
  let captureTarget;

  // Choose the capture target based on the chartNumber (1 for BarChart, 2 for LineChart, 3 for PieChart)
  if (chartNumber === 1) {
    captureTarget = captureTarget1;
  } else if (chartNumber === 2) {
    captureTarget = captureTarget2;
  } else if (chartNumber === 3) {
    captureTarget = captureTarget3;
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

// Fullscreen card logic
// const fullscreenCard = ref(null);
// Handle Escape key to exit fullscreen

// Map string identifiers to components

const showExportMenu = ref(false)

// Toggle the dropdown
function toggleExportMenu() {
  showExportMenu.value = !showExportMenu.value
}

// Optional: Close dropdown if clicked outside
const dropdownRef = ref(null)

// onClickOutside(dropdownRef, () => {
//   showExportMenu.value = false
// })

const minimized = ref(false);
const toggleMinimize = () => {
  minimized.value = !minimized.value;
  console.log(minimized.value);
};

</script>

<template>
  <div v-if="exportedImageUrls.length > 0">
    <!-- Preview Drawer for Exporting images -->
    <div v-if="!minimized"
      class="fixed bottom-0 right-0 z-50 w-96 m-5 rounded bg-white dark:bg-gray-900 p-6 shadow-xl">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Export Preview</h3>
        <div class="flex gap-2">
          <button @click="toggleMinimize" class="text-gray-500 hover:text-gray-700 font-bold">
            —
          </button>
          <button @click="clearAllImages" class="text-red-500 hover:text-red-700 font-bold">
            ✕
          </button>
        </div>
        
      </div>
      <div class="h-30">
        <div class="container flex flex-row space-x-4 overflow-x-auto scrollbar-thin">
          <div v-for="(image, index) in exportedImageUrls" :key="index" class="relative flex-shrink-0">
            <img :src="image" alt="Exported Chart Preview"
              class="cursor-pointer transition-transform duration-300 ease-in-out w-24 h-24 rounded" />
            <button @click="downloadImage(image, index)"
              class="absolute top-0 right-0 text-white p-1 rounded-full text-xs hover:bg-gray-800 transition-all">
              ⬇
            </button>
            <button @click="removeImage(index)"
              class="absolute top-0 left-0 text-red-500 font-bold p-1 rounded-full text-xs hover:text-red-700 hover:font-black transition-all">
              ✕
            </button>
          </div>
        </div>
      </div>
      <!-- Footer Actions -->
      <div class="mt-6 flex gap-4 font-size-12">
        <button @click="downloadAll"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition duration-200 text-sm">
          Download All Images
        </button>

        <button @click="handlePrint" :disabled="!exportedImageUrls.length"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition duration-200 text-sm">
          Save All as PDF
        </button>

        <button @click="clearAllImages"
          class="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition duration-200 text-sm">
          Clear Export
        </button>
      </div>
    </div>
  </div>
  <div v-if="exportedImageUrls.length > 0">
    <div class="fixed end-6 bottom-6 group z-30">
      <button v-if="minimized" @click="toggleMinimize" type="button"
        class="flex items-center justify-center text-white bg-teal-700 rounded-lg w-14 h-14 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 focus:ring-4 focus:ring-teal-300 focus:outline-none dark:focus:ring-teal-800">
        <span class="material-icons">
          output
        </span>
        <span class="sr-only">Open actions menu</span>
      </button>
    </div>
  </div>

  <!-- </div> -->
  <!-- main dashboard page -->
  <div class="min-h-screen p-4">

    <!-- Title -->
    <div class="mt-6 px-2 flex items-center justify-between">
      <h1 class="text-2xl font-bold dark:text-white">Overview</h1>
      <div class="flex items-center space-x-6">
        <monthYearPicker class="flex-1" v-model:selectedMonth="selectedMonth1" v-model:selectedYear="selectedYear1" />
        <DateRangePicker class="max-w-xs" @dateRangeSelected="updateDateRange" />
        <div class="relative" ref="dropdownRef">
          <button @click="toggleExportMenu"
            class="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800">
            Export
          </button>

          <div v-if="showExportMenu" class="absolute right-0 mt-2 z-30 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
          border border-gray-300 dark:border-gray-700 rounded-lg shadow flex flex-col space-y-1 min-w-[140px]">
            <button @click="exportAsImage(1)" class="w-full text-left text-sm flex items-center gap-2 px-3 py-2 rounded-md 
           hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span class="material-icons">show_chart</span>
              Line Chart
            </button>
            <button @click="exportAsImage(2)" class="w-full text-left text-sm flex items-center gap-2 px-3 py-2 rounded-md 
           hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span class="material-icons">bar_chart</span>
              Bar Chart
            </button>
            <button @click="exportAsImage(3)" class="w-full text-left text-sm flex items-center gap-2 px-3 py-2 rounded-md 
           hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span class="material-icons">incomplete_circle</span>
              Pie Chart
            </button>
          </div>
        </div>
      </div>
    </div>

    <main class="mx-auto my-6 max-w-7xl px-4 sm:px-6 lg:px-8">

      <!-- First Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="relative p-4 card">
          <button @click="expandCard('IncidentGrowthRate')" class="expand-btn">⛶</button>
          <!-- <IncidentGrowthRate :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" /> -->
        </div>

        <div class="relative p-4 card">
          <button @click="expandCard('TotalReportsReceived')" class="expand-btn">⛶</button>
          <TotalReportsReceived :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate"
            :endDate="endDate" />
        </div>

        <div class="relative p-4 card">
          <button @click="expandCard('TopPerforming')" class="expand-btn">⛶</button>
          <TopPerforming :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate"
          :endDate="endDate"/>
        </div>
      </div>

      <!-- Second Row -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="relative p-4 card" ref="captureTarget1">
          <button @click="expandCard('LineChart')" class="expand-btn">⛶</button>
          <!-- <LineChart :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate"
            :endDate="endDate" /> -->
        </div>

        <div class="relative p-4 card" ref="captureTarget2">
          <button @click="expandCard('BarChart')" class="expand-btn">⛶</button>
          <!-- <BarChart :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate"
            :endDate="endDate" class="w-full h-full" /> -->
        </div>

        <div class="relative p-4 card text-gray-800 dark:text-white">
          <button @click="expandCard('RecentIncident')" class="expand-btn">⛶</button>
          <!-- <RecentIncident /> -->
        </div>
      </div>

      <!-- Third Row -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-1 gap-6">
        <div class="relative p-4 card" ref="captureTarget3">
          <button @click="expandCard('PieChart')" class="expand-btn">⛶</button>
          <!-- <PieChart :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate"
            :endDate="endDate" /> -->
        </div>
      </div>
    </main>

    <!-- Fullscreen Modal -->
    <transition name="modal-fade">
      <div v-if="fullscreenCard" class="fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 overflow-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
            {{ fullscreenCard }}
          </h2>
          <button @click="closeFullscreen" class="text-2xl close-btn">✕</button>
        </div>

        <component :is="fullscreenCardComponent" :selectedYear="selectedYear1" :selectedMonth="selectedMonth1"
          :startDate="startDate" :endDate="endDate" class="w-full h-[80vh]" />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.card {
  background-color: white;
  border-width: 4px;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 255, 135, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-color: rgba(59, 130, 246, 0.2);
}

.dark .card {
  background-color: black;
  border-color: #1e3a8a;
  box-shadow: inset 0 0 10px rgba(0, 255, 135, 0.3);
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px rgba(34, 197, 94, 0.5);
}

.expand-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
  font-size: 1rem;
  color: #a7a7a7;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.expand-btn:hover {
  color: #ffffff;
}

.close-btn {
  color: white;
  background: none;
  border: none;
  cursor: pointer;
}

.close-btn:hover {
  color: red;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}


/* Tailwind-compatible custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(100, 116, 139, 0.6);
  border-radius: 3px;
}
</style>