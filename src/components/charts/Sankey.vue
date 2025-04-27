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
  reports: 'reportsList',
  classifications: 'classificationsList',
  urgencies: 'urgenciesList',
  actions: 'actionsList',
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
    console.log('Chart ref not available yet')
    return
  }

  const { daysOfWeek, weeks, series } = generateHeatmapData()

  const options = {
    chart: {
      type: 'heatmap',
      height: 350,
      width: '100%',
      toolbar: {
        show: true
      },
      animations: {
        enabled: false
      }
    },
    title: {
      text: 'Accident Peak Times',
      align: 'center'
    },
    subtitle: {
      text: props.startDate && props.endDate 
        ? `${props.startDate} - ${props.endDate}`
        : 'No date range selected',
      align: 'center',
      style: {
        fontSize: '12px'
      }
    },
    xaxis: {
      type: 'category',
      categories: daysOfWeek,  // Each day of the week is a category on the X axis
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      categories: weeks,  // Each week is a category on the Y axis
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '10px'
      }
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.5,
            inverseColors: false,
            colorStops: [
              { offset: 0, color: '#FFFFFF', opacity: 1 },
              { offset: 20, color: '#ADD8E6', opacity: 1 },
              { offset: 40, color: '#00FF00', opacity: 1 },
              { offset: 60, color: '#FFFF00', opacity: 1 },
              { offset: 80, color: '#FFA500', opacity: 1 },
              { offset: 100, color: '#FF0000', opacity: 1 }
            ]
          }
        }
      }
    },
    series: series.map((row, index) => ({
      name: weeks[index],  // Each row is labeled with the corresponding week
      data: row  // Each row contains accident counts for each day of the week
    })),
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          return `${val} accidents`
        }
      }
    }
  }

  // If chart already exists, destroy and recreate
  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new ApexCharts(chartRef.value, options)
  chartInstance.render()
}

onMounted(() => {
  // Fetch initial data
  databaseStore.fetchData()

  // Refresh data every 50 seconds
  refreshInterval = setInterval(() => {
    databaseStore.fetchData()
  }, 50000)

  // Initial chart render
  renderChart()
})

// Auto-update chart when reports or date range changes
watch([reports, () => props.startDate, () => props.endDate], () => {
  renderChart()
})

onUnmounted(() => {
  // Clear the refresh interval when the component is unmounted
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<template>
  <div class="w-full p-4 text-gray-800 dark:text-white">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Accident Peak Times</h2>
    </div>

    <div class="w-full">
      <div ref="chartRef"></div>
    </div>
  </div>
</template>
