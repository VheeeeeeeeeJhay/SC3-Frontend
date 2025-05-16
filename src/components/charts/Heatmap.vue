<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import ApexCharts from 'apexcharts'
import { useDatabaseStore } from '../../stores/databaseStore'

const databaseStore = useDatabaseStore()

// Props for date filtering
const props = defineProps({
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  }
})

// Setup computed properties for databaseStore
const computedProperties = {
  reports: 'reports',
  classifications: 'assistance',
  urgencies: 'urgencies',
  actions: 'actions',
}

const {
  reports,
  classifications,
  urgencies,
  actions,
} = Object.fromEntries(
  Object.entries(computedProperties).map(([key, value]) => [
    key,
    computed(() => databaseStore[value])
  ])
)

// Chart container ref
const chartRef = ref(null)
let chartInstance = null // Save chart instance separately

let refreshInterval = null // Initialize refresh interval

const generateHeatmapData = () => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeks = []  // To store week data (e.g., Week 1, Week 2, etc.)
  const dataMatrix = []  // This will store the accident data (accident counts)

  // Validate and parse dates
  const start = props.startDate ? new Date(props.startDate) : null
  const end = props.endDate ? new Date(props.endDate) : null

  if (!Array.isArray(reports.value)) {
    console.warn('Reports data is not ready yet.')
    return { daysOfWeek, weeks, series: dataMatrix }
  }

  // Helper function to calculate the week number
  const getWeekNumber = (date) => {
    const startDate = new Date(props.startDate)
    const diff = date - startDate
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return Math.floor(days / 7) + 1  // Week number (1, 2, 3, etc.)
  }

  // Get min and max values for color scaling
  let minValue = Infinity
  let maxValue = -Infinity

  // Generate week labels based on the date range
  const startDate = new Date(props.startDate)
  const endDate = new Date(props.endDate)
  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const weekNumber = getWeekNumber(currentDate)
    if (!weeks.includes(`Week ${weekNumber}`)) {
      weeks.push(`Week ${weekNumber}`)
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Initialize the data matrix with all zeroes
  for (let i = 0; i < weeks.length; i++) {
    dataMatrix.push(new Array(7).fill(0)) // 7 days of the week for each week
  }

  // Process reports
  reports.value.forEach(report => {
    const dateField = report.date_received || report.date
    if (!dateField) {
      console.log('Report without date:', report)
      return
    }

    try {
      const reportDate = new Date(dateField)

      if (isNaN(reportDate.getTime())) {
        console.warn('Invalid date:', dateField, 'in report:', report)
        return
      }

      // Check if date is within range
      if (
        (!start || reportDate >= start) &&
        (!end || reportDate <= end)
      ) {
        const weekNumber = getWeekNumber(reportDate)
        const dayOfWeek = reportDate.getDay()  // 0 (Sun) - 6 (Sat)
        const weekIndex = weeks.indexOf(`Week ${weekNumber}`)
        
        // Increment the count for the specific week and day
        if (weekIndex !== -1) {
          dataMatrix[weekIndex][dayOfWeek] += 1
          // Update min/max values
          const currentValue = dataMatrix[weekIndex][dayOfWeek]
          if (currentValue < minValue) minValue = currentValue
          if (currentValue > maxValue) maxValue = currentValue
        }
      }
    } catch (error) {
      console.error('Error processing report date:', error, 'in report:', report)
    }
  })

  return { daysOfWeek, weeks, series: dataMatrix }
}

const renderChart = () => {
  if (!chartRef.value) {
    console.log('Chart ref not available yet');
    return;
  }

  const { daysOfWeek, weeks, series } = generateHeatmapData();

  const options = {
    chart: {
      type: 'heatmap',
      height: 350,
      width: '100%',
      toolbar: { show: true },
      animations: { enabled: true },
      // background: 'transparent', // Makes background blend with glass UI
      fontFamily: 'Inter, sans-serif'
    },
    xaxis: {
      type: 'category',
      categories: daysOfWeek,
      labels: {
        style: {
          fontSize: '13px',
          fontWeight: 600,
          colors: '#e0e0e0'
        }
      },
      axisBorder: {
        show: true,
        color: '#e0e0e0'
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      categories: weeks,
      labels: {
        style: {
          fontSize: '13px',
          fontWeight: 600,
          colors: '#e0e0e0'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '10px',
        fontWeight: 600,
        colors: ['#111827']
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      labels: {
        colors: '#e0e0e0',
        useSeriesColors: false
      },
      itemMargin: {
        horizontal: 10,
        vertical: 4
      }
    },
    plotOptions: {
      heatmap: {
        useFillColorAsStroke: false,
        colorScale: {
          ranges: [
    {
      from: 0,
      to: 0,
      color: '#e0f2fe', // light gray
      name: 'No Reports'
    },
    {
      from: 1,
      to: 5,
      color: '#c7d2fe', // soft indigo
      name: '1–5 Reports'
    },
    {
      from: 6,
      to: 10,
      color: '#a5f3fc', // light cyan
      name: '6–10 Reports'
    },
    {
      from: 11,
      to: 15,
      color: '#fde68a', // soft yellow
      name: '11–15 Reports'
    },
    {
      from: 16,
      to: 20,
      color: '#fca5a5', // soft red
      name: '16–20 Reports'
    },
    {
      from: 21,
      to: Infinity,
      color: '#f87171', // more saturated red
      name: '21+ Reports'
    }
  ]
        }
      }
    },
    series: series.map((row, index) => ({
      name: weeks[index],
      data: row
    })),
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      strokeDashArray: 4,
      padding: { top: 10, bottom: 10, left: 10, right: 10 }
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '13px',
        fontFamily: 'Inter, sans-serif'
      },
      y: {
        formatter: (val) => `${val} accidents`
      }
    }
  };

  // Destroy existing chart if needed
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new ApexCharts(chartRef.value, options);
  chartInstance.render();
};


onMounted(() => {
  renderChart()
})

// Auto-update chart when reports or date range changes
watch([reports, () => props.startDate, () => props.endDate], () => {
  renderChart()
})

onUnmounted(() => {
//   // Clear the refresh interval when the component is unmounted
//   if (refreshInterval) {
//     clearInterval(refreshInterval)
//   }
if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

</script>

<template>
  <div class="w-full p-4 text-gray-800 dark:text-white">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Accident Peak Times</h2>
    </div>

    <div class="w-full text-black">
      <div ref="chartRef"></div>
    </div>
  </div>
</template>
