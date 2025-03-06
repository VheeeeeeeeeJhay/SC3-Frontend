<script setup>
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import axiosClient from '../../axios.js';
import ToolTip from '../../components/ToolTip.vue';

const id = String(useRoute().params.id);
console.log(id);

const reports = ref([]);
const errors = ref([]);

const fetchData = async () => {
    await axiosClient.get('/api/911/barangay-reports/' + id, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
    .then((res) => {
        reports.value = res.data;
        console.log(reports.value);
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        errors.value = 'Failed to load data. Please try again later.';
    });
}

onMounted(() => {
    fetchData();
});

</script>

<template>
    <div>
        <h1>View Related Incidents</h1>
        <div v-for="report in reports" :key="report.id">
            <p>{{ report.id }}</p>
            <p>{{ report.date }}</p>
            <p>{{ report.date_received }}</p>
            <p>{{ report.assistance.assistance }}</p>
            <p>{{ report.incident.type }}</p>
            <p>{{ report.landmark }}</p>
            <p>{{ report.longitude }}</p>
            <p>{{ report.latitude }}</p>
            <p>{{ report.source.sources }}</p>
            <br>
        </div>
    </div>
    <ToolTip />
</template>