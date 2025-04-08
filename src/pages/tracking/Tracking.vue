<template>
    <div class="mt-6 w-full p-4">
            <div
                class="relative shadow-md sm:rounded-lg bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
                <div
                    class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
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

                <table class="w-full text-sm text-left">
                    <thead class="text-xs uppercase bg-teal-300 text-gray-800 dark:bg-slate-950 dark:text-gray-300">
                        <tr>
                            <th scope="col" class="px-4 py-3 text-center">ID</th>
                            <th scope="col" class="px-4 py-3 text-center">Source</th>
                            <th scope="col" class="px-4 py-3 text-center">Assistance</th>
                            <th scope="col" class="px-4 py-3 text-center">Incident/Case</th>
                            <th scope="col" class="px-4 py-3 text-center">Actions Taken</th>
                            <th scope="col" class="px-4 py-3 text-center">Urgency</th>
                            <th scope="col" class="px-4 py-3 text-center">Location</th>
                            <th scope="col" class="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            class="bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                            <td class="px-4 py-3 text-center"></td>
                            <td class="px-4 py-3 text-center"></td>
                            <td class="px-4 py-3 text-center"></td>
                            <td class="px-4 py-3 text-center"></td>
                            <td class="px-4 py-3 text-center"></td>
                            <td class="px-4 py-3 text-center"></td>
                            <td class="px-4 py-3 text-center"></td>
                            <td class="px-4 py-3 text-center"></td>
                        </tr>
                    </tbody>
                </table>

                <nav
                    class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
                    <span class="text-sm font-normal">Showing {{ paginatedReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} to {{
                        Math.min(currentPage *
                            itemsPerPage, paginatedReports.length) }} of {{ paginatedReports.length }}</span>
                    <ul class="inline-flex items-stretch -space-x-px">
                        <li>
                            <button @click="prevPage" :disabled="currentPage === 1"
                                class="px-3 py-1 rounded-l-lg border hover:bg-gray-300 dark:hover:bg-slate-600">
                                Previous
                            </button>
                        </li>

                        <li v-if="paginationStart > 1">
                            <button @click="goToPage(1)"
                                class="px-3 py-1 border hover:bg-gray-300 dark:hover:bg-slate-600">1</button>
                            <button disabled class="px-3 py-1 border bg-gray-100 dark:bg-gray-700">...</button>
                        </li>

                        <li v-for="page in visiblePages" :key="page">
                            <button @click="goToPage(page)"
                                :class="['px-3 py-1 border', currentPage === page ? 'bg-slate-500 text-white border-black' : 'hover:bg-gray-300 dark:hover:bg-slate-600']">
                                {{ page }}
                            </button>
                        </li>

                        <li v-if="paginationEnd < totalPages">
                            <button disabled class="px-3 py-1 border bg-gray-100 dark:bg-gray-700">...</button>
                            <button @click="goToPage(totalPages)"
                                class="px-3 py-1 border hover:bg-gray-300 dark:hover:bg-slate-600">{{
                                    totalPages }}</button>
                        </li>

                        <li>
                            <button @click="nextPage" :disabled="currentPage === totalPages"
                                class="px-3 py-1 rounded-r-lg border hover:bg-gray-300 dark:hover:bg-slate-600">
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const searchQuery = ref("");
const reports = ref([]);
// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
// Total pages based on filtered results
const totalPages = computed(() => {
    return Math.ceil(reports.value.length / itemsPerPage.value);
});
// Get paginated reports
const paginatedReports = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return reports.value.slice(start, end);
});

// Pagination controls
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};
// Reset to first page when searching
watch(searchQuery, () => {
    currentPage.value = 1;
});


// SCRIPT TO LIMIT PAGINATION NAV, THEN FIND <ul> THEN COPY AND PASTE TO YOUR CODE
const maxVisiblePages = 3;

const paginationStart = computed(() => {
    if (currentPage.value <= Math.floor(maxVisiblePages / 2)) {
        return 1;
    } else if (currentPage.value + Math.floor(maxVisiblePages / 2) >= totalPages.value) {
        return Math.max(1, totalPages.value - maxVisiblePages + 1);
    } else {
        return currentPage.value - Math.floor(maxVisiblePages / 2);
    }
});

const paginationEnd = computed(() => {
    return Math.min(totalPages.value, paginationStart.value + maxVisiblePages - 1);
});

const visiblePages = computed(() => {
    return Array.from({ length: paginationEnd.value - paginationStart.value + 1 }, (_, i) => paginationStart.value + i);
});
</script>

<style scoped>
/* Optional: Scoped styles for the component */
</style>
