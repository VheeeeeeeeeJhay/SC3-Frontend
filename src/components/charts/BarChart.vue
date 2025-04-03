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
    //   console.log(res, 'bar chart');
      source.value = res.data.source;
      report.value = res.data.report;
    //   console.log(source.value, 'sources data')

      updateChart(); // Update the chart after fetching data
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    //   errorMessage.value = 'Failed to load data. Please try again later.';
    });
});

const props = defineProps({
  selectedYear: Number
});

const options = ref({
    colors: ["#bf1029", "#3f8f29", "#4A90E2", "#50E3C2"], // Different colors for each source
    series: [],
    chart: {
        type: "line",
        height: "100%",
        fontFamily: "Inter, sans-serif",
        toolbar: {
            show: true,
            tools: {
                download: true,
            },
        },
    },
    stroke: {
        show: true,
        width: 2,  
    },
    markers: {
        size: 5,  
        strokeColors: "#fff",
        strokeWidth: 2,
    },
    tooltip: {
        shared: true,
        intersect: false,
        followCursor: true,
    },
    grid: {
        show: true,
        strokeDashArray: 4,
    },
    dataLabels: {
        enabled: false,
    },
    legend: {
        show: true,
        position: "top",
        markers: {
            width: 12,
            height: 12,
        },
        onItemClick: {
            toggleDataSeries: true,
        },
    },
    xaxis: {
        categories: [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ],
        labels: {
            style: {
                fontFamily: "Inter, sans-serif",
            }
        },
    },
    yaxis: {
        show: true,
    },
    fill: {
        opacity: 1,
    },
});

const barChart = ref(null);
let chart = null;

const updateChart = () => {
    console.log("🔍 Debugging Chart Update...");
    console.log("📌 Source Data:", source.value);
    console.log("📌 Report Data:", report.value);

    if (!source.value.length) {
        console.error("❌ ERROR: `source.value` is empty!");
    }
    if (!report.value.length) {
        console.error("❌ ERROR: `report.value` is empty!");
    }
    if (!source.value.length || !report.value.length) {
        console.log("No data to update the chart.");
        return;
    }

    // Extract unique sources (911, CDRRMO, etc.)
    const sourceNames = [...new Set(source.value.map(src => src.sources))];
    console.log("📌 Unique Source Names:", sourceNames);

    // Prepare series data
    const seriesData = sourceNames.map(sourceName => {
        return {
            name: sourceName,
            data: Array(12).fill(0) // Initialize 12 months with 0 reports
        };
    });
// Filter reports based on the selected year
const filteredReports = report.value.filter(rep => {
    const reportYear = new Date(rep.date_received).getFullYear();
    return reportYear === props.selectedYear;
});

console.log(`📅 Filtering reports for year: ${props.selectedYear}`);
console.log("🔍 Filtered Reports:", filteredReports);

// Populate data by month (only for the selected year)
filteredReports.forEach(rep => {
    const matchedSource = source.value.find(src => src.id === rep.source_id);
    if (!matchedSource) {
        console.warn(`⚠️ Report has unknown source_id: ${rep.source_id}`);
        return; // Skip this report
    }

    const sourceIndex = sourceNames.indexOf(matchedSource.sources);
    const monthIndex = new Date(rep.date_received).getMonth();

    console.log(`📅 Report Date: ${rep.date_received} | Month Index: ${monthIndex} | Source: ${matchedSource.sources}`);

    if (sourceIndex !== -1 && monthIndex >= 0 && monthIndex < 12) {
        seriesData[sourceIndex].data[monthIndex]++;
        console.log(`✅ Incremented ${matchedSource.sources} count for month ${monthIndex + 1}`);
    }
});



    console.log("📊 Final Series Data:", JSON.stringify(seriesData, null, 2));

    options.value.series = seriesData;

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
        // updateChart();
    }
});

watch([source, report], ([newSource, newReport]) => {
    if (newSource.length && newReport.length) {
        console.log("🔄 Data updated! Running updateChart()");
        updateChart();
    }
});

watch(() => props.selectedYear, (newYear, oldYear) => {
    console.log(`🔄 Year changed: ${oldYear} ➝ ${newYear}`);
    
    if (newYear) {
        updateChart(); // Re-run updateChart when the year changes
    }
});

onUnmounted(() => {
    if (chart) chart.destroy();
});
</script>

<template>
  <div class="w-full p-4 dark:text-white text-gray-800">   
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
