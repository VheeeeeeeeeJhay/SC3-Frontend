<script setup>
import { ref, onMounted, computed, watch, inject, onUnmounted } from 'vue';
import AddBarangay from './AddBarangay.vue';
import EditBarangay from './EditBarangay.vue';
import axiosClient from '../../axios.js';
import { RouterLink } from 'vue-router';
import Badge from '../../components/Badge.vue';
import { useArrayStore } from '../../stores/arrayStore';
import { useDatabaseStore } from '../../stores/databaseStore';
import { usePagination } from '../../composables/usePagination';


// Initialize database store
const databaseStore = useDatabaseStore();
// Initialize variables
let refreshInterval = null;
onMounted(() => {
  databaseStore.fetchData();

  refreshInterval = setInterval(() => {
    databaseStore.fetchData();
    console.log(combinedList.value, '%cBookmark', 'color: blue')
  }, 50000);

});

onUnmounted(() => {
  // Clear the interval when the component is unmounted or page is reloaded
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

//date range
import DateRangePicker from "../../components/DateRangePicker.vue";

const startDate = ref(null);
const endDate = ref(null);

const updateDateRange = ({ start, end }) => {
    startDate.value = start;
    endDate.value = end;
    console.log("Date Range:", startDate.value, endDate.value);
};

const store = useArrayStore();
const passingData = (barangay) => {
    store.setBarangayData(barangay);
    console.log(store.getBarangayData(),'=================================================================');
}

const message = ref('');
const errors = ref('');

// const barangaysList = ref([]);
// const reportsPerBarangay = ref([]);

//for toast
const addToast = inject('addToast');

const computedProperties = {
  barangaysList: "barangays",
  reports: "reports",
};

const {
  barangaysList,
  reports,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);



// Create a new computed property for the combined list
const combinedList = computed(() => {
  if (!Array.isArray(barangaysList.value) || !Array.isArray(reports.value)) {
    return [];
  }

  const start = startDate.value ? new Date(startDate.value) : null;
  const end = endDate.value ? new Date(endDate.value) : null;

  return barangaysList.value.map(barangay => {
    const filteredReports = reports.value.filter(report => {
      const reportDate = new Date(report.date_received);
      const isInRange =
        (!start || reportDate >= start) &&
        (!end || reportDate <= end);
      return report.barangay_id === barangay.id && isInRange;
    });

    return {
      ...barangay,
      reports: filteredReports,
      reportCount: filteredReports.length
    };
  });
});





onMounted(() => {
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
      console.log('Barangay deleted successfully');
      addToast(response.data.message, 'success', 'check_circle');
      databaseStore.fetchData();
      refreshInterval = setInterval(() => {
            databaseStore.fetchData(); // runs again every 50s
        }, 50000);
      isDeleteModalOpen.value = false;
    })
    .catch(error => {
      console.error('Error deleting data:', error);
      addToast(error.response.data.message, 'error', 'error'); // Add error toast
      errors.value = error.response?.data?.message || 'Something went wrong!';
    })
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

// // Pagination
// const currentPage = ref(1);
// const itemsPerPage = ref(10);
// // Total pages based on filtered results
// const totalPages = computed(() => {
//   return Math.ceil(filteredBarangays.value.length / itemsPerPage.value);
// });
// // Get paginated barangays
// const paginatedBarangays = computed(() => {
//   const start = (currentPage.value - 1) * itemsPerPage.value;
//   const end = start + itemsPerPage.value;
//   return filteredBarangays.value.slice(start, end);
// });
// // Pagination controls
// const nextPage = () => {
//   if (currentPage.value < totalPages.value) {
//     currentPage.value++;
//   }
// };
// const prevPage = () => {
//   if (currentPage.value > 1) {
//     currentPage.value--;
//   }
// };
// const goToPage = (page) => {
//   if (page >= 1 && page <= totalPages.value) {
//     currentPage.value = page;
//   }
// };
// // Reset to first page when searching
// watch(searchQuery, () => {
//   currentPage.value = 1;
// });

// const maxVisiblePages = 3;

// const paginationStart = computed(() => {
//   if (currentPage.value <= Math.floor(maxVisiblePages / 2)) {
//     return 1;
//   } else if (currentPage.value + Math.floor(maxVisiblePages / 2) >= totalPages.value) {
//     return Math.max(1, totalPages.value - maxVisiblePages + 1);
//   } else {
//     return currentPage.value - Math.floor(maxVisiblePages / 2);
//   }
// });

// const paginationEnd = computed(() => {
//   return Math.min(totalPages.value, paginationStart.value + maxVisiblePages - 1);
// });

// const visiblePages = computed(() => {
//   return Array.from({ length: paginationEnd.value - paginationStart.value + 1 }, (_, i) => paginationStart.value + i);
// });


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
} = usePagination(filteredBarangays, { itemsPerPage: 10, maxVisiblePages: 3 })

watch(searchQuery, () => resetPage())



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
    <!-- Title -->
    <div class="mt-6 px-2 flex justify-between">
      <h1 class="text-2xl font-bold dark:text-white">Barangay Management</h1>
      <div
        class="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-end flex-shrink-0">
        <DateRangePicker class="max-w-xs" @dateRangeSelected="updateDateRange" />
      </div>
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

              <!-- Generate PDF File Button -->
              <div
                class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                <button @click="handlePrint"
                  class="flex items-center justify-center font-medium rounded-lg text-sm px-3 py-2 bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600">
                  Print Barangay
                </button>
              </div>

            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-xs uppercase dark:bg-slate-950 dark:text-gray-300 bg-teal-300 text-gray-800">
                <tr>
                  <th scope="col" class="px-4 py-3 text-center">ID</th>
                  <th scope="col" class="px-4 py-3 text-center">Name</th>
                  <th scope="col" class="px-4 py-3 text-center">Coordinates</th>
                  <th scope="col" class="px-4 py-3 text-center">No. of Cases</th>
                  <th scope="col" class="px-4 py-3 text-center">Visit Barangay</th>
                  <th scope="col" class="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="barangay in paginatedData" :key="barangay.id"
                  class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b dark:border-gray-700">
                  <td class="px-4 py-3 text-center">{{ barangay.id }}</td>
                  <td class="px-4 py-3 text-center">{{ barangay.name }}</td>
                  <td class="px-4 py-3 text-center">
                    Long: <span v-if="barangay.longitude" class="font-bold">{{ barangay.longitude }}</span>
                    <br>
                    Lat: <span v-if="barangay.latitude" class="font-bold">{{ barangay.latitude }}</span>
                  </td>
                  <td class="px-4 py-3 text-center"> 
                    <span v-if="barangay.reportCount">{{barangay.reportCount  }}</span>
                    <Badge v-else Message="No Data for No. of Cases" />
                  </td>
                  <td class="px-4 py-3 text-center text-teal-800 hover:text-teal-600 hover:underline font-bold">
                    <RouterLink @click="passingData(barangay)" :to="`/barangay-statistics/${barangay.id}`">View Incidents</RouterLink>
                    <ToolTip :Information="`Click to visit barangay and view incidents`" />
                  </td>
                  <td class="px-4 py-3 flex items-center justify-center relative">
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
                      class="absolute z-[10] w-44 top-full right-0 shadow-sm border rounded-md bg-white dark:bg-slate-700"
                      @click.stop>
                      <div class="py-2 text-sm flex flex-col w-full items-center">
                        <!-- Edit Button -->
                        <PopupModal class="" Title="Edit Barangay" ModalButton="Edit" Icon="edit" Classes="" :show="isModalOpen"
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
                            <div class="p-6 flex gap-3">
                              <PrimaryButton @click="openDropdownId = null" name="Cancel"
                                class="w-1/2 bg-gray-500 hover:bg-gray-600 text-gray-100 shadow-md" />
                              <PrimaryButton @click.prevent="formSubmit(barangay.id)" name="Delete"
                                class="w-1/2 bg-red-500 hover:bg-red-600 text-gray-100 shadow-md" />
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

              <li v-if="visiblePages[0] > 1">
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

              <li v-if="visiblePages[visiblePages.length - 1] < totalPages">
                <button disabled class="px-3 py-1 border bg-gray-100 dark:bg-gray-700">...</button>
                <button @click="goToPage(totalPages)"
                  class="px-3 py-1 border hover:bg-gray-300 dark:hover:bg-slate-600">{{ totalPages }}</button>
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
