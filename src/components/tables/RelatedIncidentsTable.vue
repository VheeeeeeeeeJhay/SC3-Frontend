<script setup>
import { onMounted, onUnmounted, inject } from 'vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosClient from '../../axios.js';
import { computed, watch } from 'vue';
import viewMap from '../../components/maps/ViewMap.vue';
import ChooseReportType from '../../components/modal/ChooseReportType.vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import DateRangePicker from "../../components/DateRangePicker.vue";
import { useArrayStore } from '../../stores/arrayStore';
import DeleteModal from '../../components/modal/DeleteModal.vue';
import logo from '../../assets/baguio-logo.png';
import { useActionDropdown } from '../../composables/useActionDropdown';
import { usePagination } from '../../composables/usePagination';

const router = useRouter();
const id = String(useRoute().params.id);

const errors = ref([]);
const startDate = ref(null);
const endDate = ref(null);
const selectedClassifications = ref([]);
const selectedUrgencies = ref([]);
const selectedActions = ref([]);

const addToast = inject('addToast');

const databaseStore = useDatabaseStore();

let refreshInterval = null;

// onMounted(() => {
//     databaseStore.fetchData();

//     refreshInterval = setInterval(() => {
//         databaseStore.fetchData();
//     }, 50000);
// });

// onUnmounted(() => {
//     if (refreshInterval) {
//         clearInterval(refreshInterval);
//     }
// });

const computedProperties = {
    reportArray: "reports",
    classifications: "assistance",
    urgencies: "urgencies",
    actions: "actions",
};

const {
    reportArray,
    classifications,
    urgencies,
    actions,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

// 
watch([classifications, urgencies, actions],
([newClassifications, newUrgencies, newActions]) => {
    selectedClassifications.value = newClassifications.map(c => c.id);
    selectedUrgencies.value = newUrgencies.map(u => u.id);
    selectedActions.value = newActions.map(a => a.id);
}, { immediate: true });


const sortSource = ref('');
const toggleSortSource = () => {
    sortSource.value = sortSource.value === '' ? 'asc' : sortSource.value === 'asc' ? 'desc' : '';
};

const sortAssistance = ref('');
const toggleSortAssistance = () => {
    sortAssistance.value = sortAssistance.value === '' ? 'asc' : sortAssistance.value === 'asc' ? 'desc' : '';
};

const sortIncident = ref('');
const toggleSortIncident = () => {
    sortIncident.value = sortIncident.value === '' ? 'asc' : sortIncident.value === 'asc' ? 'desc' : '';
};

const sortActions = ref('');
const toggleSortActions = () => {
    sortActions.value = sortActions.value === '' ? 'asc' : sortActions.value === 'asc' ? 'desc' : '';
};

const sortUrgency = ref('');
const toggleSortUrgency = () => {
    sortUrgency.value = sortUrgency.value === '' ? 'asc' : sortUrgency.value === 'asc' ? 'desc' : '';
};


const reports = computed(() => (reportArray.value || []).filter(report => String(report.barangay_id) === id));

//Passed report data to ViewReport.vue
const passingData = (report) => {
    store.clearData();
    store.setData(report);
}

const { openDropdownId, dropdownRefs, toggleDropdown } = useActionDropdown();

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
    if (selectedClassifications.value.length === 0) return [];
    if (selectedUrgencies.value.length === 0) return [];
    if (selectedActions.value.length === 0) return [];

    let result = reports.value.filter(report => {
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

        const reportDate = new Date(report.date_occurred);

        const matchesDateRange =
            (!startDate.value || reportDate >= new Date(startDate.value)) &&
            (!endDate.value || reportDate <= new Date(endDate.value));

        return matchesSearch && matchesClassification && matchesUrgency && matchesAction && matchesDateRange;
    });

    // 2. Apply search on the filtered result
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(report =>
            // Adjust these fields as needed for your data
            report.source.sources.toLowerCase().includes(query) ||
            report.assistance.assistance.toLowerCase().includes(query) ||
            report.incident.type.toLowerCase().includes(query) ||
            report.actions.actions.toLowerCase().includes(query) ||
            report.barangay.name.toLowerCase().includes(query) ||
            report.urgency.urgency.toLowerCase().includes(query)
            // Add more fields if needed
        );
    }

    // 3. Sort the filtered array
    return [...result].sort((a, b) => {
        // First: sort by source if enabled
        if (sortSource.value !== '') {
            const cmpSource = sortSource.value === 'asc'
                ? a.source.sources.localeCompare(b.source.sources)
                : b.source.sources.localeCompare(a.source.sources);
            if (cmpSource !== 0) return cmpSource;
        }
        // Then: sort by assistance if enabled
        if (sortAssistance.value !== '') {
            const cmpAssist = sortAssistance.value === 'asc'
                ? a.assistance.assistance.localeCompare(b.assistance.assistance)
                : b.assistance.assistance.localeCompare(a.assistance.assistance);
            if (cmpAssist !== 0) return cmpAssist;
        }

        if (sortIncident.value !== '') {
            const cmpIncident = sortIncident.value === 'asc'
                ? a.incident.type.localeCompare(b.incident.type)
                : b.incident.type.localeCompare(a.incident.type);
            if (cmpIncident !== 0) return cmpIncident;
        }

        if (sortActions.value !== '') {
            const cmpAction = sortActions.value === 'asc'
                ? a.actions.actions.localeCompare(b.actions.actions)
                : b.actions.actions.localeCompare(a.actions.actions);
            if (cmpAction !== 0) return cmpAction;
        }

        if (sortUrgency.value !== '') {
            const cmpUrgency = sortUrgency.value === 'asc'
                ? a.urgency.urgency.localeCompare(b.urgency.urgency)
                : b.urgency.urgency.localeCompare(a.urgency.urgency);
            if (cmpUrgency !== 0) return cmpUrgency;
        }

        return 0;
    });
});


