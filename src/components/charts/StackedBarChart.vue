<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import ApexCharts from 'apexcharts'
import { useDatabaseStore } from '../../stores/databaseStore'

const props = defineProps({
  startDate: String,
  endDate: String
})

const databaseStore = useDatabaseStore()
const chartRef = ref(null)
const chart = ref(null)
const isLoading = ref(true)
const error = ref(null)

// Store Fetch Data From Backend In An Array
const report = computed(() => {
  console.log('Reports:', databaseStore.reportsList)  // Check reportsList
  return databaseStore.reportsList
})

// Helper: Get months between start and end date
const getMonthsBetweenDates = () => {
  const months = []
  const startDateObj = new Date(props.startDate)
  const endDateObj = new Date(props.endDate)

  console.log('Start Date:', startDateObj, 'End Date:', endDateObj)  // Verify date parsing

  for (let d = startDateObj; d <= endDateObj; d.setMonth(d.getMonth() + 1)) {
    const monthName = new Date(d).toLocaleString('default', { month: 'short' })
    months.push(monthName)
  }

  console.log('Months:', months)  // Verify the month list
  return months
}

// Helper: Group reports by month and urgency level
const groupReportsByMonth = () => {
  const groupedReports = {
    'Life-Saving': [],
    'Critical': [],
    'High Priority': [],
    'Moderate': [],
    'Low Priority': []
  }

  const months = getMonthsBetweenDates()
  const startDateObj = new Date(props.startDate)

  // Create a map of urgency IDs to their names
  const urgencyMap = new Map(databaseStore.urgenciesList.map(u => [u.id, u.urgency]))

  months.forEach(month => {
    const monthReports = report.value.filter(report => {
      try {
        const reportDate = new Date(report.date_received)
        const monthStart = new Date(startDateObj)
        monthStart.setMonth(startDateObj.getMonth() + months.indexOf(month))
        const monthEnd = new Date(monthStart)
        monthEnd.setMonth(monthStart.getMonth() + 1)
        
        return reportDate >= monthStart && reportDate < monthEnd
      } catch (e) {
        console.error('Error processing report:', report, e)
        return false
      }
    })

    console.log('Month:', month, 'Reports:', monthReports)

    Object.keys(groupedReports).forEach(level => {
      const count = monthReports.filter(r => {
        const urgencyId = r.urgency_id
        const urgencyName = urgencyMap.get(urgencyId) || 'Unknown'
        return urgencyName === level
      }).length
      groupedReports[level].push(count)
    })
  })

  console.log('Final Grouped Reports:', groupedReports)
  return groupedReports
}

const updateChart = () => {
  try {
    const months = getMonthsBetweenDates()
    const groupedReports = groupReportsByMonth()
    const colors = [
      '#EF4444', // text-red-500 for Life-Saving
      '#F97316', // text-orange-500 for Critical
      '#FBBF24', // text-yellow-500 for High Priority
      '#10B981', // text-green-500 for Moderate
      '#6B7280'  // text-gray-500 for Low Priority
    ]
    const strokeColors = colors.map(color => {
      // Convert hex to RGB
      const r = parseInt(color.substr(1,2), 16)
      const g = parseInt(color.substr(3,2), 16)
      const b = parseInt(color.substr(5,2), 16)
      // Darken by 20%
      const darkened = `rgb(${Math.round(r * 0.8)}, ${Math.round(g * 0.8)}, ${Math.round(b * 0.8)})`
      return darkened
    })

    const options = {
      series: [
        { name: 'Low Priority', data: groupedReports['Low Priority'] },
        { name: 'Moderate', data: groupedReports['Moderate'] },
        { name: 'High Priority', data: groupedReports['High Priority'] },
        { name: 'Critical', data: groupedReports['Critical'] },
        { name: 'Life-Saving', data: groupedReports['Life-Saving'] }
      ],
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
        dropShadow: {
          enabled: true,
          blur: 1,
          opacity: 0.5
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '60%',
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#000000'] // Dark text for better visibility
        }
      },
      stroke: {
        width: 2,
        colors: strokeColors.reverse() // Reverse stroke colors to match series order
      },
      colors: colors.reverse(), // Reverse colors array to match series order
      title: {
        text: 'Reports by Urgency Level',
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      xaxis: {
        categories: months,
        title: {
          text: 'Month',
          style: {
            fontSize: '14px'
          }
        },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Number of Reports',
          style: {
            fontSize: '14px'
          }
        },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (val) {
            return val
          }
        }
      },
      fill: {
        opacity: 1,
        type: 'solid' // Solid fill for better visibility
      },
      states: {
        hover: {
          filter: 'none'
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        offsetY: 10,
        fontSize: '12px'
      }
    }

    if (chartRef.value) {
      if (chart.value) {
        chart.value.updateOptions(options)
      } else {
        chart.value = new ApexCharts(chartRef.value, options)
        chart.value.render()
      }
    }
    isLoading.value = false
  } catch (err) {
    error.value = err.message
    isLoading.value = false
  }
}

onMounted(() => {
  isLoading.value = true
  databaseStore.fetchData()
  console.log('Fetching data...')
  // Check if data is populated
  console.log('Reports List:', databaseStore.reportsList)  // This should log the reports
  updateChart()
})

watch([() => props.startDate, () => props.endDate], () => {
  isLoading.value = true
  error.value = null
  updateChart()
})

watch(() => databaseStore.reportsList, () => {
  console.log('Reports List Updated:', databaseStore.reportsList)  // Check if reportsList is updated
  updateChart()
})
</script>

<template>
  <div class="w-full p-4 text-gray-800 dark:text-white">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Reports by Urgency Level</h2>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-32">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>

    <div v-else class="w-full flex flex-col items-center">
      <div class="chart-wrapper">
        <div ref="chartRef"></div>
      </div>
      <div class="legend-wrapper">
        <div class="legend-scrollable"></div>
      </div>
    </div>
  </div>
</template>
