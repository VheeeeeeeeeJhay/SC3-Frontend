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
    xaxis: {
      type: 'category',
      categories: daysOfWeek,
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: "Inter, sans-serif",
          fontWeight: 'bold', // Bold y-axis labels
          colors: '#ffffff',
        }
      }
    },
    yaxis: {
      categories: weeks,
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: "Inter, sans-serif",
          fontWeight: 'bold', // Bold y-axis labels
          colors: '#ffffff',
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: "Inter, sans-serif",
        fontWeight: 'bold', // Bold y-axis labels
      }
    },
    legend: {
        show: true,
        position: 'bottom', // Place the legend at the top for better visibility
        horizontalAlign: 'center',  // Center-aligned legend
        labels: {
            colors: '#ffffff', // White text for the legend
        },
    },
    plotOptions: {
    heatmap: {
      colorScale: {
        ranges: [
          { 
            from: 0, 
            to: 0, 
            color: '#E0F2F1', // very light teal (no reports)
            name: 'No Reports'
          },
          { 
            from: 1, 
            to: 5, 
            color: '#A7F3D0', // light green
            name: '1-5 Reports'
          },
          { 
            from: 6, 
            to: 10, 
            color: '#7DD3FC', // light blue
            name: '6-10 Reports'
          },
          { 
            from: 11, 
            to: 15, 
            color: '#FCD34D', // yellow
            name: '11-15 Reports'
          },
          { 
            from: 16, 
            to: 20, 
            color: '#FB923C', // orange
            name: '16-20 Reports'
          },
          { 
            from: 21, 
            to: Infinity, 
            color: '#EF4444', // red
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

    <div class="w-full text-black">
      <div ref="chartRef"></div>
    </div>
  </div>
</template>