const formSubmit = async (id) => {
    // Close modal
    isDeleteModalOpen.value = false;
    // errors.value = ''; // 🔹 Reset errors before making a request
    await axiosClient.put(`/api/911/report-archive/${id}`, null, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
    .then(response => {
        // Remove the deleted barangay from the list without refreshing the page
        // reports.value = reports.value.filter(b => b.id !== report_Id); // ================================================================ revise
        addToast(response.data.message, 'success', 'check_circle');
        databaseStore.fetchData();
        // refreshInterval = setInterval(() => {
        //     databaseStore.fetchData(); // runs again every 50s
        // }, 50000);
    })
    .catch(error => {
        addToast(error.response?.data?.message || error.response?.data?.error, 'error', 'error');
    });
};


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
} = usePagination(filteredReports, { itemsPerPage: 10, maxVisiblePages: 3 })

watch(searchQuery, () => resetPage())



const isModalOpen = ref(false);

// show all filter
const isFilterContainerOpen = ref(false);
const toggleFilters = () => {
    isFilterContainerOpen.value = !isFilterContainerOpen.value;
};

const updateDateRange = ({ start, end }) => {
    startDate.value = start;
    endDate.value = end;
};


//multiple delete of reports
const isDeleteModalOpen = ref(false);

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

    // Get the selected report objects (instead of just IDs)
    const selectedReportsData = selectedReports.value;

    try {
        // Send the full reports data
        const response = await axiosClient.put('/api/911/report-multiple-archive', {
            selectedReportsData
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': import.meta.env.VITE_API_KEY
            },
        });
        addToast(response.data.message, 'success', 'check_circle');
        selectedReports.value = [];
        // Refresh the reports list
        databaseStore.fetchData();
        // refreshInterval = setInterval(() => {
        //     databaseStore.fetchData(); // runs again every 50s
        // }, 50000);  
    } catch (error) {
        addToast(error.response?.data?.message || error.response?.data?.error, 'error', 'error');
    }
};

//For Export Option
onMounted(() => {
    document.addEventListener("click", (event) => {
        if (
            openDropdownExportId.value !== null &&
            !dropdownExportRefs.value[openDropdownExportId.value]?.contains(event.target)
        ) {
            closeExportDropdown();
        }
    });
});

// -----------------------
const openDropdownExportId = ref(null);

