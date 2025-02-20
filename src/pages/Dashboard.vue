<script setup>
import { ref, computed, onMounted } from "vue";
import axiosClient from "../axios.js";
import router from "../router.js";
import { useThemeStore } from '../stores/themeStore';
// import PieChart from "../components/charts/PieChart.vue";
// import LineChart from "../components/charts/LineChart.vue";
// import BarChart from "../components/charts/BarChart.vue";
const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-800 border-black text-white" : "bg-sky-50 border-gray-200 text-sky-900"
})

//piechart
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
    const piechart = new ApexCharts(document.getElementById("pie-chart"), getPieChartOptions());
    piechart.render();
  }
});

//linechart
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

//barchart

const barOptions = {
  colors: ["#1A56DB", "#FDBA8C"],
  series: [
    {
      name: "Organic",
      color: "#1A56DB",
      data: [
        { x: "Mon", y: 231 },
        { x: "Tue", y: 122 },
        { x: "Wed", y: 63 },
        { x: "Thu", y: 421 },
        { x: "Fri", y: 122 },
        { x: "Sat", y: 323 },
        { x: "Sun", y: 111 },
      ],
    },
    {
      name: "Social media",
      color: "#FDBA8C",
      data: [
        { x: "Mon", y: 232 },
        { x: "Tue", y: 113 },
        { x: "Wed", y: 341 },
        { x: "Thu", y: 224 },
        { x: "Fri", y: 522 },
        { x: "Sat", y: 411 },
        { x: "Sun", y: 243 },
      ],
    },
  ],
  chart: {
    type: "bar",
    height: "320px",
    fontFamily: "Inter, sans-serif",
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "70%",
      borderRadiusApplication: "end",
      borderRadius: 8,
    },
  },
  tooltip: {
    shared: true,
    intersect: false,
    style: {
      fontFamily: "Inter, sans-serif",
    },
  },
  states: {
    hover: {
      filter: {
        type: "darken",
        value: 1,
      },
    },
  },
  stroke: {
    show: true,
    width: 0,
    colors: ["transparent"],
  },
  grid: {
    show: false,
    strokeDashArray: 4,
    padding: {
      left: 2,
      right: 2,
      top: -14
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  xaxis: {
    floating: false,
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
  fill: {
    opacity: 1,
  },
}


onMounted(() => {
  if(document.getElementById("column-chart") && typeof ApexCharts !== 'undefined') {
    const barchart = new ApexCharts(document.getElementById("column-chart"), barOptions);
    barchart.render();
  }
});


</script>

<template>
  <div class="min-h-screen">


    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-3 gap-6">
        <div class="col-span-1 p-6 rounded-lg shadow" :class="themeClasses">
          <div class="flex justify-between items-center mb-4" >
            <h2 class="text-xl font-semibold" :class="themeClasses">Distribution of Incidents</h2>
            <button class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
              Date Filter
            </button>
          </div>
          <div id="pie-chart" class="h-64"></div>
        </div>
        
        <div class="col-span-1 p-6 rounded-lg shadow" :class="themeClasses">
          <h2 class="text-xl font-semibold mb-4" :class="themeClasses">Recent Activities</h2>
          <!-- Add content for key metrics -->
        </div>
        
        <div class="col-span-1 p-6 rounded-lg shadow" :class="themeClasses">
          <h2 class="text-xl font-semibold mb-4" :class="themeClasses">Growth Rate of Incidents </h2>
          <!-- Add content for recent activities -->
           <h2>two buttons for date comparison</h2>
          <div class="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500 dark:text-green-500 text-center">
            23%
            <svg class="w-3 h-3 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="mt-6 grid grid-cols-2 gap-6">
        <!-- linechart -->
        <div class="p-6 rounded-lg shadow" :class="themeClasses">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold" :class="themeClasses">Crime Statistics</h2>
              <button class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                Date Filter
              </button>
            </div>
          <div id="line-chart" class="h-full"></div>
        </div>
      
      
          <div class="p-6 rounded-lg shadow" :class="themeClasses">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold" :class="themeClasses">Number of Incidents</h2>
                <!-- <button class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  Date Filter
                </button> -->
              </div>
              <div id="column-chart"></div>
          </div>
      </div>
    </main>
  </div>
</template>

<style scoped>

</style>