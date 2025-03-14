<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axiosClient from '../../axios.js';

const recents = ref([]);

let interval_id = null;
const fetchData = async () => {
    try{
        axiosClient.get('/api/911/recent', {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
        }).then((res) => {
            recents.value = res.data.recent;
            console.log(recents.value);
        })
    } catch (error) {
        console.error('Error fetching data:', error);
    }    
}

onMounted(() => {
    fetchData();

    interval_id = setInterval(fetchData, 5000);
})

onBeforeUnmount(() => {
    if (interval_id) {
        clearInterval(interval_id);
    }
})
</script>

<template>
    <!-- Title -->
    <h2 class="text-base font-medium dark:text-white">
        Top 5 Most Recent Reports <ToolTip Information="The top 5 most recent reports are the 5 most recent reports in the system."/>
    </h2>
    <div v-if="recents.length === 0">
        <Loader1 class="m-auto" />
    </div>
    <div v-else v-for="recent in recents" :key="recent.id" class="border-l-5 border-teal-500 mb-2">
        <div class="block p-2 bg-white border border-gray-200 rounded-tr-lg rounded-br-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
        <h5 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">{{ recent.incident.type }}</h5>
        <div class="grid grid-cols-2 grid-rows-1 gap-4">
            <div>
                <p class="font-normal text-gray-700 dark:text-gray-400 truncate">Barangay: </p>
                <span class="font-bold">{{ recent.barangay.name }}</span></div>
            <div>
                <p class="font-normal text-gray-700 dark:text-gray-400 truncate">Assistance: </p>
                <span class="font-bold">{{ recent.assistance.assistance }}</span>
            </div>
        </div>
        <RouterLink :to="{ name: 'ReportViewDetails', params: { id: recent.id } }"
            class="block  py-2 hover:italic dark:hover:text-blue-600">
            View Details
        </RouterLink>
        </div>
    </div>
</template>

<style scoped></style>