const dropdownExportRefs = ref([]);
const closeExportDropdown = () => {
    openDropdownExportId.value = null;
};
const toggleExportDropdown = (exportId) => {
    openDropdownExportId.value = openDropdownExportId.value === exportId ? null : exportId;
};

// for printing reports
const handlePrint = async () => {
    try{
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
                            <th>Description</th>
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
                                <td>${report.description}</td>
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
    
    addToast('Exported PDF successfully!', 'success', 'check_circle');
    
    printWindow.onafterprint = () => {
        printWindow.close();
    };
    } catch (error) {
        addToast('Failed to export PDF', 'error', 'error');
    }
};

// //handle CSV generation
const handleCSV = (filteredReports) => {
    if (!filteredReports || filteredReports.length === 0) {
        addToast("No data to export.", 'error', 'error');
        return;
    }

    try{
    // Flatten each report
    const flatReports = filteredReports.map(report => ({
        id: report.id,
        name: report.name,
        date_occurred: report.date_occurred,
        time: report.time,
        arrival_on_site: report.arrival_on_site,
        landmark: report.landmark,
        description: report.description,
        latitude: report.latitude,
        longitude: report.longitude,
        source_id: report.source_id,
        source: report.source?.sources ?? '',
        assistance_id: report.assistance_id,
        assistance: report.assistance?.assistance ?? '',
        actions_id: report.actions_id,
        actions: report.actions?.actions ?? '',
        urgency_id: report.urgency_id,
        urgency: report.urgency?.urgency ?? '',
        incident_id: report.incident_id,
        incident: report.incident?.type ?? '',
        barangay_id: report.barangay_id,
        barangay: report.barangay?.name ?? '',
        created_at: report.created_at,
        updated_at: report.updated_at,
    }));

    // Get headers
    const headers = Object.keys(flatReports[0]);

    // Build CSV rows
    const csvRows = [headers.join(',')];

    flatReports.forEach(item => {
        const row = headers.map(header => {
            const val = item[header];
            if (typeof val === 'string') {
                return `"${val.replace(/"/g, '""')}"`; // escape quotes
            }
            return val ?? '';
        });
        csvRows.push(row.join(','));
    });

    // Create blob and trigger download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'filtered_reports.csv');
    document.body.appendChild(link); // not required but safer in some browsers
    link.click();

    addToast('Exported CSV successfully!', 'success', 'check_circle');

    // Clean up after short delay to ensure download starts
    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
    }, 100);
    } catch (error) {
        addToast('Failed to export CSV. Please try again.', 'error', 'error');
    }
};

//handle JSON
const handleJSON = (filteredReports) => {
    if (!filteredReports || filteredReports.length === 0) {
        addToast("No data to export.", 'error', 'error');
        return;
    }

    try{
    const jsonContent = JSON.stringify(filteredReports, null, 2); // Pretty print with 2 spaces
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'filtered_reports.json');
    document.body.appendChild(link);
    link.click();

    addToast('Exported JSON successfully!', 'success', 'check_circle');

    // Clean up
    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
    }, 100);
    } catch (error) {
        addToast('Failed to export JSON. Please try again.', 'error', 'error');
    }
};
</script>

