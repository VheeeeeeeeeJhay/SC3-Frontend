<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import AddBarangay from './AddBarangay.vue';
import EditBarangay from './EditBarangay.vue';
import axiosClient from '../../axios.js';
import { RouterLink } from 'vue-router';
import Badge from '../../components/Badge.vue';
import { useDatabaseStore } from '../../stores/databaseStore';

// Initialize database store
const databaseStore = useDatabaseStore();
// Initialize variables
let refreshInterval = null;

const message = ref('');
const errors = ref('');

const barangaysList = ref([]);
const reportsPerBarangay = ref([]);

// Watch databaseStore.barangaysList
watch(() => databaseStore.barangaysList, () => {
  if (databaseStore.barangaysList && Array.isArray(databaseStore.barangaysList)) {
    barangaysList.value = databaseStore.barangaysList;
  } else {
    barangaysList.value = []; // Prevent errors if data is not an array
  }
});

// Watch databaseStore.reportsPerBarangay
watch(() => databaseStore.reportsPerBarangay, () => {
  if (databaseStore.reportsPerBarangay && Array.isArray(databaseStore.reportsPerBarangay)) {
    reportsPerBarangay.value = databaseStore.reportsPerBarangay;
  } else {
    reportsPerBarangay.value = []; // Prevent errors if data is not an array
  }
});

// ====================

// Create a new computed property for the combined list
const combinedList = computed(() => {
  // Ensure both arrays are valid
  if (Array.isArray(barangaysList.value) && Array.isArray(reportsPerBarangay.value)) {
    if (!reportsPerBarangay.value || reportsPerBarangay.value.length === 0) {
      console.log(barangaysList.value)
      return barangaysList.value;
    }

    return barangaysList.value.map(barangay => {
      // Find the corresponding report based on matching id/barangay_id
      const matchingReport = reportsPerBarangay.value.find(report => report.barangay_id === barangay.id);

      return {
        ...barangay, // Spread the barangay properties
        report: matchingReport || null // If found, add report; otherwise, null
      };
    });
  }
  return []; // Return an empty array if data isn't valid
});
// console.log(combinedList.value)
// watch(combinedList, (newCombinedList) => {
//   combinedList.value = newCombinedList;
//   console.log(combinedList.value);
// });
// console.log(combinedList.value)


// ===========================

onMounted(() => {
  databaseStore.fetchData();

  refreshInterval = setInterval(() => {
    databaseStore.fetchData();
    console.log(combinedList.value, '%cBookmark', 'color: blue')
  }, 50000);

  // Handle click event to close dropdown
  document.addEventListener("click", (event) => {
    if (
      openDropdownId.value !== null &&
      !dropdownRefs.value[openDropdownId.value]?.contains(event.target)
    ) {
      closeDropdown();
    }
  });
});

const searchQuery = ref("");

// const filteredBarangays = computed(() => {
//   return barangaysList.value
//     .filter(barangay =>
//       barangay.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//       barangay.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//       barangay.latitude.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//       barangay.longitude.toLowerCase().includes(searchQuery.value.toLowerCase())
//     );
// });
const filteredBarangays = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return combinedList.value.filter(barangay =>
    (barangay.name ?? "").toLowerCase().includes(query) ||
    String(barangay.id ?? "").toLowerCase().includes(query) ||
    String(barangay.latitude ?? "").toLowerCase().includes(query) ||
    String(barangay.longitude ?? "").toLowerCase().includes(query)
  );
});

// Pass The ID To Delete
const formSubmit = (barangay_Id) => {
  axiosClient.delete(`/api/911/barangay-delete/${barangay_Id}`, {
    headers: {
      'x-api-key': import.meta.env.VITE_API_KEY
    }
  })
    .then(response => {
      fetchData();
      console.log('Barangay deleted successfully');
      addToast(response.data.message, 'success', 'check_circle');

    })
    .catch(error => {
      addToast(error.response.data.message, 'error', 'error'); // Add error toast
      console.error(error.response?.data?.errors || 'Failed to delete barangay.', error.response?.data);
      // errors.value = error.response?.data?.errors || 'Failed to delete barangay.';
    });
};

