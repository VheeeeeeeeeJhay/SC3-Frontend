<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import axiosClient from '../../axios.js';
import { RouterLink } from 'vue-router';
import ChooseReportType from '../../components/modal/ChooseReportType.vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import logo from '../../assets/baguio-logo.png';
import { useArrayStore } from '../../stores/arrayStore';
import DeleteModal from '../../components/modal/DeleteModal.vue';

const searchQuery = ref("");
const selectedClassifications = ref([]);
const selectedUrgencies = ref([]);
const selectedActions = ref([]);

const databaseStore = useDatabaseStore();

const store = useArrayStore();
const passingData = (report) => {
    store.setData(report);
    console.log(store.getData());
}

let refreshInterval = null;
onMounted(() => {
    databaseStore.fetchData();

    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);
});

// Computed properties
const computedProperties = {
    reports: "reportsList",
    classifications: "classificationsList",
    urgencies: "urgenciesList",
    actions: "actionsList",
};

const {
    reports,
    classifications,
    urgencies,
    actions,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

// Computed property for dynamic search and filtering
const filteredReports = computed(() => {
    return reports.value.filter(report => {
        const matchesSearch = searchQuery.value
            ? report.source.sources.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            report.assistance.assistance.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            report.incident.type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            report.actions.actions.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            report.barangay.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            report.urgency.urgency.toLowerCase().includes(searchQuery.value.toLowerCase())
            : true;

        const matchesClassification = selectedClassifications.value.length === 0 ||
            selectedClassifications.value.includes(report.assistance_id);

        const matchesUrgency = selectedUrgencies.value.length === 0 ||
            selectedUrgencies.value.includes(report.urgency_id);

        const matchesAction = selectedActions.value.length === 0 ||
            selectedActions.value.includes(report.actions_id);

        return matchesSearch && matchesClassification && matchesUrgency && matchesAction;
    });
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

// for printing reports
const handlePrint = async () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    // Wait for the image to load
    await new Promise((resolve) => {
        const img = new Image();
        img.src = logo;
        img.onload = resolve;
        img.onerror = resolve; // Avoid hanging if image fails
    });

    // Wait for the reports data to be fully available
    await new Promise((resolve) => {
        setTimeout(resolve, 100); // Small delay to ensure data is processed
    });

    printWindow.document.write(`
        <html>
            <head>
                <title>Printed Reports</title>
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
                    <img src="${logo}" alt="Logo" style="width: 100px; height: auto; display: block; margin: 20px auto;">
                    <h1>Reports Management - Printed Report</h1>
                    <p>Printed on: ${new Date().toLocaleString()}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Source</th>
                            <th>Assistance</th>
                            <th>Incident/Case</th>
                            <th>Actions Taken</th>
                            <th>Location</th>
                            <th>Urgency</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredReports.value.map(report => `
                            <tr>
                                <td>${report.id}</td>
                                <td>${report.source.sources}</td>
                                <td>${report.assistance.assistance}</td>
                                <td>${report.incident.type}</td>
                                <td>${report.actions.actions}</td>
                                <td>${report.barangay.name}</td>
                                <td>${report.urgency.urgency}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="print-footer">
                    <p>Total Reports: ${filteredReports.value.length}</p>
                </div>
            </body>
        </html>
    `);

    printWindow.document.close();

    // Wait for the new window to finish rendering before printing
    await new Promise((resolve) => setTimeout(resolve, 500));

    printWindow.print();

    printWindow.onafterprint = () => {
        printWindow.close();
    };
};


// Delete A Report
const errors = ref('');
const success = ref('');

const formSubmit = async (report_Id) => {

    // Close modal
    isModalOpen.value = false;
    
    // errors.value = ''; // 🔹 Reset errors before making a request
    await axiosClient.delete(`/api/911/report-delete/${report_Id}`, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
        .then(() => {
            // Remove the deleted barangay from the list without refreshing the page
            // reports.value = reports.value.filter(b => b.id !== report_Id); // ================================================================ revise
            success.value = 'Report deleted successfully';
            databaseStore.fetchData();
        })
        .catch(error => {
            console.error('Error deleting report:', error.response?.data);
            errors.value = error.response?.data?.errors || 'Failed to delete report.';
        });

};



const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);


// show all filter
const isFilterContainerOpen = ref(false);
const toggleFilters = () => {
    isFilterContainerOpen.value = !isFilterContainerOpen.value;
};


// store multiple id's
const selectedReports = ref([]);

const removedSplice = (id) => {
    // Check if there are items in the selectedReports array
    if (selectedReports.value.length === 1) {
        const index = selectedReports.value.findIndex(report => report.id === id);
        
        if (index > -1) {
            selectedReports.value.splice(index, 1);
            
            // After removing the last item, close the delete modal
            isDeleteModalOpen.value = false;
        }
    } else if (selectedReports.value.length > 1) {
        const index = selectedReports.value.findIndex(report => report.id === id);
        
        if (index > -1) {
            selectedReports.value.splice(index, 1);
        }
    }
};

const checkboxDelete = async () => {
    // Close the delete modal
    isDeleteModalOpen.value = false;

    const selectedIds = selectedReports.value.map(report => report.id);

    try {
        // Make sure selectedReports is an array of IDs (you may want to sanitize this before sending)
        const response = await axiosClient.delete('/api/911/report-delete', {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': import.meta.env.VITE_API_KEY
            },
            data: { data: selectedIds }, // Wrap the IDs in a `data` key
        });

        // Handle success message
        console.log(response.data.message); // You can show this success message in the UI
        success.value = 'Reports deleted successfully!';

        // Clear selected reports
        selectedReports.value = [];

        // Refresh the reports list
        databaseStore.fetchData();
    } catch (error) {
        // Handle error message
        console.error('Error deleting data:', error);
        errors.value = error.response?.data?.message || 'Something went wrong!';
    }
};
</script>   

<template>
    <section class="w-full min-h-screen p-4">
        <!-- Titleee -->
        <div class="mt-6 px-2 flex justify-between">
            <h1 class="text-2xl font-bold dark:text-white">Reports Management</h1>
        </div>

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
                        
                        <div v-if="selectedReports.length > 0">
                            <!-- modal delete -->
                            <DeleteModal Title="Delete Report" ModalButton="Delete" Icon="delete" Classes=""
                                :show="isDeleteModalOpen" @update:show="isDeleteModalOpen = $event"
                                ButtonClass="flex items-center justify-center font-medium rounded-lg text-sm px-3 py-2 bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600">
                                <template #modalContent>
                                    <div class="p-6">
                                        <p class="text-gray-500 dark:text-gray-300">Are you sure you want to delete the following report/s?</p>
                                    </div>
                                    <div class="overflow-x-auto">
                                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg">
                                            <thead class="bg-gray-50 dark:bg-gray-900">
                                                <tr>
                                                    <th></th>
                                                    <th class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                                    <th class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                                                    <th class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assistance</th>
                                                    <th class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Incident Type</th>
                                                    <th class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                                    <th class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Barangay</th>
                                                </tr>
                                            </thead>
                                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                <tr v-for="report in selectedReports" :key="report.id" class="dark:bg-gray-700">
                                                    <button @click.prevent="removedSplice(report.id)" class="px-4 py-1 whitespace-nowrap"><span class="hover:text-red-600 text-red-500 text-[10px] material-icons">cancel</span></button>
                                                    <td class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">{{ report.id }}</td>
                                                    <td class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">{{ report.source.sources }}</td>
                                                    <td class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">{{ report.assistance.assistance }}</td>
                                                    <td class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">{{ report.incident.type }}</td>
                                                    <td class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">{{ report.actions.actions }}</td>
                                                    <td class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">{{ report.barangay.name }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="flex justify-end gap-2 mt-4">
                                        <button @click="isDeleteModalOpen = false" class="w-1/2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-700 dark:text-white">Cancel</button>
                                        <button @click="checkboxDelete" class="w-1/2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600">Delete</button>
                                    </div>
                                </template>
                            </DeleteModal>
                        </div>

                        <div class="flex items-center space-x-2">
                            <div>
                                <PopupModal Title="Please select what type of report you want to add" ModalButton="Create Report"
                                    Icon="" Classes="" :show="isModalOpen" @update:show="isModalOpen = $event"
                                    ButtonClass="flex items-center justify-center font-medium rounded-lg text-sm px-3 py-2 bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600">
                                    <template #modalContent>
                                        <ChooseReportType />
                                    </template>
                                </PopupModal>
                            </div>
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
                    <div v-show="isFilterContainerOpen" class="flex justify-end mb-3">
                        <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                            <div class="flex items-center space-x-3 md:w-auto relative">
                                <button @click="toggleFilterDropdown"
                                    class="w-full md:w-auto flex items-center justify-center py-2 px-4  text-sm font-medium rounded-lg border bg-white hover:bg-gray-200 dark:bg-slate-700 dark:border-black dark:text-white dark:hover:bg-slate-600"
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
                                    class="absolute top-full right-0 z-10 w-48 p-3 rounded-lg shadow bg-white dark:bg-slate-700 dark:text-white overflow-hidden">
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
                            class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">

                            <div class="flex items-center space-x-3 md:w-auto relative">
                                <button @click="toggleUrgencyFilterDropdown"
                                    class="w-full md:w-auto flex items-center justify-center py-2 px-4  text-sm font-medium rounded-lg border bg-white hover:bg-gray-200 dark:bg-slate-700 dark:border-black dark:text-white dark:hover:bg-slate-600"
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
                                    class="absolute top-full right-0 z-10 w-48 p-3 rounded-lg shadow bg-white dark:bg-slate-700 dark:text-white overflow-hidden">
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
                            class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">

                            <div class="flex items-center space-x-3 md:w-auto relative">
                                <button @click="toggleActionsFilterDropdown"
                                    class="w-full md:w-auto flex items-center justify-center py-2 px-4  text-sm font-medium rounded-lg border bg-white hover:bg-gray-200 dark:bg-slate-700 dark:border-black dark:text-white dark:hover:bg-slate-600"
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
                                    class="absolute top-full right-0 z-10 w-48 p-3 rounded-lg shadow bg-white dark:bg-slate-700 dark:text-white overflow-hidden">
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
                            <th scope="col" class="px-4 py-3 text-center"></th>
                            <th scope="col" class="px-4 py-3 text-center">ID</th>
                            <th scope="col" class="px-4 py-3 text-center">Source</th>
                            <th scope="col" class="px-4 py-3 text-center">Assistance</th>
                            <th scope="col" class="px-4 py-3 text-center">Incident/Case</th>
                            <th scope="col" class="px-4 py-3 text-center">Actions Taken</th>
                            <th scope="col" class="px-4 py-3 text-center">Urgency</th>
                            <th scope="col" class="px-4 py-3 text-center">Location</th>
                            <th scope="col" class="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="report in paginatedReports" :key="report.id"
                            class="bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                            <td class="px-4 py-3 text-center"><input type="checkbox" :value="report" v-model="selectedReports" class="w-4 h-4" /></td>
                            <td class="px-4 py-3 text-center">{{ report.id }}</td>
                            <td class="px-4 py-3 text-center">{{ report.source.sources }}</td>
                            <td class="px-4 py-3 text-center">{{ report.assistance.assistance }}</td>
                            <td class="px-4 py-3 text-center">{{ report.incident.type }}</td>
                            <td class="px-4 py-3 text-center">{{ report.actions.actions }}</td>
                            <td class="px-4 py-3 text-center"
                                :class="[report.urgency.urgency === 'Emergent' ? 'text-red-500' : report.urgency.urgency === 'Urgent' ? 'text-orange-500' : report.urgency.urgency === 'Less Urgent' ? 'text-yellow-500' : 'text-green-500']">
                                {{ report.urgency.urgency }}
                            </td>
                            <td class="px-4 py-3 text-center">{{ report.barangay.name }}</td>
                            <td class="px-4 py-3 text-center flex items-center relative">
                                <button @click.stop="toggleDropdown(report.id)"
                                    class="inline-flex items-center p-0.5 text-sm font-medium rounded-lg">
                                    <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                </button>

                                <div v-if="openDropdownId === report.id" ref="dropdownRefs"
                                    class="absolute z-10 w-44 mt-0.5 top-full right-0 shadow-sm border rounded-md bg-white dark:bg-slate-700"
                                    @click.stop>

                                    <ul class=" text-sm">
                                        <li>
                                            <RouterLink @click="passingData(report)"
                                                :to="{ name: 'ReportViewDetails', params: { id: report.id } }"
                                                class="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600">
                                                View Details
                                            </RouterLink>
                                        </li>
                                        <li>
                                            <RouterLink @click="passingData(report)"
                                                :to="{ name: 'EditReport', params: { id: report.id } }"
                                                class="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600">
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
    </section>
</template>
