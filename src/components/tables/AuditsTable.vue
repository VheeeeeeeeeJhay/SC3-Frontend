<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import { useArrayStore } from '../../stores/arrayStore';
import DateRangePicker from '../../components/DateRangePicker.vue';
import { useActionDropdown } from '../../composables/useActionDropdown';
import Badge from '../../components/Badge.vue';
import { usePagination } from '../../composables/usePagination';

const addToast = inject('addToast');

const databaseStore = useDatabaseStore();
const store = useArrayStore();

// // Auto-refresh logs
// let refreshInterval = null;
// onMounted(() => {
//     databaseStore.fetchData();
//     refreshInterval = setInterval(() => {
//         databaseStore.fetchData();
//     }, 50000);
// });

// onUnmounted(() => {
//   // Clear the interval when the component is unmounted or page is reloaded
//   if (refreshInterval) {
//     clearInterval(refreshInterval);
//   }
// });

// // Get logs from the store
// const logs = computed(() => databaseStore.logs || []);

// // Search and pagination
// const searchQuery = ref("");

// // Filter logs based on search query
// const filteredLogs = computed(() => {
//   let filtered = logs.value;

//   // 🔍 Step 1: Search filter
//   if (searchQuery.value) {
//     filtered = filtered.filter(log =>
//       Object.values(log).some(val =>
//         String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
//       )
//     );
//   }

//   // 📅 Step 2: Date range filter based on startDate & endDate refs
//   if (startDate.value || endDate.value) {
//     const start = startDate.value ? new Date(startDate.value) : null;
//     const end = endDate.value ? new Date(endDate.value) : null;

//     filtered = filtered.filter(log => {
//       const logDate = new Date(log.created_at);
//       if (start && logDate < start) return false;
//       if (end && logDate > end) return false;
//       return true;
//     });

//     console.log(`📆 Filtering logs from ${startDate.value || 'any'} to ${endDate.value || 'any'}`);
//     console.log(`✅ Found ${filtered.length} logs in range.`);
//   }

//   return filtered;
// });


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

const search = ref('');

// Use a ref to store the timeout
let searchTimeout = null;
let refreshInterval = null;

// Create a computed property for testReports
const audits = computed(() => databaseStore.audits);

// Initial data fetch
onMounted(() => {
  refreshInterval = setInterval(() => {
    databaseStore.Audits({
      search: search.value,
      startDate: startDate.value,
      endDate: endDate.value,
      page: audits.value.current_page || 1,
    });
  }, 120000);
});

// Watch for search parameter changes
watch([search, startDate, endDate], () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    databaseStore.Audits({
      search: search.value,
      startDate: startDate.value,
      endDate: endDate.value,
      page: audits.value.current_page,
    });
  }, 300);

});
// Add cleanup in onUnmounted
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  databaseStore.Audits({
      search: '',
      startDate: startDate.value,
      endDate: endDate.value
    });
});

// Computed properties
const visiblePages = computed(() => {
    if (!audits.value || !audits.value.last_page) return;
    
    const current = audits.value.current_page;
    const last = audits.value.last_page;
    const delta = 2;
    const range = [];
    
    for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
        range.push(i);
    }
    
    if (current - delta > 2) {
        range.unshift('...');
    }
    if (current + delta < last - 1) {
        range.push('...');
    }
    
    range.unshift(1);
    if (last !== 1) range.push(last);
    
    return range;
});

// Methods
const goToPage = (page) => {
    if (page === '...') return;
    databaseStore.Audits({
        page: page,
        search: search.value,
        startDate: startDate.value,
        endDate: endDate.value
    });
};

const nextPage = () => {
    if (audits.value.next_page_url) {
        goToPage(audits.value.current_page + 1);
    }
};

//goods
const prevPage = () => {
    if (audits.value.prev_page_url) {
        goToPage(audits.value.current_page - 1);
    }
};


</script>

<template>
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
                        <input v-model="search" type="text" id="simple-search"
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
                    <tr v-for="log in audits.data" :key="log.id" class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b dark:border-gray-700">
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
                                            :to="{ name: 'DetailedAuditReport', params: { id: log.id } }"
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
            <nav class="flex flex-col md:flex-row justify-between items-start sm:items-center gap-4 space-y-3 md:space-y-0 p-4">
                <!-- Update the showing text to use the pagination data from the API -->
                <span class="text-sm font-normal">
                    Showing {{ audits.from ? audits.from : 0 }} to {{ audits.to ? audits.to : 0 }} of {{ audits.total ? audits.total : 0 }}
                </span>
                
                <ul class="inline-flex items-stretch -space-x-px">
                    <!-- Previous Button -->
                    <li>
                        <button 
                            @click="prevPage" 
                            :disabled="!audits?.prev_page_url"
                            class="px-3 py-1 rounded-l-lg border hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50"
                            :class="{ 'cursor-not-allowed': !audits?.prev_page_url }"
                        >
                            Previous
                        </button>
                    </li>

                    <!-- First Page -->
                    <li v-if="audits.current_page > 2">
                        <button 
                            @click="goToPage(1)" 
                            class="px-3 py-1 border hover:bg-gray-300 dark:hover:bg-slate-600"
                        >
                            1
                        </button>
                        <span v-if="audits?.current_page > 3" class="px-3 py-1 border bg-gray-100 dark:bg-gray-700">...</span>
                    </li>

                    <!-- Page Numbers -->
                    <li v-for="page in visiblePages" :key="page">
                        <button 
                            @click="goToPage(page)"
                            :class="[
                                'px-3 py-1 border', 
                                audits.current_page === page 
                                    ? 'bg-teal-500 text-white border-teal-800' 
                                    : 'hover:bg-gray-300 dark:hover:bg-slate-600'
                            ]"
                        >
                            {{ page }}
                        </button>
                    </li>

                    <!-- Last Page -->
                    <li v-if="audits?.current_page < audits?.last_page - 1">
                        <span v-if="audits?.current_page < audits?.last_page - 2" class="px-3 py-1 border bg-gray-100 dark:bg-gray-700">...</span>
                        <button 
                            @click="goToPage(audits.last_page)" 
                            class="px-3 py-1 border hover:bg-gray-300 dark:hover:bg-slate-600"
                        >
                            {{ audits.last_page }}
                        </button>
                    </li>

                    <!-- Next Button -->
                    <li>
                        <button 
                            @click="nextPage" 
                            :disabled="!audits?.next_page_url"
                            class="px-3 py-1 rounded-r-lg border hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50"
                            :class="{ 'cursor-not-allowed': !audits?.next_page_url }"
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>

        </div>
</template>

<style scoped>
</style>