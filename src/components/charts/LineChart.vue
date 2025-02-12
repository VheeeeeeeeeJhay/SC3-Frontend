<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'primevue/chart';

const chartData = ref({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'Growth',
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            borderColor: '#66BB6A',
            tension: 0.4
        }
    ]
});

const chartOptions = ref({
    plugins: {
        legend: {
            position: 'bottom'
        }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            grid: {
                drawBorder: true,
                color: '#AAA'
            }
        },
        x: {
            grid: {
                drawBorder: true,
                color: '#AAA'
            }
        }
    }
});
</script>     

<template>
    <div class="h-[250px] w-full flex items-center justify-center">
        <Chart type="line" :data="chartData" :options="chartOptions" class="w-full h-full" style="max-width: 100%; max-height: 100%;" />
    </div>
</template>

<style scoped>
:deep(.p-chart) {
    width: 100% !important;
    height: 100% !important;
}
</style>