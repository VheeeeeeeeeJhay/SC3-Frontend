<script setup>
import { ref, computed, onMounted } from "vue";
import axiosClient from "../axios.js";
import router from "../router.js";
import { useThemeStore } from '../stores/themeStore';
// import PieChart from "../components/charts/PieChart.vue";
// import LineChart from "../components/charts/LineChart.vue";
// import BarChart from "../components/charts/BarChart.vue";
const theme = ref(localStorage.getItem("theme") || "light");
const themeStore = useThemeStore();
const themeClasses = computed(() => 
    theme.value === "dark" ? "bg-slate-600 border-black text-white" : "bg-white border-gray-200 text-gray-900"
);

const getPieChartOptions = () => ({
  series: [52.8, 26.8, 20.4],
  colors: ["#1C64F2", "#16BDCA", "#9061F9"],
  chart: {
    height: '100%',
    width: '100%',
    type: "pie",
  },
  stroke: {
    colors: ["white"],
    lineCap: "",
  },
  plotOptions: {
    pie: {
      labels: { show: true },
      size: "100%",
      dataLabels: { offset: -25 }
    },
  },
  labels: ["Direct", "Organic search", "Referrals"],
  dataLabels: {
    enabled: true,
    style: { fontFamily: "Inter, sans-serif" },
  },
  legend: {
    position: "bottom",
    fontFamily: "Inter, sans-serif",
  },
  yaxis: {
    labels: {
      formatter: (value) => `${value}%`,
    },
  },
  xaxis: {
    labels: {
      formatter: (value) => `${value}%`,
    },
    axisTicks: { show: false },
    axisBorder: { show: false },
  },
});

onMounted(() => {
  if (document.getElementById("pie-chart") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("pie-chart"), getPieChartOptions());
    chart.render();
  }
});

const options = {
  chart: {
    height: "100%",
    maxWidth: "100%",
    type: "line",
    fontFamily: "Inter, sans-serif",
    dropShadow: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    enabled: true,
    x: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 6,
  },
  grid: {
    show: true,
    strokeDashArray: 4,
    padding: {
      left: 2,
      right: 2,
      top: -26
    },
  },
  series: [
    {
      name: "Clicks",
      data: [6500, 6418, 6456, 6526, 6356, 6456],
      color: "#1A56DB",
    },
    {
      name: "CPC",
      data: [6456, 6356, 6526, 6332, 6418, 6500],
      color: "#7E3AF2",
    },
  ],
  legend: {
    show: false
  },
  stroke: {
    curve: 'smooth'
  },
  xaxis: {
    categories: ['01 Feb', '02 Feb', '03 Feb', '04 Feb', '05 Feb', '06 Feb', '07 Feb'],
    labels: {
      show: true,
      style: {
        fontFamily: "Inter, sans-serif",
        cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: false,
  },
}

onMounted(() => {
if (document.getElementById("line-chart") && typeof ApexCharts !== 'undefined') {
  const chart = new ApexCharts(document.getElementById("line-chart"), options);
  chart.render();
}
});



</script>

<template>
  <div :class="themeClasses" class="min-h-screen">


    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-3 gap-6">
        <div class="col-span-1 bg-white p-6 rounded-lg shadow dark:bg-gray-800" :class="themeClasses">
          <div class="flex justify-between items-center mb-4" >
            <h2 class="text-xl font-semibold" >Distribution of Incidents</h2>
            <button class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
              Date Filter
            </button>
          </div>
          <div id="pie-chart" class="h-64"></div>
        </div>
        
        <div class="col-span-1 bg-white p-6 rounded-lg shadow dark:bg-gray-800">
          <h2 class="text-xl font-semibold mb-4" :class="themeClasses">Recent Activities</h2>
          <!-- Add content for key metrics -->
        </div>
        
        <div class="col-span-1 bg-white p-6 rounded-lg shadow dark:bg-gray-800 h-32">
          <h2 class="text-xl font-semibold mb-4" :class="themeClasses">Growth Rate of Incidents </h2>
          <!-- Add content for recent activities -->
        </div>
      </div>
      
      <div class="mt-6 grid grid-cols-2 gap-6">
        <!-- linechart -->
        <div class="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold" :class="themeClasses">Crime Statistics</h2>
              <button class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                Date Filter
              </button>
            </div>
          <div id="line-chart" class="h-full"></div>
        </div>
      
      
          <div class="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold" :class="textClass">Number of Incidents</h2>
                <!-- <button class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  Date Filter
                </button> -->
              </div>
            <!-- <div id="line-chart" class="h-96"></div> -->
          </div>
      </div>
    </main>
  </div>
</template>

<style scoped>

</style>