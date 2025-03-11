<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axiosClient from '../../axios.js';
import { RouterLink } from 'vue-router';
import PrimaryButton from '../../components/PrimaryButton.vue';
import Loader1 from '../../components/Loader1.vue';
import Toast from '../../components/Toast.vue';
import PopupModal from '../../components/PopupModal.vue';
import Badge from '../../components/Badge.vue';

const reports = ref([]);
const classifications = ref([]);
const searchQuery = ref("");
const isLoading = ref(false);

const selectedClassifications = ref([]);


const fetchData = async () => {
    try {
        isLoading.value = true;
        await axiosClient.get('/api/911/report-display', {
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY
            }
        })
        .then((res) => {
            setTimeout(() => {
                reports.value = res.data[0]; // Assuming reports are in the first index
                classifications.value = res.data[1]; // Assuming classifications are in the second index
                isLoading.value = false;
            });
        })
        .catch((error) => {
            console.log(error.response.data.message);
            // console.error('Error fetching data:', error);
            // errors.value = 'Failed to load barangays. Please try again later.';
            isLoading.value = false;
        });
    } catch (error) {
        console.log(error.response.data.message);
    }
};

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
    fetchData();

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

// Delete A Report
const errors = ref('');
const success = ref('');

const formSubmit = async (report_Id) => {
    // errors.value = ''; // 🔹 Reset errors before making a request
    await axiosClient.delete(`/api/911/report-delete/${report_Id}`, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
    .then(() => {
        // Remove the deleted barangay from the list without refreshing the page
        reports.value = reports.value.filter(b => b.id !== report_Id);
        success.value = 'Report deleted successfully';
    })
    .catch(error => {
        console.error('Error deleting report:', error.response?.data);
        errors.value = error.response?.data?.errors || 'Failed to delete report.';
    });
    
};
</script>

<template>
    <section class="w-full min-h-screen">
        <!-- Titleee -->
        <div class="mt-6 px-2 flex justify-between">
            <h1 class="text-2xl font-bold dark:text-white">Reports Management</h1>
        </div>

        <div class="mt-6 px-4 w-full">
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
                    <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                        <RouterLink :to="{ name: 'AddReport' }">
                            <button type="button"
                                class="flex items-center justify-center font-medium rounded-lg text-sm px-3 py-1 bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600">
                                <span class="material-icons">add</span>
                                Add a New Report
                            </button>
                        </RouterLink>

                        <div class="flex items-center space-x-3 w-full md:w-auto relative">
                            <button @click="toggleFilterDropdown"
                                class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium rounded-lg border bg-white hover:bg-gray-200 dark:bg-slate-700 dark:border-black dark:text-white dark:hover:bg-slate-600"
                                id="filterDropdownButton">
                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                        clip-rule="evenodd" />
                                </svg>
                                Filter
                            </button>

                            <div id="filterDropdown" v-show="isFilterDropdownOpen"
                                class="absolute top-full left-0 z-10 w-48 p-3 rounded-lg shadow bg-white dark:bg-slate-700 dark:text-white">
                                <h6 class="mb-3 text-sm font-medium">Choose Classification</h6>
                                <ul class="space-y-2 text-sm">
                                    <li v-for="classification in classifications" :key="classification.id" class="flex items-center">
                                        <input type="checkbox" :id="classification.id" :value="classification.id"
                                            v-model="selectedClassifications" class="w-4 h-4" />
                                        <label :for="classification.id" class="ml-2 text-sm font-medium">{{ classification.assistance }}</label>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="isLoading" class="flex justify-center"><Loader1 /></div>

                <table v-else class="w-full text-sm text-left">
                    <thead class="text-xs uppercase bg-teal-300 text-gray-800 dark:bg-slate-950 dark:text-gray-300">
                        <tr>
                            <th scope="col" class="px-4 py-3">ID</th>
                            <th scope="col" class="px-4 py-3">Source</th>
                            <th scope="col" class="px-4 py-3">Case Classification</th>
                            <th scope="col" class="px-4 py-3">Incident/Case</th>
                            <th scope="col" class="px-4 py-3">Assistance</th>
                            <th scope="col" class="px-4 py-3">Location</th>
                            <th scope="col" class="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="report in paginatedReports" :key="report.id"
                            class="bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                            <td class="px-4 py-3">{{ report.id }}</td>
                            <td class="px-4 py-3">{{ report.source.sources }}</td>
                            <td class="px-4 py-3">{{ report.assistance.assistance }}</td>
                            <td class="px-4 py-3">{{ report.incident.type }}</td>
                            <td class="px-4 py-3">{{ report.actions.actions }}</td>
                            <td class="px-4 py-3">{{ report.barangay.name }}</td>
                            <td class="px-4 py-3 flex items-center relative">
                                <button @click.stop="toggleDropdown(report.id)" class="inline-flex items-center p-0.5 text-sm font-medium rounded-lg">
                                    <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    </svg>
                                </button>

                                <div v-if="openDropdownId === report.id" ref="dropdownRefs"
                                    class="absolute z-10 w-44 mt-2 top-full left-0 shadow-sm border rounded-md bg-white dark:bg-slate-700">
                                    <ul class="py-2 text-sm">
                                        <li>
                                            <RouterLink :to="{ name: 'ReportViewDetails', params: { id: report.id } }"
                                                class="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600">
                                                View Details
                                            </RouterLink>
                                        </li>
                                        <li>
                                            <RouterLink :to="{ name: 'EditReport', params: { id: report.id } }"
                                                class="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600">
                                                Edit Report
                                            </RouterLink>
                                        </li>
                                        <li class="block px-2">
                                            <PrimaryButton @click.prevent="formSubmit(report.id)" name="Delete Report" />
                                        </li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
                    <span class="text-sm font-normal">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredReports.length) }} of {{ filteredReports.length }}</span>

                    <!-- <ul class="inline-flex items-stretch -space-x-px">
                        <li><button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 rounded-l-lg border hover:bg-gray-300 dark:hover:bg-slate-600">Previous</button></li>
                        <li v-for="page in totalPages" :key="page">
                            <button @click="goToPage(page)"
                                :class="['px-3 py-1 border', currentPage === page ? 'bg-slate-500 text-white border-black' : 'hover:bg-gray-300 dark:hover:bg-slate-600']">
                                {{ page }}
                            </button>
                        </li>
                        <li><button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 rounded-r-lg border hover:bg-gray-300 dark:hover:bg-slate-600">Next</button></li>
                    </ul> -->
                    <ul class="inline-flex items-stretch -space-x-px">
                        <li>
                            <button @click="prevPage" :disabled="currentPage === 1"
                                class="px-3 py-1 rounded-l-lg border hover:bg-gray-300 dark:hover:bg-slate-600">
                                Previous
                            </button>
                        </li>
                        
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
</template>
