<script setup>
import { ref, onMounted } from 'vue';
import Table from '../../components/Table.vue';
import axiosClient from '../../axios.js';

const reports = ref([]);
const classifications = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const selectedClassifications = ref([]);

onMounted(() => {
    isLoading.value = true;
    axiosClient.get('/api/911/incident-display', {
        headers: {
            'x-api-key': '$m@rtC!ty'
        }
    })
    .then((res) => {
        setTimeout(() => {
            reports.value = res.data[0]; // Assuming reports are in the first index
            classifications.value = res.data[1]; // Assuming classifications are in the second index
            isLoading.value = false;
        }, 1500);
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        errorMessage.value = 'Failed to load barangays. Please try again later.';
        isLoading.value = false;
    });
});


</script>

<template>
    <div>
        <Table :reports="reports" :classifications="classifications" :isLoading="isLoading" :errorMessage="errorMessage"/>   
    </div>
</template>
