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



const options = ref({
    colors: ["#4A90E2", "#E24A4A", "#4AE24A", "#E2E24A"], // Blue, Red, Green, Yellow
    series: [],
    chart: {
        type: "bar",  // Bar chart type
        height: "100%",
        fontFamily: "Inter, sans-serif",
        toolbar: {
            show: true,
            tools: {
                download: true,
            },
        },
        foreColor: '#ffffff', // Default text color to white for visibility
        zoom: {
            enabled: true, // Enable zoom
            type: 'xy', // You can zoom both horizontally and vertically
            zoomedArea: {
                fill: {
                    color: '#90CAF9', // Light blue fill color for zoomed area
                    opacity: 0.4,     // Set the opacity of the zoomed area
                },
                stroke: {
                    color: '#42A5F5', // Outline color for zoomed area
                    width: 2,         // Outline width
                },
            },
        },
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: "55%", // Adjust bar width
            endingShape: "rounded",
        }
    },
    tooltip: {
        shared: true,
        intersect: false,
        followCursor: true,
        theme: 'dark',  // Dark tooltip for better contrast
        style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
        },
        y: {
            formatter: function (value) {
                return `${value} Reports`; // Adding "Reports" to tooltip values
            },
        },
    },
    grid: {
        show: true,
        strokeDashArray: 4,
        borderColor: '#e0e0e0',  // Light grid border color for clarity
    },
    dataLabels: {
        enabled: false,
    },
    legend: {
        show: true,
        position: 'top', // Place the legend at the top for better visibility
        horizontalAlign: 'center',  // Center-aligned legend
        labels: {
            colors: '#ffffff', // White text for the legend
        },
    },
    xaxis: {
        categories: [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ],
        labels: {
            show: true,
            style: {
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",  // Increased font size for better readability
                fontWeight: 'bold', // Bold labels for clarity
                colors: '#ffffff', // White color for x-axis labels
            }
        },
        axisBorder: {
            show: true,
            color: '#e0e0e0',  // Light border color
        },
        axisTicks: {
            show: true,
            color: '#e0e0e0',  // Light color for axis ticks
        },
    },
    yaxis: {
        title: {
            text: "Number of Reports",
            style: {
                fontSize: '14px', // Increased font size for the y-axis title
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold', // Bold y-axis title
                color: '#ffffff',  // White title color
            }
        },
        labels: {
            style: {
                fontSize: "12px",  // Increased font size for better readability
                fontFamily: "Inter, sans-serif",
                fontWeight: 'bold', // Bold y-axis labels
                colors: '#ffffff', // White color for y-axis labels
            }
        }
    },
    fill: {
        opacity: 1,  // Full opacity for bars
    },
    markers: {
        size: 6,  // Larger markers for bar chart data points
        colors: ['#4A90E2', '#E24A4A', '#4AE24A', '#E2E24A'],  // Same colors as the bars
        strokeColor: '#fff',  // White stroke for better visibility
        strokeWidth: 2,  // Thicker stroke for markers
    },
});

const props = defineProps({
  selectedYear: Number,
  selectedMonth: Number,
  startDate: String,  // Assuming the date is a string (format YYYY-MM-DD)
  endDate: String
});

const barChart = ref(null);
let chart = null;

const updateChart = () => {
    if (!source.value.length || !report.value.length) {
        console.log("No data to update the chart.");
        return;
    }

    const sourceNames = source.value.map(src => src.sources);
    const seriesData = sourceNames.map(() => Array(12).fill(0)); // 12 months

    let filteredReports = report.value;

    // Step 1: Apply date range filter first (if startDate and endDate are provided)
    if (props.startDate || props.endDate) {
        filteredReports = filteredReports.filter(rep => {
            const reportDate = new Date(rep.date_received);

            // Filter by startDate if provided
            if (props.startDate && reportDate < new Date(props.startDate)) return false;
            // Filter by endDate if provided
            if (props.endDate && reportDate > new Date(props.endDate)) return false;

            return true;
        });
    } else {
        // Step 2: If no date range is provided, apply year and month filters
        filteredReports = filteredReports.filter(rep => {
            const reportDate = new Date(rep.date_received);
            const reportYear = reportDate.getFullYear();
            const reportMonth = reportDate.getMonth() + 1;

            if (props.selectedYear && reportYear !== props.selectedYear) return false;
            if (props.selectedMonth && reportMonth !== props.selectedMonth) return false;

            return true;
        });
    }

    // Step 3: Populate series data
    filteredReports.forEach(rep => {
        const sourceIndex = source.value.findIndex(src => src.id === rep.source_id);
        if (sourceIndex === -1) return;

        const reportMonthIndex = new Date(rep.date_received).getMonth(); // 0-based
        seriesData[sourceIndex][reportMonthIndex]++;
    });

    // Step 4: Determine which months have data
    const monthPresence = Array(12).fill(false);
    seriesData.forEach(sourceArr => {
        sourceArr.forEach((count, idx) => {
            if (count > 0) monthPresence[idx] = true;
        });
    });

    const monthLabels = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const filteredMonthLabels = monthLabels.filter((_, idx) => monthPresence[idx]);

    const trimmedSeries = seriesData.map((data, idx) => ({
        name: sourceNames[idx],
        data: data.filter((_, i) => monthPresence[i]) // Only include active months
    }));

    console.log("✅ Final Chart Series:", trimmedSeries);
    console.log("📅 Filtered Month Labels:", filteredMonthLabels);

    // Step 5: Update chart
    options.value.series = trimmedSeries;
    options.value.xaxis.categories = filteredMonthLabels;

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


watch([() => props.selectedYear, () => props.selectedMonth, () => props.startDate, () => props.endDate], () => {
    console.log("🔄 Props changed: Running updateChart()");

    // Re-run updateChart when any of the props change
    updateChart();
});

onUnmounted(() => {
    if (chart) chart.destroy();
});
</script>

<template>
  <div class="w-full h-full p-4 dark:text-white text-gray-800">   
    <div class="flex justify-between items-center mb-4">
      <h2 v-if="!startDate && !endDate" class="text-xl font-semibold">Report per source in {{ selectedMonth }}/{{ selectedYear }}</h2>
      <h2 v-else class="text-xl font-semibold">Report per source from {{ startDate }} to {{ endDate }}</h2>
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
