<script setup>
import { ref, onMounted, computed } from 'vue'
import ApexCharts from 'apexcharts'
import { useDatabaseStore } from '../../stores/databaseStore'

const databaseStore = useDatabaseStore();

// Store Fetch Data From Backend In An Array
const report = computed(() => databaseStore.reportsList);
console.log(report.value);

onMounted(() => {
    databaseStore.fetchData();
});

// Chart container ref
const chartRef = ref(null)

// Helper: Get last 5 months names
const getLast5Months = () => {
    const months = []
    const now = new Date()

    for (let i = 4; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthName = date.toLocaleString('default', { month: 'short' })
        months.push(monthName)
    }

    return months
}

onMounted(() => {
    const last5Months = getLast5Months()

    const options = {
        series: [
            {
                name: 'Marine Sprite',
                data: Array.from({ length: last5Months.length }, () => Math.floor(Math.random() * 100))
            },
            {
                name: 'Striking Calf',
                data: Array.from({ length: last5Months.length }, () => Math.floor(Math.random() * 100))
            },
            {
                name: 'Tank Picture',
                data: Array.from({ length: last5Months.length }, () => Math.floor(Math.random() * 100))
            },
            {
                name: 'Bucket Slope',
                data: Array.from({ length: last5Months.length }, () => Math.floor(Math.random() * 100))
            }
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
            enabled: true
        },
        stroke: {
            width: 2
        },
        title: {
            text: 'Sales Strategy - Last 5 Months'
        },
        xaxis: {
            categories: last5Months,
            title: {
                text: 'Month'
            }
        },
        yaxis: {
            title: {
                text: undefined
            }
        },
        tooltip: {
            shared: false,
            y: {
                formatter: function (val) {
                    return val + "K"
                }
            }
        },
        fill: {
            type: 'pattern',
            opacity: 1,
            pattern: {
                style: ['circles', 'slantedLines', 'verticalLines', 'horizontalLines']
            }
        },
        states: {
            hover: {
                filter: 'none'
            }
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            offsetY: 10
        }
    }

    const chart = new ApexCharts(chartRef.value, options)
    chart.render()
})
</script>

<template>
    <div class="w-full p-4 text-gray-800 dark:text-white">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Reports by Urgency Leve</h2>
    </div>

    <div class="w-full flex flex-col items-center">
      <div class="chart-wrapper">
        <div ref="chartRef"></div>
      </div>
      <div class="legend-wrapper">
        <div class="legend-scrollable"></div>
      </div>
    </div>

    <!-- <div v-for="(report, index) in report" :key="index">
      <p>{{ report }}</p>
    </div> -->


  </div>
</template>