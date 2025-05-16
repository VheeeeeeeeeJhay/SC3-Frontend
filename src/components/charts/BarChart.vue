<script setup>
import { ref, onMounted, onUnmounted, watch, computed, toRaw } from "vue";
import ApexCharts from 'apexcharts';
import { useDatabaseStore } from '../../stores/databaseStore';

let refreshInterval = null;
const databaseStore = useDatabaseStore();

onMounted(() => {
    databaseStore.fetchData();
    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);
});

onUnmounted(() => {
  // Clear the interval when the component is unmounted or page is reloaded
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// const computedProperties = {
//     report: "reportsList",
//     source: "sources",
// };

// const {
//     report,
//     source,
// } = Object.fromEntries(
//     Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
// );
const report = computed(() => databaseStore.reports);
const source = computed(() => databaseStore.sources);

// Cache previous snapshots
let previousReportJson = JSON.stringify(toRaw(report.value));
let previousSourceJson = JSON.stringify(toRaw(source.value));

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
        position: 'bottom', // Place the legend at the top for better visibility
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
  startDate: String,  // (format YYYY-MM-DD)
  endDate: String
});

const barChart = ref(null);
let chart = null;
let count = 0;
const updateChart = () => {
    count++;
    console.log("Update Chart in BarChart.vue:", count);
    if (!source.value.length || !report.value.length) {
        console.log("No data to update the chart.");
        return;
    }

    const sourceNames = source.value.map(src => src.sources);
    const seriesData = sourceNames.map(() => Array(12).fill(0)); // 12 months

    let filteredReports = report.value;

    // Apply date range filter
    if (props.startDate || props.endDate) {
        filteredReports = filteredReports.filter(rep => {
            const reportDate = new Date(rep.date_received);

            // Filter by startDate 
            if (props.startDate && reportDate < new Date(props.startDate)) return false;
            // Filter by endDate 
            if (props.endDate && reportDate > new Date(props.endDate)) return false;

            return true;
        });
    }

    // Populate series data
    filteredReports.forEach(rep => {
        const sourceIndex = source.value.findIndex(src => src.id === rep.source_id);
        if (sourceIndex === -1) return;

        const reportMonthIndex = new Date(rep.date_received).getMonth(); // 0-based
        seriesData[sourceIndex][reportMonthIndex]++;
    });

    // Determine which months have data
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

    // console.log("✅ Final Chart Series:", trimmedSeries);
    // console.log("📅 Filtered Month Labels:", filteredMonthLabels);

    // Update chart
    options.value.series = trimmedSeries;
    options.value.xaxis.categories = filteredMonthLabels;

    if (chart) {
        chart.updateOptions(options.value);
    } else {
        // renderChart();
        chart.render();

    }
};



onMounted(() => {
    if (barChart.value) {
        chart = new ApexCharts(barChart.value, options.value);
        chart.render();
    }
});

watch(
  [() => source.value, () => report.value],
  ([newSource, newReport]) => {
    const currentSourceJson = JSON.stringify(toRaw(newSource));
    const currentReportJson = JSON.stringify(toRaw(newReport));

    if (
      previousSourceJson !== currentSourceJson ||
      previousReportJson !== currentReportJson
    ) {
      if (newSource.length && newReport.length) {
        updateChart();
      }

      // Update cached versions
      previousSourceJson = currentSourceJson;
      previousReportJson = currentReportJson;
    }
  }
);


watch([() => props.startDate, () => props.endDate], () => {
//   console.log("🔄 Date props changed: Running updateChart()");
  updateChart();
});

onUnmounted(() => {
    if (chart) chart.destroy();
});
</script>

<template>
  <div class="w-full h-full p-4 dark:text-white text-gray-800">   
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Report Per Source
        <p class="text-xs text-gray-500 dark:text-gray-400">
            Reports from {{ startDate }} to {{ endDate }}
        </p>
      </h2>
      
    </div>
    <!-- BAR CHART -->
    <div class="dark:text-gray-800 h-full" ref="barChart"></div>
  </div>
</template>
