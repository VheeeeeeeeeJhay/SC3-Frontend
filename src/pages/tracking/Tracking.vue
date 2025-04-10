<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import { useArrayStore } from '../../stores/arrayStore';

let refreshInterval = null;
const databaseStore = useDatabaseStore();

onMounted(() => {
    databaseStore.fetchData();
    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);
});

onUnmounted(() => {
    // Clear the interval when the component is unmounted or page is reloaded
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

const computedProperties = {
    logs: "logs",
};

const {
    logs,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);
console.log(logs.value);

const parsedData = (data) => {
    try {
        const parsed = JSON.parse(data);
        // Check if the parsed data is an array or a single object
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
        console.error('Error parsing data:', error);
        return [];
    }
};

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

onMounted(() => {
    document.addEventListener("click", (event) => {
        if (
            openDropdownId.value !== null &&
            !dropdownRefs.value[openDropdownId.value]?.contains(event.target)
        ) {
            closeDropdown();
        }
    });
});

//
const openDropdownId = ref(null);

const dropdownRefs = ref([]);
const closeDropdown = () => {
    openDropdownId.value = null;
};
const toggleDropdown = (logId) => {
    openDropdownId.value = openDropdownId.value === logId ? null : logId;
};

// passing data to 
const store = useArrayStore();
const passingData = (log) => {
    store.setData(log);
}
</script>

<template>
    <div class="w-full min-h-screen p-4">
        <div class="mt-6 px-2 flex justify-between">
            <h1 class="text-2xl font-bold dark:text-white">Logs Management</h1>
        </div>

        <div class="mt-6 relative shadow-md sm:rounded-lg bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
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

            <table class="w-full text-sm text-left">
                <thead class="text-xs uppercase bg-teal-300 text-gray-800 dark:bg-slate-950 dark:text-gray-300">
                    <tr>
                        <th scope="col" class="px-4 py-3 text-center">ID</th>
                        <th scope="col" class="px-4 py-3 text-center">Category</th>
                        <th scope="col" class="px-4 py-3 text-center">Action</th>
                        <th scope="col" class="px-4 py-3 text-center">Description</th>
                        <th scope="col" class="px-4 py-3 text-center">Created At</th>
                        <th scope="col" class="px-4 py-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="log in logs" :key="log.id" class="bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                        <td class="px-4 py-3 text-center">{{ log.id }}</td>
                        <td class="px-4 py-3 text-center">{{ log.category }}</td>
                        <td class="px-4 py-3 text-center">{{ log.action }}</td>
                        <td class="px-4 py-3 text-center">{{ log.description }}</td>
                        <td class="px-4 py-3 text-center">{{ log.created_at }}</td>
                        <td class="px-4 py-3 text-center">
                            <button @click.stop="toggleDropdown(log.id)"
                                class="inline-flex items-center p-0.5 text-sm font-medium rounded-lg">
                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                            </button>

                            <div v-if="openDropdownId === log.id" ref="dropdownRefs"
                                class="absolute z-10 w-44 mt-0.5 top-full right-0 shadow-sm border rounded-md bg-white dark:bg-slate-700"
                                @click.stop>

                                <ul class=" text-sm">
                                    <li>
                                        <RouterLink @click="passingData(log)"
                                            :to="{ name: 'LogViewDetails', params: { id: log.id } }"
                                            class="block px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-slate-600">
                                            View Details {{ log.id }}
                                        </RouterLink>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <nav
                class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
                <span class="text-sm font-normal">Showing {{ paginatedReports.length > 0 ? (currentPage - 1) *
                    itemsPerPage + 1 : 0 }} to {{
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

<style scoped></style>
