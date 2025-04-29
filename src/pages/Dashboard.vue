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
import TestMail from "../mail/TestMail.vue";
import UnifiedDatePicker from "../components/datePickers/UnifiedDatePicker.vue";
import StackedBarChart from "../components/charts/StackedBarChart.vue";
import Heatmap from "../components/charts/Heatmap.vue";
import domtoimage from 'dom-to-image';

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




import draggable from 'vuedraggable'
const cardOrder = ref([
  {
    key: 'IncidentGrowthRate',
    component: IncidentGrowthRate,
    props: {}
  },
  {
    key: 'TotalReportsReceived',
    component: TotalReportsReceived,
    props: { startDate, endDate }
  },
  {
    key: 'TopPerforming',
    component: TopPerforming,
    props: { startDate, endDate }
  },
  {
    key: 'StackedBarChart',
    component: StackedBarChart,
    props: { startDate, endDate }
  },
  {
    key: 'BarChart',
    component: BarChart,
    props: { startDate, endDate }
  },
  {
    key: 'RecentIncident',
    component: RecentIncident,
    props: {}
  },
  // {
  //   key: 'PieChart',
  //   component: PieChart,
  //   props: { startDate, endDate }
  // },
  // {
  //   key: 'Heatmap',
  //   component: Heatmap,
  //   props: { startDate, endDate }
  // }
])

// function expandCard(key) {
//   console.log('Expanding', key)
// }
</script>

<template>
  <div v-if="exportedImageUrls.length > 0">
    <!-- Export Drawer -->
    <div v-if="!minimized"
      class="fixed bottom-6 right-6 z-50 w-[26rem] rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Export Preview</h3>
        <div class="flex gap-2">
          <button @click="toggleMinimize" class="text-gray-500 hover:text-gray-700 dark:hover:text-white transition">
            —
          </button>
          <button @click="clearAllImages" class="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition">
            ✕
          </button>
        </div>
      </div>

      <div class="flex space-x-4 overflow-x-auto scrollbar-thin">
        <div v-for="(image, index) in exportedImageUrls" :key="index" class="relative flex-shrink-0">
          <img :src="image" alt="Exported Chart" class="w-24 h-24 object-cover rounded-lg border" />
          <button @click="downloadImage(image, index)"
            class="absolute top-1 right-1 text-white text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded-full">
            ⬇
          </button>
          <button @click="removeImage(index)"
            class="absolute top-1 left-1 text-red-500 hover:text-red-700 text-xs p-1 rounded-full">
            ✕
          </button>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button @click="downloadAll"
          class="bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 text-sm shadow">Download All</button>
        <button @click="handlePrint" :disabled="!exportedImageUrls.length"
          class="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-sm shadow">Save as PDF</button>
        <button @click="clearAllImages"
          class="bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-2 text-sm shadow">Clear</button>
      </div>
    </div>

    <!-- Reopen Button -->
    <div class="fixed bottom-6 right-6 z-40">
      <button v-if="minimized" @click="toggleMinimize"
        class="w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 flex items-center justify-center text-white shadow-lg">
        <span class="material-icons">output</span>
      </button>
    </div>
  </div>

  <!-- Main Dashboard -->
  <div class="min-h-screen px-12 pt-6 pb-10 bg-gradient-to-br from-white via-[#f4f4f9] to-[#000000] dark:bg-gradient-to-br dark:from-black dark:via-[#004D4F] dark:to-black text-black dark:text-white shadow-[rgba(0,0,255,0.3)_0px_15px_25px,_rgba(255,0,0,0.22)_0px_10px_10px] transition-colors">

    <div class="flex justify-between items-center px-2">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>

      <div class="flex items-center gap-4">
        <DateRangePicker class="max-w-xs" @dateRangeSelected="updateDateRange" />

        <div class="relative">
          <button @click="toggleExportMenu"
            class="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition">
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
    <!-- <main class="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
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
        <button @click="expandCard('LineChart')" class="expand-btn">⛶</button>
        <LineChart :startDate="startDate" :endDate="endDate" />
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

      <div class="card relative col-span-full" ref="captureTarget3">
        <button @click="expandCard('PieChart')" class="expand-btn">⛶</button>
        <PieChart :startDate="startDate" :endDate="endDate" />
      </div>

      <div class="card relative col-span-full" ref="captureTarget3">
        <button @click="expandCard('PieChart')" class="expand-btn">⛶</button>
        <Sankey :startDate="startDate" :endDate="endDate" />
      </div>
    </main> -->
    <main class="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Existing cards remain the same -->
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
        <!-- <button @click="expandCard('LineChart')" class="expand-btn">⛶</button>
        <LineChart :startDate="startDate" :endDate="endDate" /> -->
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

      <!-- New grid layout for PieChart and Sankey -->
      <div class="grid grid-cols-2 gap-6 col-span-full">
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

    <main class="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
  <draggable
    v-model="cardOrder"
    item-key="key"
    class="contents"
    :animation="200"
    handle=".drag-handle"
  >
    <template #item="{ element }">
      <div class="card relative z-10">
        <button @click="expandCard(element.key)" class="expand-btn drag-handle">⛶</button>
        <component :is="element.component" v-bind="element.props" />
      </div>
    </template>
  </draggable>
</main>

<!-- Separate grid for PieChart and Heatmap -->
<div class="grid grid-cols-2 gap-6 col-span-full">
  <draggable
    v-model="cardOrder"
    item-key="key"
    class="contents"
    :animation="200"
    handle=".drag-handle"
    :list="cardOrder.filter(card => ['PieChart', 'Heatmap'].includes(card.key))"
  >
    <template #item="{ element }">
      <div class="card relative z-10">
        <button @click="expandCard(element.key)" class="expand-btn drag-handle">⛶</button>
        <component :is="element.component" v-bind="element.props" />
      </div>
    </template>
  </draggable>
</div>

    <!-- Fullscreen Modal -->
    <transition name="modal-fade">
      <div v-if="fullscreenCard"
        class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] p-6 overflow-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold dark:text-white">{{ fullscreenCard }}</h2>
            <button @click="closeFullscreen" class="text-xl dark:text-white hover:text-red-600">✕</button>
          </div>
          <component :is="fullscreenCardComponent" :selectedYear="selectedYear1"
            :selectedMonth="selectedMonth1" :startDate="startDate" :endDate="endDate"
            class="w-full h-[60vh]" />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.dark .card {
  background-color: #1f2937;
  border-color: #374151;
}

.card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
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
