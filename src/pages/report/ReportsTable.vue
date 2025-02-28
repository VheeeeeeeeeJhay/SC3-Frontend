<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axiosClient from '../../axios.js';
import { RouterLink } from 'vue-router';
import PrimaryButton from '../../components/PrimaryButton.vue';
import { useThemeStore } from '../../stores/themeStore';
// For dark mode
const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "bg-slate-800 border border-black text-white  "
    : "bg-sky-50 border border-gray-200 text-gray-800 shadow-sm ";
});
// Hover styles (separate for reusability)
const hoverClasses = computed(() => {
  return themeStore.isDarkMode 
  ? "border border-black hover:bg-slate-700 hover:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:outline-none" 
  : "border border-gray-700 hover:bg-sky-100 hover:border-gray-500 focus:ring-2 focus:ring-sky-400 focus:outline-none";
});

// Dropdown base styles
const dropMenuClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "hover:bg-slate-600" : "hover:bg-sky-100"
});


const reports = ref([]);
const classifications = ref([]);
const searchQuery = ref("");
const isLoading = ref(false);

const selectedClassifications = ref([]);

// Computed property for dynamic search and filtering
const filteredReports = computed(() => {
  return reports.value.filter(report => {
    const matchesSearch = searchQuery.value
      ? report.source.sources.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        report.assistance.assistance.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        report.incident.type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        report.actions.actions.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true;

    const matchesClassification = selectedClassifications.value.length === 0 || 
      selectedClassifications.value.includes(report.assistance_id);

    return matchesSearch && matchesClassification;
  });
});

onMounted(() => {
    isLoading.value = true;
    axiosClient.get('/api/911/report-display', {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
    .then((res) => {
        setTimeout(() => {
            reports.value = res.data[0]; // Assuming reports are in the first index
            classifications.value = res.data[1]; // Assuming classifications are in the second index
            isLoading.value = false;
        }, 1500);
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        errorMessage.value = 'Failed to load barangays. Please try again later.';
        isLoading.value = false;
    });


// ------------------------------------------
    document.addEventListener("click", (event) => {
        if (
            openDropdownId.value !== null &&
            !dropdownRefs.value[openDropdownId.value]?.contains(event.target)
        ) {
      closeDropdown();
    }
  });
});

// -----------------------
const openDropdownId = ref(null);

const dropdownRefs = ref([]);
const closeDropdown = () => {
    openDropdownId.value = null;
};
const toggleDropdown = (transactionId) => {
    openDropdownId.value = openDropdownId.value === transactionId ? null : transactionId;
};


const filterDropdown = ref(false);


// -----------------------
const isActionsDropdownOpen = ref(false);
const isFilterDropdownOpen = ref(false);

const toggleActionsDropdown = () => {
  isActionsDropdownOpen.value = !isActionsDropdownOpen.value;
};

const toggleFilterDropdown = () => {
  isFilterDropdownOpen.value = !isFilterDropdownOpen.value;
};

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
  return Math.ceil(filteredReports.value.length / itemsPerPage.value);
});

// Get paginated reports
const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  
  return filteredReports.value.slice(start, end);
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

// Delete A Report
const errors = ref('');

