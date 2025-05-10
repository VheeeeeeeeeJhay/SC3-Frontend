<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useArrayStore } from '../../stores/arrayStore';
import { useRouter } from 'vue-router';
import axiosClient from  '../../axios.js';
import { usePagination } from '../../composables/usePagination';

const addToast = inject('addToast');

const router = useRouter();

const storage = ref([]);
const store = useArrayStore();
storage.value = store.getData();

const parsedInnerData = computed(() => {
  if (!storage.value.data) return [];

  try {
    const data = JSON.parse(storage.value.data);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Invalid JSON in storage.data", error);
    return [];
  }
});

const searchQuery = ref("");

// 1. Filtered reports based on search query
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return parsedInnerData.value;

  const query = searchQuery.value.toLowerCase();
  return parsedInnerData.value.filter((item) => {
    return (
      String(item.id).includes(query) ||
      item.name?.toLowerCase().includes(query) ||
      item.date_received?.toLowerCase().includes(query) ||
      item.incident?.type?.toLowerCase().includes(query) ||
      item.barangay?.name?.toLowerCase().includes(query)
    );
  });
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
} = usePagination(filteredData, { itemsPerPage: 10, maxVisiblePages: 3 })

watch(searchQuery, () => resetPage())

const formattedStorageDate = computed(() => {
  if (!storage.value?.created_at) return '';
  const date = new Date(storage.value.created_at);
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});

//Restore axios
const restoredReports = ref(new Set());

const restoreReport = async (event, report) => {
  const button = event.target.closest('button');
  if (button) {
    button.disabled = true;
  }

  try {
    const response = await axiosClient.post('/api/911/restore-report', report, {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY
      }
    });

    // Mark this report as restored
    restoredReports.value.add(report.id);
    addToast(response.data.message, 'success', 'check_circle');

    console.log('Report restored successfully:', response.data);

  } catch (error) {
    console.error('Error restoring report:', error.response?.data?.message || error.message);
    addToast(error.response?.data?.message, 'error', 'error');
    if (button) {
      button.disabled = false;
    }
  }
};
</script>

<template>
    <div class="relative shadow-md sm:rounded-lg bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
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
                        <th scope="col" class="px-4 py-3 text-center">Name of Author</th>
                        <th scope="col" class="px-4 py-3 text-center">Timeline</th>
                        <th scope="col" class="px-4 py-3 text-center">Incident/Case</th>
                        <th scope="col" class="px-4 py-3 text-center">Description</th>
                        <th scope="col" class="px-4 py-3 text-center">Location</th>
                        <th v-if="storage.action === 'Deleted' || storage.action === 'Multiple Delete'" scope="col" class="px-4 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in paginatedData" :key="item.id" class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b dark:border-gray-700">
                        <td class="px-4 py-3 text-center">{{ item.id }}</td>
                        <td class="px-4 py-3 text-center">{{ item.name }}</td>
                        <td class="px-4 py-3">
                            <dl class="grid gap-1">
                                <div>
                                    <dt class="font-medium">Received Time:</dt>
                                    <dd class="ml-2">{{ item.time }} - {{ item.date_received }}</dd>
                                </div>
                                <div>
                                    <dt class="font-medium">Arrival Time:</dt>
                                    <dd class="ml-2">{{ item.arrival_on_site }}</dd>
                                </div>
                            </dl>
                        </td>
                        <td class="px-4 py-3">
                          <dl class="">
                            <div>
                              <dt class="font-medium">Source:</dt>
                              <dd class="ml-2">{{ item.source?.sources || item.source_id }} - {{ item.actions?.actions || item.actions_id }}</dd>
                            </div>
                            <div>
                              <dt class="font-medium">Assistance:</dt>
                              <dd class="ml-2">{{ item.assistance?.assistance || item.assistance_id }} - {{ item.incident?.type || item.incident_id }}</dd>
                            </div>
                            <div>
                              <dt class="font-medium">Urgency:</dt>
                              <dd class="ml-2">{{ item.urgency?.urgency || item.urgency_id }}</dd>
                            </div>
                          </dl>
                        </td>
                        <td class="px-4 py-3 text-center">
                          {{ item.description }}
                        </td>
                        <td class="px-4 py-3">
                          <dl class="space-y-1">
                            <div>
                              <dt class="font-medium">Barangay:</dt>
                              <dd class="ml-2">{{ item.barangay?.name || item.barangay_id }} - {{ item.landmark }}</dd>
                            </div>
                            <div>
                              <dt class="font-medium">Coordinates:</dt>
                              <dd class="ml-2">{{ item.longitude }}, {{ item.latitude }}</dd>
                            </div>
                          </dl>
                        </td>
                        <td v-if="storage.action === 'Deleted' || storage.action === 'Multiple Delete'" class="px-4 py-3 text-center">
                          <!-- <PrimaryButton @click="(e) => restoreReport(e, item)" name="Restore" class="bg-teal-500 hover:bg-teal-600" /> -->
                            <PrimaryButton
                            :disabled="restoredReports.has(item.id)"
                            @click="(e) => restoreReport(e, item)"
                            name="Restore"
                            :class="restoredReports.has(item.id)
                            ? 'bg-gray-400 pointer-events-none text-white'
                            : 'bg-teal-500 hover:bg-teal-600 text-white'"
                        />
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination control goes here -->
            <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
                <span class="text-sm font-normal">
                Showing
                {{ filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}
                to
                {{ Math.min(currentPage * itemsPerPage, filteredData.length) }}
                of
                {{ filteredData.length }} entries
                </span>
                <ul class="inline-flex items-stretch -space-x-px">
                    <li>
                        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 rounded-l-lg border hover:bg-gray-300 dark:hover:bg-slate-600">
                            Previous
                        </button>
                    </li>
                    <li v-for="page in visiblePages" :key="page">
                        <button @click="goToPage(page)" :class="['px-3 py-1 border', currentPage === page ? 'bg-slate-500 text-white border-black' : 'hover:bg-gray-300 dark:hover:bg-slate-600']">
                            {{ page }}
                        </button>
                    </li>
                    <li>
                        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 rounded-r-lg border hover:bg-gray-300 dark:hover:bg-slate-600">
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
</template>

<style scoped>
</style>
