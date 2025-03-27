<script setup>
import { ref, onMounted, onUnmounted, watch} from "vue";
import axiosClient from "../../axios.js";
import ApexCharts from 'apexcharts';

const source = ref([]);
const report = ref([]);

onMounted(() => {
  axiosClient.get('/api/911/dashboard', {
    headers: {
      'x-api-key': import.meta.env.VITE_API_KEY
    }
  })
    .then((res) => {
      console.log(res, 'bar chart');
      source.value = res.data.source;
      report.value = res.data.report;
      console.log(source.value, 'sources data')

      updateChart(); // Update the chart after fetching data
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    //   errorMessage.value = 'Failed to load data. Please try again later.';
    });
});

const options = ref({
    colors: ["#bf1029", "#3f8f29", "#4A90E2", "#50E3C2", "#B8E986", "#F5A623"],
    series: [],
    chart: {
        type: "bar",
        height: "100%",
        fontFamily: "Inter, sans-serif",
        toolbar: {
            show: true,
            tools: {
                download: true,
            },
        },
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: "70%",
            borderRadiusApplication: "end",
            borderRadius: 8,
            distributed: true,
        },
    },
    tooltip: {
        shared: true,
        intersect: false,
        followCursor: true,
        style: {
            fontFamily: "Inter, sans-serif",
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
        show: true,
    },
    xaxis: {
        floating: false,
        categories: [],
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
});

const barChart = ref(null);
let chart = null;

const updateChart = () => {
    if (!source.value.length || !report.value.length) {
        console.log("No data to update the chart.");
        return;
    }

    // Extract unique source names
    const sourceNames = source.value.map(src => src.sources); // Ensure 'sources' is correct

    // Count the number of reports per source
    const reportCounts = source.value.map(src => {
        return report.value.filter(rep => rep.source_id === src.id).length;
    });

    console.log("Source Names:", sourceNames);
    console.log("Report Counts:", reportCounts);

    // Update chart data (ONE series with multiple data points)
    options.value.series = [{
        name: "Number of Reports",
        data: reportCounts
    }];

    // Assign source names to X-axis
    options.value.xaxis.categories = sourceNames;

    if (chart) {
        chart.updateOptions(options.value);
    } else {
        renderChart();
    }
};



onMounted(() => {
    if (barChart.value) {
        chart = new ApexCharts(barChart.value, options.value);
        chart.render();
        updateChart();
    }
});
onUnmounted(() => {
    if (chart) chart.destroy();
});
</script>

<template>
  <div class="w-full p-4 dark:bg-slate-800 dark:border-black dark:text-white bg-sky-50 border-gray-200 text-gray-800">   
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Report per source SAUCED</h2>
      <!-- <select v-model="selectedDateFilter" class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
        <option value="" disabled>Select Date Range</option>
        <option v-for="filter in dateFilters" :key="filter.value" :value="filter.value">
          {{ filter.name }}
        </option>
      </select> -->
    </div>
    <!-- BAR CHART -->
    <div class="dark:text-gray-800 h-64" ref="barChart"></div>
  </div>
</template>
