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
    colors: ["#4A90E2", "#50C878", "#FF6B6B", "#FFD700"], // Blue, Emerald, Coral, Gold
    series: [],
    chart: {
        type: "line",  // Changed to line chart
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
        curve: "smooth",  // Smooth curve for the line chart
        width: 4,  // Thicker line for better visibility
    },
    tooltip: {
        shared: true,
        intersect: false,
        followCursor: true,
        theme: 'dark',  // Dark theme for the tooltip
        style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
        },
        y: {
            formatter: function (value) {
                return `${value} Reports`; // Adding "Reports" to the tooltip value
            },
        },
    },
    grid: {
        show: true,
        strokeDashArray: 4,
        borderColor: '#e0e0e0',  // Light color for the grid lines to reduce distraction
        // row: {
        //     colors: ['#f3f3f3', 'transparent'],  // Alternate row colors to improve readability
        //     opacity: 0.3,
        // },
    },
    dataLabels: {
        enabled: false,
    },
    legend: {
        show: true,
        position: 'top', // Move legend to the top for better visibility
        horizontalAlign: 'center',  // Center align the legend
        labels: {
            useSeriesColors: true, // Color the legend items based on their series color
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
                fontWeight: 'bold', // Make the labels bold
                // cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400',
                colors: '#ffffff',
            },
        },
        axisBorder: {
            show: true,
            color: '#e0e0e0',  // Light border color for better contrast
        },
        axisTicks: {
            show: true,
            color: '#e0e0e0',  // Light tick color for contrast
        },
    },
    yaxis: {
        title: {
            text: "Number of Reports",
            style: {
                fontSize: '14px', // Increased font size for the Y axis title
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold', // Bold Y-axis title
                color: '#ffffff',  // Dark color for title
            },
        },
        labels: {
            style: {
                fontSize: "12px",  // Increased font size for Y-axis labels
                fontFamily: "Inter, sans-serif",
                fontWeight: 'bold', // Bold labels for clarity
                // cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400',
                colors: '#ffffff',
            },
        },
    },
    fill: {
        opacity: 0.5,  // Adjust opacity for line chart fill
    },
    markers: {
        size: 6,  // Slightly larger markers for better visibility
        colors: ['#4A90E2', '#50C878', '#FF6B6B', '#FFD700'],  // Same color as the lines
        strokeColor: '#fff',  // White stroke for better contrast
        strokeWidth: 2,  // Thicker stroke for markers
    },
});


const lineChart = ref(null);
let chart = null;

const props = defineProps({
  selectedYear: Number,
  selectedMonth: Number,
  startDate: String,  // Assuming the date is a string (format YYYY-MM-DD)
  endDate: String
});

const updateChart = () => {
    if (!source.value.length || !report.value.length) {
        console.log("No data to update the chart.");
        return;
    }

    let filteredReports = report.value;

    // Step 1: Apply date range filter first (if startDate and endDate are provided)
    if (props.startDate || props.endDate) {
        filteredReports = filteredReports.filter(rep => {
            const reportDate = new Date(rep.date_received);
            let isValidDateRange = true;

            // Filter by startDate if provided
            if (props.startDate && reportDate < new Date(props.startDate)) {
                isValidDateRange = false;
            }

            // Filter by endDate if provided
            if (props.endDate && reportDate > new Date(props.endDate)) {
                isValidDateRange = false;
            }

            return isValidDateRange;
        });
    } else {
        // Step 2: If no date range is provided, apply year and month filters
        if (props.selectedYear) {
            filteredReports = filteredReports.filter(rep => {
                const reportYear = new Date(rep.date_received).getFullYear();
                return reportYear === props.selectedYear;
            });
        }

        if (props.selectedMonth) {
            filteredReports = filteredReports.filter(rep => {
                const reportMonth = new Date(rep.date_received).getMonth() + 1; // Months are 0-based, so add 1
                return reportMonth === props.selectedMonth;
            });
        }
    }

    // Step 3: Count the number of reports per source (only for final filtered data)
    const reportCounts = source.value.map(src => {
        return filteredReports.filter(rep => rep.source_id === src.id).length;
    });

    console.log("Filtered Reports:", filteredReports);
    console.log("Source Names:", source.value.map(src => src.sources));
    console.log("Report Counts:", reportCounts);

    // Step 4: Update the chart with the filtered data
    options.value.series = [{
        name: "Number of Reports",
        data: reportCounts
    }];

    // Assign source names to X-axis
    options.value.xaxis.categories = source.value.map(src => src.sources);

    // Update the chart
    if (chart) {
        chart.updateOptions(options.value);
    } else {
        renderChart();
    }
};

watch(
  () => [props.selectedYear, props.selectedMonth, props.startDate, props.endDate],
  () => {
    // Re-run the updateChart function whenever any of the props change
    updateChart();
  },
  { immediate: true } // This ensures the chart is updated immediately on component mount
);





onMounted(() => {
    if (lineChart.value) {
        chart = new ApexCharts(lineChart.value, options.value);
        chart.render();
        updateChart();
    }
});
onUnmounted(() => {
    if (chart) chart.destroy();
});
</script>

<template>
  <div class="w-full h-full p-4 dark:text-white text-gray-800">
    <!-- Title -->   
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Report Trend</h2>

    </div>
    <!-- LINE CHART -->
    <div class="dark:text-gray-800 h-64" ref="lineChart"></div>
  </div>
</template>