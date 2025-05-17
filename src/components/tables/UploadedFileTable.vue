<script setup>
import { ref, computed, watch } from 'vue';
import { usePagination } from '../../composables/usePagination';

const props = defineProps({
    contained_data: Array
});


// Search query
const searchQuery = ref('');

// Filtered data based on search
const filteredReports = computed(() => {
    if (!searchQuery.value) {
        return props.contained_data;
    }
    return props.contained_data.filter(report =>
        Object.values(report).some(value =>
            String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    );
});

const {
  currentPage,
  itemsPerPage,
  totalPages,
  paginatedData,   // <-- this replaces paginatedReports
  visiblePages,    // <-- replaces paginationStart/paginationEnd logic
  nextPage,
  prevPage,
  goToPage,
  resetPage
} = usePagination(filteredReports, { itemsPerPage: 10, maxVisiblePages: 3 })

watch(searchQuery, () => resetPage())

const TableHeaders = [
    'Time Occurred',
    'Date Occurred',
    'Time Arrival on Site',
    'Name',
    'Landmark',
    'Longitude',
    'Latitude',
    'Source Id',
    'Incident Id',
    'Barangay Id',
    'Actions Id',
    'Assistance Id',
    'Urgency Id'
]

</script>

<template>
    <div class="mt-6 w-full">
        <div class="relative shadow-md sm:rounded-lg bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
            <!-- Search Bar -->
            <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                <div class="w-full md:w-1/2">
                    <form class="flex items-center">
                        <label for="simple-search" class="sr-only">Search</label>
                        <div class="relative w-full">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span class="material-icons text-gray-500 dark:text-gray-300">search</span>
                            </div>
                            <input v-model="searchQuery" type="text" id="simple-search"
                                class="border text-sm rounded-lg block w-full pl-10 p-2 bg-white dark:bg-slate-700 dark:text-white dark:border-black placeholder-gray-500 dark:placeholder-gray-300"
                                placeholder="Search..." />
                        </div>
                    </form>
                </div>
            </div>

            <!-- Table -->
            <table class="w-full text-sm text-left">
                <thead class="text-xs uppercase bg-teal-300 text-gray-800 dark:bg-slate-950 dark:text-gray-300">
                    <tr>
                        <th v-for="(header, index) in TableHeaders" :key="index" scope="col" class="px-4 py-3">{{ header }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(report, index) in paginatedData" :key="index"
                        class="bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                        <td class="dark:text-white px-4 py-3">{{ report.time_occurred }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.date_occurred }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.time_arrival_on_site }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.name }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.landmark }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.longitude }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.latitude }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.source_id }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.incident_id }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.barangay_id }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.actions_id }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.assistance_id }}</td>
                        <td class="dark:text-white px-4 py-3">{{ report.urgency_id }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
                <span class="text-sm font-normal">
                    Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredReports.length) }}
                    of {{ filteredReports.length }}
                </span>
                <ul class="inline-flex items-stretch -space-x-px">
                    <li><button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border">Previous</button></li>
                    <li v-for="page in visiblePages" :key="page">
                        <button @click="goToPage(page)" :class="['px-3 py-1 border', currentPage === page ? 'bg-slate-500 text-white border-black' : 'hover:bg-gray-300 dark:hover:bg-slate-600']">{{ page }}</button>
                    </li>
                    <li><button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border">Next</button></li>
                </ul>
            </nav>
        </div>
    </div>
</template>
