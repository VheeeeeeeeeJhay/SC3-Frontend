<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'primevue/chart';

const chartData = ref({
    labels: ['Call the Police', 'Medical Intervention', 'Emergency'],
    datasets: [
        {
            data: [300, 50, 100],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
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
    maintainAspectRatio: false
});
const options = [
                { label: 'All', value: null },
                { label: 'Assault', value: 'assault' },
                { label: 'Theft', value: 'theft' },
                { label: 'Vandalism', value: 'vandalism' },
                { label: 'Traffic Violation', value: 'traffic' },
                { label: 'Suspicious Activity', value: 'suspicious' },
            ]
            const selectedOption = ref(null)
</script>

<template>
    <div class="h-[250px] w-full flex items-center justify-center">

        <!-- Button dito -->
        <!-- <Dropdown v-model="selectedOption" :options="options" placeholder="Select a Crime Type" class="w-full mb-3" />
        <div v-if="selectedOption">You have selected: {{ selectedOption }}</div> -->
        
        <Chart type="pie" :data="chartData" :options="chartOptions" class="w-full h-full" style="max-width: 100%; max-height: 100%;" />
    </div>
</template>

<style scoped>
:deep(.p-chart) {
    width: 100% !important;
    height: 100% !important;
}
</style>