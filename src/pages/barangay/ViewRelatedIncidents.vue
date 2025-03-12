<script setup>
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosClient from '../../axios.js';
import ToolTip from '../../components/ToolTip.vue';
import { computed, watch, watchEffect } from 'vue';
import Loader1 from '../../components/Loader1.vue';
import viewMap from '../../components/viewMap.vue';


const router = useRouter();
const id = String(useRoute().params.id);
const isLoading = ref(false);
console.log(id);

const reports = ref([]);
const barangay = ref([]);
const errors = ref([]);
const openDropdownId = ref(null);
const dropdownRefs = ref([]);

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

        return matchesSearch;
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


</script>

<template>
    <div class="mt-6 px-2 flex justify-between">
        <h1 class="text-2xl font-bold dark:text-white">View Barangay and Related Incidents</h1>
        <Button type="button" name="Back" @click.prevent="router.back()"
            class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
            <span class="material-icons mr-2"> arrow_back </span>
            Back
        </Button>
    </div>
    <div>

        <!--  -->
        <div class="mt-6 p-5 h-4/5 border border-gray-200 dark:border-black rounded-lg dark:bg-slate-800 dark:text-white p-1">
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
        <div>
            <div class=" mt-6 px-2 relative shadow-md sm:rounded-lg bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white"
                :class="themeClasses">
                <div
                    class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
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

                        <PopupModal Title="Add a new Barangay" ModalButton="Add Barangay" Icon="home" Classes=""
                            ButtonClass="w-full md:w-auto rounded-lg flex items-center justify-center py-2 px-4 text-sm font-medium focus:outline-none bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600">
                            <template #modalContent>
                                <div class="p-6">
                                    <AddBarangay />
                                </div>
                            </template>
                        </PopupModal>
                    </div>
                </div>
                <div class="">
                    <!-- render loading animation before displaying datatable -->
                    <div v-if="isLoading" class="flex justify-center">
                        <Loader1 />
                    </div>
                    <table v-else class="w-full text-sm text-left">
                        <thead class="text-xs uppercase dark:bg-slate-900 dark:text-gray-300 bg-teal-300 text-gray-800">
                            <tr>
                                <th scope="col" class="px-4 py-3 ">ID</th>
                                <th scope="col" class="px-4 py-3">Time</th>
                                <th scope="col" class="px-4 py-3">Date Received</th>
                                <th scope="col" class="px-4 py-3">Assistance</th>
                                <th scope="col" class="px-4 py-3">Incident Type</th>
                                <th scope="col" class="px-4 py-3">Landmark</th>
                                <th scope="col" class="px-4 py-3">Longitude</th>
                                <th scope="col" class="px-4 py-3">Sources</th>
                                <th scope="col" class="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <div v-if="isLoading">
                            <Loader1 />
                        </div>
                        <tbody v-else>
                            <tr v-for="report in paginatedReports" :key="report.id"
                                class="dark:bg-slate-800 dark:hover:bg-slate-700 bg-sky-50 hover:bg-gray-200">

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

                                        <!-- Dropdown Items Container -->
                                        <div class="py-2 text-sm flex flex-col w-full items-center">
                                            <!-- Edit Button -->
                                            <PopupModal Title="Edit Barangay" ModalButton="Edit" Icon="edit" Classes=""
                                                ButtonClass="inline-flex w-full block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600">
                                                <template #modalContent>
                                                    <div>
                                                        <EditBarangay :barangay="report.id" />
                                                    </div>
                                                </template>
                                            </PopupModal>

                                            <!-- Delete Button -->
                                            <PopupModal Title="Are you sure you want to delete this barangay?"
                                                ModalButton="Delete" Icon="cancel" Classes=""
                                                ButtonClass="inline-flex w-full block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600">
                                                <template #modalContent>
                                                    <div class="p-6 space-x-2">
                                                        <PrimaryButton @click="openDropdownId = null" name="Cancel"
                                                            class="bg-gray-500 hover:bg-gray-600 text-gray-100 shadow-md" />
                                                        <PrimaryButton @click.prevent="formSubmit(report.id)"
                                                            name="Delete"
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
                <nav
                    class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
                    <span class="text-sm font-normal">
                        Showing
                        <span class="font-semibold">{{ filteredReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1
                            : 0
                            }}</span>
                        to
                        <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, filteredReports.length)
                            }}</span>
                        of
                        <span class="font-semibold">{{ filteredReports.length }}</span>
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
    </div>


    <!-- This is for table -->
    <!-- <div class="mt-6 px-2"> -->

    <!-- </div> -->

    <!-- <viewMap :viewID="id" /> -->
</template>