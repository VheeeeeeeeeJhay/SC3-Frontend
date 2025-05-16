<script setup>
import { onMounted, onUnmounted, inject } from 'vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosClient from '../../axios.js';
import { computed } from 'vue';
import ViewMap from '../../components/maps/ViewMap.vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import RelatedIncidentsTable from '../../components/tables/RelatedIncidentsTable.vue';
import { useArrayStore } from '../../stores/arrayStore';

const router = useRouter();
const id = Number(useRoute().params.id);

const errors = ref([]);
const startDate = ref(null);
const endDate = ref(null);
const selectedClassifications = ref([]);
const selectedUrgencies = ref([]);
const selectedActions = ref([]);

const addToast = inject('addToast');

const databaseStore = useDatabaseStore();

let refreshInterval = null;

// onMounted(() => {
//     databaseStore.fetchData();

//     refreshInterval = setInterval(() => {
//         databaseStore.fetchData();
//     }, 50000);
// });

// onUnmounted(() => {
//     if (refreshInterval) {
//         clearInterval(refreshInterval);
//     }
// });

const computedProperties = {
    reportArray: "reports",
};

const {
    reportArray,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

const store = useArrayStore();
const data = store.getBarangayData();

const reports = computed(() => (reportArray.value || []).filter(report => String(report.barangay_id) === id));


//Passed report data to ViewReport.vue
const passingData = (report) => {
    store.clearData();
    store.setData(report);
}
</script>
<template>
    <div class="mt-6 flex justify-between p-4">
        <h1 class="text-2xl font-bold dark:text-white">View Barangay and Related Incidents</h1>
        <button type="button" name="Back" @click.prevent="router.back()"
            class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
            <span class="material-icons mr-2"> arrow_back </span>
            Back
        </button>
    </div>
    <div class="p-4">

        <!--  -->
        <div
            class="mt-6 p-4 h-4/5 border border-gray-200 dark:border-black rounded-lg dark:bg-slate-800 dark:text-white">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Barangay Details</h2>
            <div class="flex justify-evenly">
                <div><span class="font-semibold my-2">Name:</span> {{ data.name }}</div>
                <div><span class="font-semibold my-2">Longitude:</span> {{ data.longitude }}</div>
                <div><span class="font-semibold my-2">Latitude:</span> {{ data.latitude }}</div>
            </div>
        </div>

        <!--  -->
        <div class="mx-20 mt-6 rounded-lg">
            <ViewMap :viewID="id" />
        </div>

        <RelatedIncidentsTable />

    </div>
</template>