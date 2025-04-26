<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import { useArrayStore } from '../../stores/arrayStore';
import DateRangePicker from '../../components/DateRangePicker.vue';
import { useActionDropdown } from '../../composables/useActionDropdown';
import Badge from '../../components/Badge.vue';

const addToast = inject('addToast');

const databaseStore = useDatabaseStore();
const store = useArrayStore();

let count = ref(0);

// Auto-refresh logs
let refreshInterval = null;
onMounted(() => {
    databaseStore.fetchData();
    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
        count.value++;
        addToast(`Logs data refreshed! ${count.value} times!`, 'success', 'info');
    }, 50000);
});

onUnmounted(() => {
  // Clear the interval when the component is unmounted or page is reloaded
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Get logs from the store
const logs = computed(() => databaseStore.logs || []);

// Search and pagination
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Filter logs based on search query
const filteredLogs = computed(() => {
  let filtered = logs.value;

  // 🔍 Step 1: Search filter
  if (searchQuery.value) {
    filtered = filtered.filter(log =>
      Object.values(log).some(val =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  // 📅 Step 2: Date range filter based on startDate & endDate refs
  if (startDate.value || endDate.value) {
    const start = startDate.value ? new Date(startDate.value) : null;
    const end = endDate.value ? new Date(endDate.value) : null;

    filtered = filtered.filter(log => {
      const logDate = new Date(log.created_at);
      if (start && logDate < start) return false;
      if (end && logDate > end) return false;
      return true;
    });

    console.log(`📆 Filtering logs from ${startDate.value || 'any'} to ${endDate.value || 'any'}`);
    console.log(`✅ Found ${filtered.length} logs in range.`);
  }

  return filtered;
});


const totalPages = computed(() =>
    Math.ceil(filteredLogs.value.length / itemsPerPage.value)
);

const paginatedLogs = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredLogs.value.slice(start, start + itemsPerPage.value);
});

// Pagination controls
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

const paginationEnd = computed(() =>
    Math.min(totalPages.value, paginationStart.value + maxVisiblePages - 1)
);

const visiblePages = computed(() =>
    Array.from({ length: paginationEnd.value - paginationStart.value + 1 }, (_, i) => paginationStart.value + i)
);

const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
};
const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
};
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

// Reset to page 1 when searching
watch(searchQuery, () => {
    currentPage.value = 1;
});

// composable action dropdown activator
const { openDropdownId, dropdownRefs, toggleDropdown } = useActionDropdown();

// Pass data to store
const passingData = (log) => {
    store.clearData();

    store.setData(log);
};

const formattedDate = computed(() => {
  return (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
});

const startDate = ref(null);
const endDate = ref(null);

const updateDateRange = ({ start, end }) => {
  startDate.value = start;
  endDate.value = end;
  console.log("Date Range:", startDate.value, endDate.value);
};
</script>

<template>
    <div class="w-full min-h-screen p-4">
        <div class="mt-6 px-2 flex justify-between">
            <h1 class="text-2xl font-bold dark:text-white">Logs Management</h1>
        </div>

        <div class="mt-6 relative shadow-md sm:rounded-lg bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
                <!-- 🔍 Search -->
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

                <!-- 📅 Date Range Picker -->
                <div class="w-full md:w-auto">
                    <DateRangePicker class="max-w-xs w-full md:w-auto" @dateRangeSelected="updateDateRange" />
                </div>
            </div>


            <table class="w-full text-sm text-left">
                <thead class="text-xs uppercase bg-teal-300 text-gray-800 dark:bg-slate-950 dark:text-gray-300">
                    <tr>
                        <th class="px-4 py-3 text-center">ID</th>
                        <th class="px-4 py-3 text-center">Category</th>
                        <th class="px-4 py-3 text-center">Action</th>
                        <th class="px-4 py-3 text-center">Description</th>
                        <th class="px-4 py-3 text-center">Created At</th>
                        <th class="px-4 py-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="log in paginatedLogs" :key="log.id" class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b dark:border-gray-700">
                        <td class="px-4 py-3 text-center">{{ log.id }}</td>
                        <td class="px-4 py-3 text-center">{{ log.category }}</td>
                        <td class="px-4 py-3 text-center"><Badge :Class="log.action === 'Created' ? 'bg-green-300 text-green-800' : log.action === 'Updated' ? 'bg-blue-300 text-blue-800' : log.action === 'Deleted' ? 'bg-rose-300 text-rose-800' : log.action === 'Restored' ? 'bg-emerald-300 text-emerald-800' : log.action === 'Multiple Delete' ? 'bg-red-300 text-red-800' : 'bg-gray-300 text-gray-800'" :Message="log.action" /></td>
                        <td class="px-4 py-3 text-center">{{ log.description }}</td>
                        <td class="px-4 py-3 text-center">{{ formattedDate(log.created_at) }}</td>
                        <td class="px-4 py-3 text-center relative">
                            <button @click.stop="toggleDropdown(log.id)"
                                class="inline-flex items-center p-0.5 text-sm font-medium rounded-lg">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                            </button>
                            <div v-if="openDropdownId === log.id"
                                :ref="el => dropdownRefs[log.id] = el"
                                class="absolute z-10 w-44 mt-0.5 top-full right-0 shadow-sm border rounded-md bg-white dark:bg-slate-700"
                                @click.stop>
                                <ul class="text-sm">
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

            <!-- Pagination -->
            <nav class="flex flex-col md:flex-row justify-between items-start md:items-center p-4">
                <span class="text-sm font-normal">
                    Showing {{ paginatedLogs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}
                    to {{ Math.min(currentPage * itemsPerPage, filteredLogs.length) }} of {{ filteredLogs.length }}
                </span>
                <ul class="inline-flex items-stretch -space-x-px">
                    <li><button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 rounded-l-lg border hover:bg-gray-300 dark:hover:bg-slate-600">Previous</button></li>

                    <li v-if="paginationStart > 1">
                        <button @click="goToPage(1)" class="px-3 py-1 border hover:bg-gray-300 dark:hover:bg-slate-600">1</button>
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
                        <button @click="goToPage(totalPages)" class="px-3 py-1 border hover:bg-gray-300 dark:hover:bg-slate-600">{{ totalPages }}</button>
                    </li>

                    <li><button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 rounded-r-lg border hover:bg-gray-300 dark:hover:bg-slate-600">Next</button></li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<style scoped></style>