<template>
    
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
                                        <p class="text-gray-500 dark:text-gray-300">Are you sure you want to delete the
                                            following record/s?</p>
                                    </div>
                                    <div class="overflow-x-auto">
                                        <table
                                            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg">
                                            <thead class="bg-gray-50 dark:bg-gray-900">
                                                <tr>
                                                    <th></th>
                                                    <th
                                                        class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        ID</th>
                                                    <th
                                                        class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Source</th>
                                                    <th
                                                        class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Assistance</th>
                                                    <th
                                                        class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Incident Type</th>
                                                    <th
                                                        class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Actions</th>
                                                    <th
                                                        class="px-4 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Barangay</th>
                                                </tr>
                                            </thead>
                                            <tbody
                                                class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                <tr v-for="report in selectedReports" :key="report.id"
                                                    class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b dark:border-gray-700">
                                                    <td class="px-4 py-1 whitespace-nowrap">
                                                        <button @click.prevent="removedSplice(report.id)"><span
                                                                class="hover:text-red-600 text-red-500 text-[10px] material-icons">cancel</span></button>
                                                    </td>
                                                    <td
                                                        class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">
                                                        {{ report.id }}</td>
                                                    <td
                                                        class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">
                                                        {{ report.source.sources }}</td>
                                                    <td
                                                        class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">
                                                        {{ report.assistance.assistance }}</td>
                                                    <td
                                                        class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">
                                                        {{ report.incident.type }}</td>
                                                    <td
                                                        class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">
                                                        {{ report.actions.actions }}</td>
                                                    <td
                                                        class="px-4 py-1 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-300">
                                                        {{ report.barangay.name }}</td>

                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="flex justify-end gap-2 mt-4">
                                        <button @click="isDeleteModalOpen = false"
                                            class="w-1/2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-700 dark:text-white">Cancel</button>
                                        <button @click="checkboxDelete"
                                            class="w-1/2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600">Delete</button>
                                    </div>
                                </template>
                            </DeleteModal>
                        </div>
                        <div class="flex items-center space-x-2">

                            <div class="flex items-center md:w-auto relative">
                                <!-- <button "
                                    class="inline-flex items-center p-0.5 text-sm font-medium rounded-lg">
                                    Export
                                </button> -->
                                <button @click.stop="toggleExportDropdown(73)"
                                    class="flex items-center justify-center font-medium rounded-lg text-sm px-3 py-2 bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600">
                                    Export
                                </button>

                                <div v-if="openDropdownExportId" ref="dropdownExportRefs"
                                    class="absolute z-10 w-44 mt-0.5 top-full right-0 shadow-sm border rounded-md bg-white dark:bg-slate-700"
                                    @click.stop>

                                    <ul class=" text-sm">
                                        <li class="hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <div @click="handlePrint"
                                                class="block px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-slate-600">
                                                Export to PDF
                                            </div>
                                        </li>
                                        <li class="hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <div @click="handleJSON(filteredReports)"
                                                class="block px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-slate-600">
                                                Export to JSON
                                            </div>
                                        </li>
                                        <li class="hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <div @click="handleCSV(filteredReports)"
                                                class="block px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-slate-600">
                                                Export to CSV
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-end flex-shrink-0">
                            <DateRangePicker class="max-w-xs" @dateRangeSelected="updateDateRange" />
                        </div>
                    </div>
                </div>
                

                <table class="w-full text-sm text-left">
                    <thead class="text-xs uppercase bg-teal-300 text-gray-800 dark:bg-slate-950 dark:text-gray-300">
                        <tr>
                            <th scope="col" class="px-4 py-3 text-center"></th>
                            <!-- <th scope="col" class="px-4 py-3 text-center">ID</th> -->
                            <th scope="col" class="px-4 py-3 text-center">
                                <button class="" @click="toggleSortSource">SOURCE <i
                                        :class="sortSource === 'asc' ? 'pi pi-sort-alpha-up' : (sortSource === 'desc' ? 'pi pi-sort-alpha-down-alt' : 'pi pi-sort-alt')"></i></button>
                            </th>
                            <th scope="col" class="px-4 py-3 text-center">
                                <div class="flex items-center justify-center">
                                    <div class="flex items-center md:w-auto relative">
                                        <button @click="toggleFilterDropdown"
                                            class="w-full md:w-auto flex items-center justify-center py-2  text-sm font-medium  text-gray-700 dark:text-gray-200 hover:text-teal-500 rounded-lg shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
                                            id="filterDropdownButton">
                                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
                                                class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd"
                                                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                                    clip-rule="evenodd" />
                                            </svg>
                                        </button>

                                        <div id="filterDropdown" v-show="isFilterDropdownOpen"
                                            class="absolute top-full left-0 z-10 w-48 p-3 rounded-lg shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden">
                                            <h6 class="mb-3 text-sm font-medium">Choose Assistance</h6>
                                            <ul class="space-y-2 text-sm">
                                                <li v-for="classification in classifications" :key="classification.id"
                                                    class="flex items-center text-left">
                                                    <input type="checkbox" :id="classification.id"
                                                        :value="classification.id" v-model="selectedClassifications"
                                                        class="w-4 h-4" />
                                                    <label :for="classification.id" class="ml-2 text-sm font-medium">{{
                                                        classification.assistance }}</label>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <button class="" @click="toggleSortAssistance">ASSISTANCE <i
                                            :class="sortAssistance === 'asc' ? 'pi pi-sort-alpha-up' : (sortAssistance === 'desc' ? 'pi pi-sort-alpha-down-alt' : 'pi pi-sort-alt')"></i></button>
                                </div>
                            </th>
                            <th scope="col" class="px-4 py-3 text-center">
                                <button class="" @click="toggleSortIncident">INCIDENT/CASE <i
                                        :class="sortIncident === 'asc' ? 'pi pi-sort-alpha-up' : (sortIncident === 'desc' ? 'pi pi-sort-alpha-down-alt' : 'pi pi-sort-alt')"></i></button>
                            </th>
                            <th scope="col" class="px-4 py-3 text-center">
                                <div class="flex items-center justify-center">
                                    <div class="flex items-center md:w-auto relative">
                                        <button @click="toggleActionsFilterDropdown"
                                            class="w-full md:w-auto flex items-center justify-center py-2  text-sm font-medium  text-gray-700 dark:text-gray-200 hover:text-teal-500 rounded-lg shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
                                            id="actionsFilterDropdownButton">
                                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
                                                class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd"
                                                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                                    clip-rule="evenodd" />
                                            </svg>
                                        </button>

                                        <div id="actionsFilterDropdown" v-show="isActionsFilterDropdownOpen"
                                            class="absolute top-full left-0 z-10 w-48 p-3 rounded-lg shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden">
                                            <h6 class="mb-3 text-sm font-medium">Choose Actions Taken</h6>
                                            <ul class="space-y-2 text-sm">
                                                <li v-for="action in actions" :key="action.id"
                                                    class="flex items-center text-left">
                                                    <input type="checkbox" :id="'action-' + action.id"
                                                        :value="action.id" v-model="selectedActions" class="w-4 h-4" />
                                                    <label :for="'action-' + action.id"
                                                        class="ml-2 text-sm font-medium">{{
                                                            action.actions }}</label>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <button class="" @click="toggleSortActions">ACTIONS <i
                                            :class="sortActions === 'asc' ? 'pi pi-sort-alpha-up' : (sortActions === 'desc' ? 'pi pi-sort-alpha-down-alt' : 'pi pi-sort-alt')"></i></button>
                                </div>
                            </th>
                            <th scope="col" class="px-4 py-3 text-center">
                                <div class="flex items-center justify-center">
                                    <div class="flex items-center md:w-auto relative">
                                        <button @click="toggleUrgencyFilterDropdown"
                                            class="w-full md:w-auto flex items-center justify-center py-2  text-sm font-medium  text-gray-700 dark:text-gray-200 hover:text-teal-500 rounded-lg shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
                                            id="urgencyFilterDropdownButton">
                                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
                                                class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd"
                                                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                                    clip-rule="evenodd" />
                                            </svg>
                                        </button>

                                        <div id="urgencyFilterDropdown" v-show="isUrgencyFilterDropdownOpen"
                                            class="absolute top-full left-0 z-10 w-48 p-3 rounded-lg shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden">
                                            <h6 class="mb-3 text-sm font-medium">Choose Urgency</h6>
                                            <ul class="space-y-2 text-sm">
                                                <li v-for="urgency in urgencies" :key="urgency.id"
                                                    class="flex items-center">
                                                    <input type="checkbox" :id="'urgency-' + urgency.id"
                                                        :value="urgency.id" v-model="selectedUrgencies"
                                                        class="w-4 h-4 text-left" />
                                                    <label :for="'urgency-' + urgency.id"
                                                        class="ml-2 text-sm font-medium">{{
                                                            urgency.urgency }}</label>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <button class="" @click="toggleSortUrgency">URGENCY <i
                                            :class="sortUrgency === 'asc' ? 'pi pi-sort-alpha-up' : (sortUrgency === 'desc' ? 'pi pi-sort-alpha-down-alt' : 'pi pi-sort-alt')"></i></button>
                                </div>
                            </th>
                            <th scope="col" class="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="report in paginatedData" :key="report.id"
                            class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b dark:border-gray-700">
                            <td class="px-4 py-3 text-center">
                                <!-- <input type="checkbox" :value="report" v-model="selectedReports" class="w-4 h-4" /> -->
                                <div class="inline-flex items-center">
                                    <label class="relative flex cursor-pointer items-center rounded-full p-3"
                                        for="checkbox-1" data-ripple-dark="true">
                                        <input type="checkbox" :value="report" v-model="selectedReports"
                                            class="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-teal-500 checked:bg-teal-500 checked:before:bg-teal-500 hover:before:opacity-10"
                                            id="checkbox-1" checked />
                                        <div
                                            class="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5"
                                                viewBox="0 0 20 20" fill="currentColor" stroke="currentColor"
                                                stroke-width="1">
                                                <path fill-rule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clip-rule="evenodd"></path>
                                            </svg>
                                        </div>
                                    </label>
                                </div>
                            </td>
                            <!-- <td class="px-4 py-3 text-center">{{ report.id }}</td> -->
                            <td class="px-4 py-3 text-center">{{ report.source.sources }}</td>
                            <td class="px-4 py-3 text-center">{{ report.assistance.assistance }}</td>
                            <td class="px-4 py-3 text-center">{{ report.incident.type }}</td>
                            <td class="px-4 py-3 text-center">{{ report.actions.actions }}</td>
                            <td class="px-4 py-3 text-center" :class="[report.urgency.urgency === 'Life-Saving' ? 'text-red-500' :
                                report.urgency.urgency === 'Critical' ? 'text-orange-500' :
                                    report.urgency.urgency === 'High Priority' ? 'text-yellow-500' :
                                        report.urgency.urgency === 'Moderate' ? 'text-green-500' :
                                            'text-gray-500', 'font-bold']">
                                {{ report.urgency.urgency }}
                            </td>
                            <td class="px-4 py-3 text-center flex items-center relative justify-center">
                                <button @click.stop="toggleDropdown(report.id)"
                                    class="inline-flex items-center p-0.5 text-sm font-medium rounded-lg">
                                    <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                </button>

                                <div 
                                v-if="openDropdownId === report.id"
                                :ref="el => dropdownRefs[report.id] = el"
                                    class="absolute z-10 w-44 top-full right-0 shadow-sm border rounded-md bg-white dark:bg-slate-700"
                                    @click.stop>

                                    <ul class=" text-sm">
                                        <li class="hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <RouterLink @click="passingData(report)"
                                                :to="{ name: 'ReportViewDetails', params: { id: report.id } }"
                                                class="block px-4 py-2 text-left">
                                                View Details
                                            </RouterLink>
                                        </li>
                                        <li class="hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <RouterLink @click="passingData(report)"
                                                :to="{ name: 'EditReport', params: { id: report.id } }"
                                                class="block px-4 py-2 text-left">
                                                Edit Report
                                            </RouterLink>
                                        </li>
                                        <PopupModal
                                            Title="Are you sure you want to delete this report?" ModalButton="Delete"
                                            Icon="cancel" Classes="" :show="isDeleteModalOpen"
                                            @update:show="isDeleteModalOpen = $event"
                                            ButtonClass="inline-flex w-full block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600">
                                            <template #modalContent>
                                                <div class="flex gap-3">
                                                    <PrimaryButton @click="openDropdownId = null" name="Cancel"
                                                        class="w-1/2 bg-gray-500 hover:bg-gray-600 text-gray-100 shadow-md" />
                                                    <PrimaryButton @click.prevent="formSubmit(report.id)" name="Delete"
                                                        class="w-1/2 bg-red-500 hover:bg-red-600 text-gray-100 shadow-md" />
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
                    <span class="text-sm font-normal">Showing {{ filteredReports.length > 0 ? (currentPage - 1) *
                        itemsPerPage + 1 : 0
                    }} to {{
                            Math.min(currentPage *
                                itemsPerPage, filteredReports.length) }} of {{ filteredReports.length }}</span>
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
</template>

<style scoped>
</style>