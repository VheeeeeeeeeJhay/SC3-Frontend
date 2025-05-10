<script setup>
import { ref, computed, onMounted } from "vue";
import PieChart from "../components/charts/PieChart.vue";
import LineChart from "../components/charts/LineChart.vue";
import BarChart from "../components/charts/BarChart.vue";
import IncidentGrowthRate from "../components/widgets/IncidentGrowthRate.vue";
import RecentIncident from "../components/widgets/RecentIncident.vue";
import TotalReportsReceived from "../components/widgets/TotalReportsReceived.vue";
import TopPerforming from "../components/widgets/TopPerforming.vue";
import DateRangePicker from "../components/DateRangePicker.vue";
import monthYearPicker from "../components/monthYearPicker.vue";
// import UnifiedDatePicker from "../components/datePickers/UnifiedDatePicker.vue";
import StackedBarChart from "../components/charts/StackedBarChart.vue";
import Heatmap from "../components/charts/Heatmap.vue";
import domtoimage from 'dom-to-image';

//for filters
const currentYear = new Date().getFullYear();
const selectedYear1 = ref(currentYear);
const selectedMonth1 = ref(new Date().getMonth() + 1); // JS months are 0-based
const startDate = ref(localStorage.getItem('dashboardStartDate') || null);
const endDate = ref(localStorage.getItem('dashboardEndDate') || null);

const updateDateRange = ({ start, end }) => {
  startDate.value = start;
  endDate.value = end;
  localStorage.setItem('dashboardStartDate', start);
  localStorage.setItem('dashboardEndDate', end);
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



// Refs for capture targets
const captureTarget1 = ref(null);
const captureTarget2 = ref(null);
const captureTarget3 = ref(null);
const captureTarget4 = ref(null);

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
  } else if (chartNumber === 4) {
    captureTarget = captureTarget4;
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
    <!-- Export Drawer -->
    <div v-if="!minimized"
      class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-full max-w-md sm:max-w-lg md:max-w-xl rounded-2xl bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Export Preview</h3>
        <div class="flex gap-2">
          <button @click="toggleMinimize" class="text-gray-500 hover:text-gray-700 dark:hover:text-white transition">—</button>
          <button @click="clearAllImages" class="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition">✕</button>
        </div>
      </div>

      <div class="flex flex-wrap gap-4 overflow-y-auto max-h-48 sm:max-h-none">
        <div v-for="(image, index) in exportedImageUrls" :key="index" class="relative w-24 h-24">
          <img :src="image" alt="Exported Chart" class="w-full h-full object-cover rounded-lg border" />
          <button @click="downloadImage(image, index)"
            class="absolute top-1 right-1 text-white text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded-full">⬇</button>
          <button @click="removeImage(index)"
            class="absolute top-1 left-1 text-red-500 hover:text-red-700 text-xs p-1 rounded-full">✕</button>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button @click="downloadAll"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 text-sm shadow">Download All</button>
        <button @click="handlePrint" :disabled="!exportedImageUrls.length"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-sm shadow">Save as PDF</button>
        <button @click="clearAllImages"
          class="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-2 text-sm shadow">Clear</button>
      </div>
    </div>

    <!-- Reopen Button -->
    <div class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      <button v-if="minimized" @click="toggleMinimize"
        class="w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 flex items-center justify-center text-white shadow-lg">
        <span class="material-icons">output</span>
      </button>
    </div>
  </div>

  <!-- Main Dashboard -->
  <div
    class="min-h-screen px-4 sm:px-8 md:px-12 pt-6 pb-10 transition-colors">

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>

      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        <DateRangePicker class="w-full sm:max-w-xs" @dateRangeSelected="updateDateRange" />

        <div class="relative w-full sm:w-auto">
          <button @click="toggleExportMenu"
            class="w-full sm:w-auto bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition">
            Export
          </button>

          <div v-if="showExportMenu"
            class="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-40">
            <button @click="exportAsImage(1)"
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2">
              <span class="material-icons">show_chart</span> Stacked Bar Graph
            </button>
            <button @click="exportAsImage(2)"
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2">
              <span class="material-icons">bar_chart</span> Bar Chart
            </button>
            <button @click="exportAsImage(3)"
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2">
              <span class="material-icons">incomplete_circle</span> Pie Chart
            </button>
            <button @click="exportAsImage(4)"
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2">
              <span class="material-icons">apps</span> Heatmap Chart
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards -->
    <main class="grid gap-6 mt-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <div class="card relative z-10">
        <button @click="expandCard('IncidentGrowthRate')" class="expand-btn">⛶</button>
        <IncidentGrowthRate />
      </div>

      <div class="card relative z-1">
        <button @click="expandCard('TotalReportsReceived')" class="expand-btn">⛶</button>
        <TotalReportsReceived :startDate="startDate" :endDate="endDate" />
      </div>

      <div class="card relative z-10">
        <button @click="expandCard('TopPerforming')" class="expand-btn">⛶</button>
        <TopPerforming :startDate="startDate" :endDate="endDate" />
      </div>

      <div class="card relative" ref="captureTarget1">
        <StackedBarChart :startDate="startDate" :endDate="endDate" />
      </div>

      <div class="card relative" ref="captureTarget2">
        <button @click="expandCard('BarChart')" class="expand-btn">⛶</button>
        <BarChart :startDate="startDate" :endDate="endDate" />
      </div>

      <div class="card relative">
        <button @click="expandCard('RecentIncident')" class="expand-btn">⛶</button>
        <RecentIncident />
      </div>

      <!-- Grid for PieChart and Heatmap -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 col-span-full">
        <div class="card relative" ref="captureTarget3">
          <button @click="expandCard('PieChart')" class="expand-btn">⛶</button>
          <PieChart :startDate="startDate" :endDate="endDate" />
        </div>

        <div class="card relative" ref="captureTarget4">
          <button @click="expandCard('Heatmap')" class="expand-btn">⛶</button>
          <Heatmap :startDate="startDate" :endDate="endDate" />
        </div>
      </div>
    </main>

    <!-- Fullscreen Modal -->
    <transition name="modal-fade">
      <div v-if="fullscreenCard" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] p-4 sm:p-6 overflow-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold dark:text-white">{{ fullscreenCard }}</h2>
            <button @click="closeFullscreen" class="text-xl dark:text-white hover:text-red-600">✕</button>
          </div>
          <component :is="fullscreenCardComponent" :selectedYear="selectedYear1"
            :selectedMonth="selectedMonth1" :startDate="startDate" :endDate="endDate" class="w-full h-[60vh]" />
        </div>
      </div>
    </transition>
  </div>
</template>


<style scoped>
/* Updated Light Mode Gradient */
/* Updated Light Mode Gradient */
/* .bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, #e2e8f0, #f8fafc);
}
.dark .bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, #0f172a, #1e293b);
} */


.card {
  background: rgba(255, 255, 255, 0.1); /* Light transparent layer */
  border-radius: 1.5rem;
  padding: 1.25rem;
  backdrop-filter: blur(16px); /* Frosted glass effect */
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1); /* Subtle border */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dark .card {
  background: rgba(30, 41, 59, 0.3); /* Transparent dark layer */
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card:hover {
  transform: scale(1.015);
  box-shadow: 0 12px 28px rgba(34, 211, 238, 0.3);
}



.expand-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 1rem;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
}

.expand-btn:hover {
  color: #22d3ee;
}

.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(100, 116, 139, 0.6);
  border-radius: 4px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