const formSubmit = (report_Id) => {
    errors.value = ''; // 🔹 Reset errors before making a request
    axiosClient.delete(`/api/911/report-delete/${report_Id}`, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
    .then(() => {
        // Remove the deleted barangay from the list without refreshing the page
        reports.value = reports.value.filter(b => b.id !== report_Id);
        console.log('Report deleted successfully');
    })
    .catch(error => {
        console.error('Error deleting report:', error.response?.data);
        errors.value = error.response?.data?.errors || 'Failed to delete report.';
    });
};
</script>

<template>
    <section class="w-full min-h-screen">
        <div class="mt-6 px-4 w-full" >
            <!-- Start coding here -->
            <div class="relative shadow-md sm:rounded-lg" :class="themeClasses">
                <div
                    class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                    <div class="w-full md:w-1/2">
                        <form class="flex items-center">
                            <label for="simple-search" class="sr-only">Search</label>
                            <div class="relative w-full">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span class="material-icons">
                                        search
                                    </span>
                                </div>
                                <input 
                                v-model="searchQuery"
                                type="text" 
                                id="simple-search"
                                class="border text-sm rounded-lg block w-full pl-10 p-2"
                                :class="hoverClasses"
                                placeholder="Search..."
                                />
                            </div>
                        </form>
                    </div>
                    <div
                        class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0" >
                        <RouterLink :to="{ name: 'ReportForm'}">
                            <button type="button"
                                class="flex items-center justify-center font-medium rounded-lg text-sm px-3 py-1" :class="hoverClasses">
                                <span class="material-icons">
                                    add
                                </span>
                                Add a New Report
                            </button>
                        </RouterLink>
                        
                        <div class="flex items-center space-x-3 w-full md:w-auto relative">
                            <!-- Actions Dropdown Button -->
                            <!-- <button
                            @click="toggleActionsDropdown"
                            class="border rounded-lg px-3 py-1 flex items-center"
                            :class="hoverClasses"
                            id="actionsDropdownButton"
                            >
                            <svg class="-ml-1 mr-1.5 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path
                                clip-rule="evenodd"
                                fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                />
                            </svg>
                            Actions
                            </button> -->

                            <!-- Actions Dropdown Menu -->
                            <!-- <div
                            id="actionsDropdown"
                            v-show="isActionsDropdownOpen"
                            class="absolute top-full left-0 z-10 w-44 bg-white rounded shadow divide-y divide-gray-100 dark:divide-gray-600"
                            >
                                <ul class="py-1 text-sm">
                                    <li>
                                    <a href="#" class="block py-2 px-4">Mass Edit</a>
                                    </li>
                                </ul>
                                <div class="py-1">
                                    <a href="#" class="block py-2 px-4 text-sm">Delete all</a>
                                </div>
                            </div> -->

                            <!-- Filter Dropdown Button -->
                            <button
                            @click="toggleFilterDropdown"
                            class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium focus:outline-none rounded-lg border"
                            :class="hoverClasses"
                            id="filterDropdownButton"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                fill-rule="evenodd"
                                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                clip-rule="evenodd"
                                />
                            </svg>
                            Filter
                            <svg class="-mr-1 ml-1.5 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path
                                clip-rule="evenodd"
                                fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                />
                            </svg>
                            </button>

                            <!-- Filter Dropdown Menu -->
                            <div
                            id="filterDropdown"
                            v-show="isFilterDropdownOpen"
                            class="absolute top-full left-0 z-10 w-48 p-3 rounded-lg shadow"
                            :class="themeStore.isDarkMode ? 'bg-slate-700' : 'bg-white'"
                            >
                            <h6 class="mb-3 text-sm font-medium">Choose Classification</h6>
                                <ul class="space-y-2 text-sm">
                                    <li v-for="classification in classifications" :key="classification.id" class="flex items-center">
                                        <input
                                          type="checkbox"
                                          :id="classification.id"
                                          :value="classification.id"
                                          v-model="selectedClassifications"
                                          class="w-4 h-4"
                                        />
                                        <label :for="classification.id" class="ml-2 text-sm font-medium">{{ classification.assistance }}</label>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="">
                    <!-- render loading animation before displaying datatable -->
                    <div v-if="isLoading" class="flex justify-center">
                        <div role="status">
                            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                    <table v-else class="w-full text-sm text-left">
                        <thead class="text-xs uppercase" :class="themeStore.isDarkMode ? 'bg-slate-700' : 'bg-teal-300'">
                            <tr>
                                <th scope="col" class="px-4 py-3">ID</th>
                                <th scope="col" class="px-4 py-3">Source</th>
                                <th scope="col" class="px-4 py-3">Case Classification</th>
                                <th scope="col" class="px-4 py-3">Incident/Case</th>
                                <th scope="col" class="px-4 py-3">Assistance</th>
                                <th scope="col" class="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="report in paginatedReports" :key="report.id">
                                <td class="px-4 py-3">{{ report.id }}</td>
                                <td class="px-4 py-3">{{ report.source.sources }}</td>
                                <td class="px-4 py-3">{{ report.assistance.assistance }}</td>
                                <td class="px-4 py-3">{{ report.incident.type }}</td>
                                <td class="px-4 py-3">{{ report.actions.actions }}</td>
                                <td class="px-4 py-3 flex items-center relative">
                                    <!-- Dropdown Button -->
                                    <button @click.stop="toggleDropdown(report.id)"
                                        class="inline-flex items-center p-0.5 text-sm font-medium rounded-lg"
                                        type="button">
                                        <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                    </button>

                                    <!-- Dropdown Menu -->
                                    <div v-if="openDropdownId === report.id" ref="dropdownRefs" :class="themeStore.isDarkMode ? 'bg-slate-700' : 'bg-white'"
                                        class="absolute z-[10] w-44 mt-2 top-full left-0 shadow-sm border rounded-md">
                                        <ul class="py-2 text-sm">
                                            <li>
                                                <RouterLink :to="{ name: 'ReportViewDetails', params: { id: report.id } }"
                                                    class="block px-4 py-2" :class="dropMenuClasses">View Details</RouterLink>
                                            </li>
                                            <li>
                                                <RouterLink :to="{ name: 'EditReport', params: { id: report.id } }"
                                                    class="block px-4 py-2 " :class="dropMenuClasses">Edit Report</RouterLink>
                                            </li>
                                            <li class="block px-2" :class="dropMenuClasses">
                                                <PrimaryButton @click="formSubmit(report.id)" name="Delete Report" />
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
                    <span class="text-sm font-normal">
                        Showing
                        <span class="font-semibold">{{ filteredReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}</span>
                        to
                        <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, filteredReports.length) }}</span>
                        of
                        <span class="font-semibold">{{ filteredReports.length }}</span>
                    </span>
                    
                    <ul class="inline-flex items-stretch -space-x-px">
                        <!-- Previous Page -->
                        <li>
                            <button @click="prevPage" :disabled="currentPage === 1"
                                class="px-3 py-1 rounded-l-lg border" :class="hoverClasses">
                                Previous
                            </button>
                        </li>
                        <li v-for="page in totalPages" :key="page">
                            <button 
                                @click="goToPage(page)" 
                                :class="['px-3 py-1 border', currentPage === page ? 'bg-teal-500 text-white border-black' : hoverClasses]">
                                {{ page }}
                            </button>


                        </li>
                        <li>
                            <button @click="nextPage" :disabled="currentPage === totalPages"
                                class="px-3 py-1 rounded-r-lg border" :class="hoverClasses">
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>

            </div>
        </div>
    </section>
</template>