//for dropdown
const openDropdownId = ref(null);
const dropdownRefs = ref([]);
const closeDropdown = () => {
  openDropdownId.value = null;
};
const toggleDropdown = (id) => {
  if (openDropdownId.value === id) {
    openDropdownId.value = null;
  } else {
    openDropdownId.value = id;
  }
};

// -----------------------
const isActionsDropdownOpen = ref(false);
const isFilterDropdownOpen = ref(false);

const closeDropdowns = (event) => {
  if (!event.target.closest("#actionsDropdownButton") && !event.target.closest("#actionsDropdown")) {
    isActionsDropdownOpen.value = false;
  }
  if (!event.target.closest("#filterDropdownButton") && !event.target.closest("#filterDropdown")) {
    isFilterDropdownOpen.value = false;
  }
};
document.addEventListener("click", closeDropdowns);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
// Total pages based on filtered results
const totalPages = computed(() => {
  return Math.ceil(filteredBarangays.value.length / itemsPerPage.value);
});
// Get paginated barangays
const paginatedBarangays = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredBarangays.value.slice(start, end);
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
const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

// generate pdf barangay
const handlePrint = () => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  printWindow.document.write(`
        <html>
            <head>
                <title>Printed Barangays</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-bottom: 20px; 
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #f2f2f2; 
                        font-weight: bold; 
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Barangays Management - Printed Report</h1>
                    <p>Printed on: ${new Date().toLocaleString()}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredBarangays.value.map(report => `
                            <tr>
                                <td>${report.id}</td>
                                <td>${report.name}</td>
                                <td>${report.latitude || 'N/A'}</td>
                                <td>${report.longitude || 'N/A'}</
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="print-footer">
                    <p>Total Barangays: ${filteredBarangays.value.length}</p>
                </div>
            </body>
        </html>
    `);

  printWindow.document.close();

  printWindow.print();

  printWindow.onafterprint = () => {
    printWindow.close();
  };
};

</script>

<template>
  <div class="min-h-screen p-4">
    <!-- Titleee -->
    <div class="mt-6 px-2 flex justify-between">
      <h1 class="text-2xl font-bold dark:text-white">Barangay Management</h1>
    </div>

    <section class="w-full">
      <div class="mt-6">
        <!-- Start coding here -->
        <div
          class="relative shadow-md sm:rounded-lg bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
          <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <div class="w-full md:w-1/2">
              <form class="flex items-center">
                <label for="simple-search" class="sr-only">Search</label>
                <div class="relative w-full">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span class="material-icons text-gray-500 dark:text-gray-300">
                      search
                    </span>
                  </div>
                  <input v-model="searchQuery" type="text" id="simple-search"
                    class="border text-sm rounded-lg block w-full pl-10 p-2 bg-white dark:bg-slate-700 dark:text-white dark:border-black placeholder-gray-500 dark:placeholder-gray-300"
                    placeholder="Search..." />

                </div>
              </form>
            </div>
            <div
              class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">

              <!-- Add Barangay Button -->
              <PopupModal Title="Add a new Barangay" ModalButton="Add Barangay" Icon="home" Classes=""
                :show="isModalOpen" @update:show="isModalOpen = $event"
                ButtonClass="w-full md:w-auto rounded-lg flex items-center justify-center py-2 px-4 text-sm font-medium focus:outline-none bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600">
                <template #modalContent>
                  <div class="p-6">
                    <AddBarangay @close="isModalOpen = false" />
                  </div>
                </template>
              </PopupModal>

              <!--Generate PDF File Button -->
              <div
                class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                <button @click="handlePrint"
                  class="flex items-center justify-center font-medium rounded-lg text-sm px-3 py-2 bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600">
                  Print Barangay
                </button>
              </div>

              <!-- Filter Button -->
              <!-- <button @click="toggleFilters"
                :class="[!isFilterContainerOpen ? 'w-full md:w-auto flex items-center justify-center py-2 px-4  text-sm font-medium rounded-lg border bg-white hover:bg-gray-200 dark:bg-slate-700 dark:border-black dark:text-white dark:hover:bg-slate-600' : 'w-full md:w-auto flex items-center justify-center py-2 px-4  text-sm font-medium rounded-lg border bg-white hover:bg-gray-500 dark:bg-slate-900 dark:border-black dark:text-white dark:hover:bg-slate-600']"
                id="filterDropdownButton">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 w-4 mr-2" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clip-rule="evenodd" />
                </svg>
                Date Filter
              </button> -->
            </div>
          </div>

          <div class="">
            <table class="w-full text-sm text-left">
              <thead class="text-xs uppercase dark:bg-slate-900 dark:text-gray-300 bg-teal-300 text-gray-800">
                <tr>
                  <th scope="col" class="px-4 py-3 ">ID</th>
                  <th scope="col" class="px-4 py-3">Name</th>
                  <th scope="col" class="px-4 py-3">Longitude</th>
                  <th scope="col" class="px-4 py-3">Latitude</th>
                  <th scope="col" class="px-4 py-3">No. of Cases</th>
                  <th scope="col" class="px-4 py-3">Visit Barangay</th>
                  <th scope="col" class="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="barangay in paginatedBarangays" :key="barangay.id"
                  class="dark:bg-slate-800 dark:hover:bg-slate-700 bg-sky-50 hover:bg-gray-200">

                  <td class="px-4 py-3 ">{{ barangay.id }}</td>
                  <td class="px-4 py-3 ">{{ barangay.name }}</td>
                  <td class="px-4 py-3">
                    <span v-if="barangay.longitude">{{ barangay.longitude }}</span>
                    <Badge v-else Message="No Data for Longitude" />
                  </td>
                  <td class="px-4 py-3">
                    <span v-if="barangay.latitude">{{ barangay.latitude }}</span>
                    <Badge v-else Message="No Data for Latitude" />
                  </td>
                  <td class="px-4 py-3">
                    <span v-if="barangay.report && barangay.report.total_reports">{{ barangay.report.total_reports }}</span>
                    <Badge v-else Message="No Data for No. of Cases" />
                  </td>
                  <td class="px-4 py-3 text-blue-800 hover:text-blue-600 hover:underline font-bold">
                    <RouterLink :to="`/barangay-statistics/${barangay.id}`">View Incidents</RouterLink>
                    <ToolTip :Information="`Click to visit barangay and view incidents`" />
                  </td>
                  <td class="px-4 py-3 flex items-center relative">
                    <!-- Dropdown Button -->

                    <button @click.stop="toggleDropdown(barangay.id)"
                      class="inline-flex items-center p-0.5 text-sm font-medium rounded-lg" type="button">
                      <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                    <!-- Dropdown Menu -->
                    <div v-if="openDropdownId === barangay.id" ref="dropdownRefs"
                      class="absolute z-[10] w-44 mt-2 top-full left-0 shadow-sm border rounded-md bg-white dark:bg-slate-700"
                      @click.stop>

                      <!-- Dropdown Items Container -->
                      <div class="py-2 text-sm flex flex-col w-full items-center">
                        <!-- Edit Button -->
                        <PopupModal Title="Edit Barangay" ModalButton="Edit" Icon="edit" Classes="" :show="isModalOpen"
                          @update:show="isModalOpen = $event"
                          ButtonClass="inline-flex w-full block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600">
                          <template #modalContent>
                            <div>
                              <EditBarangay :barangay="barangay" @close="isModalOpen = false" />
                            </div>
                          </template>
                        </PopupModal>

                        <!-- Delete Button -->
                        <PopupModal Title="Are you sure you want to delete this barangay?" ModalButton="Delete"
                          Icon="cancel" Classes="" :show="isDeleteModalOpen" @update:show="isDeleteModalOpen = $event"
                          ButtonClass="inline-flex w-full block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600">
                          <template #modalContent>
                            <div class="p-6 space-x-2">
                              <PrimaryButton @click="openDropdownId = null" name="Cancel"
                                class="bg-gray-500 hover:bg-gray-600 text-gray-100 shadow-md" />
                              <PrimaryButton @click.prevent="formSubmit(barangay.id)" name="Delete"
                                class="bg-red-500 hover:bg-red-600 text-gray-100 shadow-md" />
                            </div>
                          </template>
                        </PopupModal>

                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
          <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
            <span class="text-sm font-normal">
              Showing
              <span class="font-semibold">{{ filteredBarangays.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
              }}</span>
              to
              <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, filteredBarangays.length) }}</span>
              of
              <span class="font-semibold">{{ filteredBarangays.length }}</span>
            </span>

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
    </section>
  </div>
</template>
