<script setup>
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosClient from '../../axios.js';
import { computed, watch } from 'vue';
import viewMap from '../../components/Maps/viewMap.vue';
import ChooseReportType from '../../components/modal/ChooseReportType.vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import DateRangePicker from "../../components/DateRangePicker.vue";



const router = useRouter();
const id = String(useRoute().params.id);
const isLoading = ref(false);
console.log(id);

const reports = ref([]);
const barangay = ref([]);
const errors = ref([]);
const startDate = ref(null);
const endDate = ref(null);

const databaseStore = useDatabaseStore();

let refreshInterval = null;


const fetchBarangay = async () => {
    await axiosClient.get(`/api/911/barangay-edit/${id}`, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
        .then((res) => {
            console.log(res.data);
            barangay.value = res.data;
            console.log(barangay.value);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            errors.value = 'Failed to load data. Please try again later.';
        })
        .finally(() => {
            isLoading.value = false;
        });
}

const fetchData = async () => {
    isLoading.value = true;
    await axiosClient.get('/api/911/barangay-reports/' + id, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
        .then((res) => {
            reports.value = res.data;
            console.log(reports.value);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            errors.value = 'Failed to load data. Please try again later.';
        })
        .finally(() => {
            isLoading.value = false;
        });
}

onMounted(() => {
    isLoading.value = true;
    fetchBarangay();
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


// const filterDropdown = ref(false);


// -----------------------
const isActionsDropdownOpen = ref(false);
const isFilterDropdownOpen = ref(false);
const isActionsFilterDropdownOpen = ref(false);
const isUrgencyFilterDropdownOpen = ref(false);

const toggleActionsDropdown = () => {
    isActionsDropdownOpen.value = !isActionsDropdownOpen.value;
};

const toggleFilterDropdown = () => {
    isFilterDropdownOpen.value = !isFilterDropdownOpen.value;
};
const toggleUrgencyFilterDropdown = () => {
    isUrgencyFilterDropdownOpen.value = !isUrgencyFilterDropdownOpen.value;
};
const toggleActionsFilterDropdown = () => {
    isActionsFilterDropdownOpen.value = !isActionsFilterDropdownOpen.value;
};

const closeDropdowns = (event) => {
    if (!event.target.closest("#actionsDropdownButton") && !event.target.closest("#actionsDropdown")) {
        isActionsDropdownOpen.value = false;
    }
    if (!event.target.closest("#filterDropdownButton") && !event.target.closest("#filterDropdown")) {
        isFilterDropdownOpen.value = false;
    }
    if (!event.target.closest("#actionsFilterDropdownButton") && !event.target.closest("#actionsFilterDropdown")) {
        isActionsFilterDropdownOpen.value = false;
    }
    if (!event.target.closest("#urgencyFilterDropdownButton") && !event.target.closest("#urgencyFilterDropdown")) {
        isUrgencyFilterDropdownOpen.value = false;
    }
};

document.addEventListener("click", closeDropdowns);



const searchQuery = ref("");

// Computed property for dynamic search and filtering
const filteredReports = computed(() => {
    return reports.value.filter(report => {
        const reportId = String(report.id)?.toLowerCase() || "";
        const reportTime = String(report.time)?.toLowerCase() || "";
        const reportDateReceived = String(report.date_received)?.toLowerCase() || "";
        const reportAssistance = String(report.assistance.assistance)?.toLowerCase() || "";
        const reportIncidentType = String(report.incident.type)?.toLowerCase() || "";
        const reportLandmark = String(report.landmark)?.toLowerCase() || "";
        const query = searchQuery.value.toLowerCase();

        // Match search query
        const matchesSearch = query
            ? reportId.includes(query) ||
            reportTime.includes(query) ||
            reportDateReceived.includes(query) ||
            reportAssistance.includes(query) ||
            reportIncidentType.includes(query) ||
            reportLandmark.includes(query)
            : true;

        const reportDate = new Date(report.date_received); // Replace `report.date` with your actual date field

        const matchesDateRange =
            (!startDate.value || reportDate >= new Date(startDate.value)) &&
            (!endDate.value || reportDate <= new Date(endDate.value));

        return matchesSearch && matchesDateRange;
    });
});

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

// show all filter
const isFilterContainerOpen = ref(false);
const toggleFilters = () => {
    isFilterContainerOpen.value = !isFilterContainerOpen.value;
};

const updateDateRange = ({ start, end }) => {
  startDate.value = start;
  endDate.value = end;
  console.log("Date Range:", startDate.value, endDate.value);
};
</script>

<template>
    <div class="mt-6 flex justify-between p-4">
        <h1 class="text-2xl font-bold dark:text-white">View Barangay and Related Incidents</h1>
        <Button type="button" name="Back" @click.prevent="router.back()"
            class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
            <span class="material-icons mr-2"> arrow_back </span>
            Back
        </Button>
    </div>
    <div class="p-4">

        <!--  -->
        <div
            class="mt-6 p-4 h-4/5 border border-gray-200 dark:border-black rounded-lg dark:bg-slate-800 dark:text-white">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Barangay Details</h2>
            <div class="flex justify-evenly">
                <div><span class="font-semibold my-2">Name:</span> {{ barangay.name }}</div>
                <div><span class="font-semibold my-2">Longitude:</span> {{ barangay.longitude }}</div>
                <div><span class="font-semibold my-2">Latitude:</span> {{ barangay.latitude }}</div>
            </div>
        </div>

        <!--  -->
        <div class="mx-20 mt-6 rounded-lg">
            <viewMap :viewID="id" />
        </div>

        <!--  -->
        <div class="mt-6 w-full">
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

                    <div
                        class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                        

                        <div class="flex items-center space-x-2">

                            <!-- report button -->
                            <div
                                class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                                <button @click="handlePrint"
                                    class="flex items-center justify-center font-medium rounded-lg text-sm px-3 py-2 bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600">
                                    Print Reports
                                </button>
                            </div>
                        </div>
                        
                        <button @click="toggleFilters"
                            :class="[!isFilterContainerOpen ? 'w-full md:w-auto flex items-center justify-center py-2 px-4  text-sm font-medium rounded-lg border bg-white hover:bg-gray-200 dark:bg-slate-700 dark:border-black dark:text-white dark:hover:bg-slate-600' : 'w-full md:w-auto flex items-center justify-center py-2 px-4  text-sm font-medium rounded-lg border bg-white hover:bg-gray-500 dark:bg-slate-900 dark:border-black dark:text-white dark:hover:bg-slate-600']"
                            id="filterDropdownButton">
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 w-4 mr-2"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                    clip-rule="evenodd" />
                            </svg>
                            Filters
                        </button>

                        
                    </div>
                </div>

                <!-- Filter Button -->
                <div>
                    <div v-show="isFilterContainerOpen" class="flex flex-wrap justify-end mb-3 space-x-2">

                        <!-- Date Range Filter -->
                        <div class="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-end flex-shrink-0">
                            <DateRangePicker class="max-w-xs"  @dateRangeSelected="updateDateRange"/>
                        </div>

                        <!-- Assistance Filter -->
                        <div class="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-end flex-shrink-0">
                            <div class="flex items-center md:w-auto relative">
                                <button @click="toggleFilterDropdown"
                                    class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
                                    id="filterDropdownButton">
                                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 w-4 mr-2"
                                        viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Assistance
                                </button>

                                <div id="filterDropdown" v-show="isFilterDropdownOpen"
                                    class="absolute top-full right-0 z-10 w-48 p-3 rounded-lg shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden">
                                    <h6 class="mb-3 text-sm font-medium">Choose Assistance</h6>
                                    <ul class="space-y-2 text-sm">
                                        <li v-for="classification in classifications" :key="classification.id"
                                            class="flex items-center">
                                            <input type="checkbox" :id="classification.id" :value="classification.id"
                                                v-model="selectedClassifications" class="w-4 h-4" />
                                            <label :for="classification.id" class="ml-2 text-sm font-medium">{{
                                                classification.assistance }}</label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Urgency Filter -->
                        <div
                            class="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-end flex-shrink-0">

                            <div class="flex items-center md:w-auto relative">
                                <button @click="toggleUrgencyFilterDropdown"
                                    class="w-full md:w-auto flex items-center justify-center py-2 px-4  text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
                                    id="urgencyFilterDropdownButton">
                                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 w-4 mr-2"
                                        viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Urgency
                                </button>

                                <div id="urgencyFilterDropdown" v-show="isUrgencyFilterDropdownOpen"
                                    class="absolute top-full right-0 z-10 w-48 p-3 rounded-lg shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden">
                                    <h6 class="mb-3 text-sm font-medium">Choose Urgency</h6>
                                    <ul class="space-y-2 text-sm">
                                        <li v-for="urgency in urgencies" :key="urgency.id" class="flex items-center">
                                            <input type="checkbox" :id="'urgency-' + urgency.id" :value="urgency.id"
                                                v-model="selectedUrgencies" class="w-4 h-4" />
                                            <label :for="'urgency-' + urgency.id" class="ml-2 text-sm font-medium">{{
                                                urgency.urgency }}</label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Assistance Filter -->
                        <div
                            class="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-end flex-shrink-0">

                            <div class="flex items-center md:w-auto relative">
                                <button @click="toggleActionsFilterDropdown"
                                    class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
                                    id="actionsFilterDropdownButton">
                                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 w-4 mr-2"
                                        viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Actions Taken
                                </button>

                                <div id="actionsFilterDropdown" v-show="isActionsFilterDropdownOpen"
                                    class="absolute top-full right-0 z-10 w-48 p-3 rounded-lg shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden">
                                    <h6 class="mb-3 text-sm font-medium">Choose Actions Taken</h6>
                                    <ul class="space-y-2 text-sm">
                                        <li v-for="action in actions" :key="action.id" class="flex items-center">
                                            <input type="checkbox" :id="'action-' + action.id" :value="action.id"
                                                v-model="selectedActions" class="w-4 h-4" />
                                            <label :for="'action-' + action.id" class="ml-2 text-sm font-medium">{{
                                                action.actions }}</label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <table class="w-full text-sm text-left">
                    <thead class="text-xs uppercase bg-teal-300 text-gray-800 dark:bg-slate-950 dark:text-gray-300">
                        <tr>
                            <th scope="col" class="px-4 py-3 ">ID</th>
                                <th scope="col" class="px-4 py-3">Time</th>
                                <th scope="col" class="px-4 py-3">Date Received</th>
                                <th scope="col" class="px-4 py-3">Assistance</th>
                                <th scope="col" class="px-4 py-3">Incident Type</th>
                                <th scope="col" class="px-4 py-3">Landmark</th>
                                <th scope="col" class="px-4 py-3">Longitude</th>
                                <th scope="col" class="px-4 py-3">Latitude</th>
                                <th scope="col" class="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="report in paginatedReports" :key="report.id"
                            class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b dark:border-gray-700">
                            <td class="px-4 py-3 ">{{ report.id }}</td>
                                <td class="px-4 py-3 ">{{ report.time }}</td>
                                <td class="px-4 py-3 ">{{ report.date_received }}</td>
                                <td class="px-4 py-3 ">{{ report.assistance.assistance }}</td>
                                <td class="px-4 py-3 ">{{ report.incident.type }}</td>
                                <td class="px-4 py-3 ">{{ report.landmark }}</td>
                                <td class="px-4 py-3 " v-if="report.longitude">{{ report.longitude }}</td>
                                <td class="px-4 py-3 " v-if="!report.longitude">
                                    <Badge Message="No Data for Longitude" />
                                </td>
                                <td class="px-4 py-3" v-if="report.latitude">{{ report.latitude }}</td>
                                <td class="px-4 py-3" v-if="!report.latitude">
                                    <Badge Message="No Data for Latitude" />
                                </td>
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
                                    <div v-if="openDropdownId === report.id" ref="dropdownRefs"
                                        class="absolute z-[10] w-44 mt-2 top-full left-0 shadow-sm border rounded-md bg-white dark:bg-slate-700"
                                        @click.stop>

                                        <ul class=" text-sm">
                                        <li>
                                            <RouterLink 
                                            @click="passingData(report)"
                                                :to="{ name: 'ReportViewDetails', params: { id: report.id } }"
                                                class="block px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-slate-600">
                                                View Details
                                            </RouterLink>
                                        </li>
                                        <li>
                                            <RouterLink 
                                            @click="passingData(report)"
                                                :to="{ name: 'EditReport', params: { id: report.id } }"
                                                class="block px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-slate-600">
                                                Edit Report
                                            </RouterLink>
                                        </li>
                                        <PopupModal Title="Are you sure you want to delete this report?"
                                            ModalButton="Delete" Icon="cancel" Classes="" :show="isDeleteModalOpen"
                                            @update:show="isDeleteModalOpen = $event"
                                            ButtonClass="inline-flex w-full block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600">
                                            <template #modalContent>
                                                <div class="p-6 space-x-2">
                                                    <PrimaryButton @click="openDropdownId = null" name="Cancel"
                                                        class="bg-gray-500 hover:bg-gray-600 text-gray-100 shadow-md" />
                                                    <PrimaryButton @click.prevent="formSubmit(report.id)" name="Delete"
                                                        class="bg-red-500 hover:bg-red-600 text-gray-100 shadow-md" />
                                                </div>
                                            </template>
                                        </PopupModal>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <nav
                    class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
                    <span class="text-sm font-normal">Showing {{ filteredReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} to {{
                        Math.min(currentPage *
                            itemsPerPage, filteredReports.length) }} of {{ filteredReports.length }}</span>
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
    </div>


    <!-- This is for table -->
    <!-- <div class="mt-6 px-2"> -->

    <!-- </div> -->

    <!-- <viewMap :viewID="id" /> -->
</template>