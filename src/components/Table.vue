<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useThemeStore } from '../stores/themeStore';
import PrimaryButton from '../components/PrimaryButton.vue';
import axiosClient from '../axios.js';
import { RouterLink } from 'vue-router';

//Import API key
const API_KEY = import.meta.env.VITE_API_KEY;

// For dark mode
const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "bg-slate-800 border border-black text-white hover:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:outline-none"
    : "bg-sky-50 border border-gray-200 text-sky-900 hover:border-gray-300 focus:ring-2 focus:ring-sky-400 focus:outline-none";
});

// Dropdown base styles
const dropClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "bg-slate-600 border border-black text-white focus:ring-2 focus:ring-slate-400 focus:outline-none"
    : "bg-white border border-gray-200 text-sky-900 focus:ring-2 focus:ring-sky-300 focus:outline-none";
});

// Hover styles (separate for reusability)
const hoverClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "hover:bg-slate-700 hover:border-black"
    : "hover:bg-sky-100 hover:border-black";
});

// const reports = ref([]);
// const classifications = ref([]);

const isLoading = ref(false);

const selectedClassifications = ref([]);

const filteredReports = computed(() => {
  if (selectedClassifications.value.length === 0) {
    return props.reports;
  }
  return props.reports.filter(report => 
    selectedClassifications.value.includes(report.assistance_id)
  );
});


const errors = ref('');
// -----------------------
const openDropdownId = ref(null);

const dropdownRefs = ref([]);
const closeDropdown = () => {
    openDropdownId.value = null;
};
const toggleDropdown = (transactionId) => {
    openDropdownId.value = openDropdownId.value === transactionId ? null : transactionId;
};

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

const props = defineProps({
    reports: Array,
    classifications: Array,
    isLoading: Boolean,
    selectedClassifications: Array, // Add this if it's coming from the parent
});

watch(() => props.reports, (newReports, oldReports) => {
    console.log('Reports changed:', { newReports, oldReports });
    // You can perform additional logic here, such as data transformation or API calls
}, { deep: true }); // Use deep watching if reports is an array of objects



const formSubmit = (report_Id) => {
    errors.value = ''; // 🔹 Reset errors before making a request
    axiosClient.delete(`/api/911/report-delete/${report_Id}`, {
        headers: {
            'x-api-key': API_KEY
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
    <div>
        <div class="relative shadow-md sm:rounded-lg overflow-hidden" :class="themeClasses">
            <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                <div class="w-full md:w-1/2">
                    <form class="flex items-center">
                        <label for="simple-search" class="sr-only">Search</label>
                        <div class="relative w-full">
                            <input type="text" id="simple-search"
                                class="border text-sm rounded-lg block w-full pl-10 p-2" placeholder="Search"
                                required="">
                        </div>
                    </form>
                </div>
                <div
                    class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                    <RouterLink :to="{ name: 'ReportForm' }" class="border rounded">
                        <button type="button"
                            class="flex items-center justify-center font-medium rounded-lg text-sm px-3 py-1"
                            :class="hoverClasses">
                            <span class="material-icons">add</span>
                            Add a New Report
                        </button>
                    </RouterLink>
                    <div class="flex items-center space-x-3 w-full md:w-auto relative">
                        <button @click="toggleFilterDropdown"
                            class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium focus:outline-none rounded-lg border"
                            :class="hoverClasses">
                            Filter
                        </button>
                        <div id="filterDropdown" v-show="isFilterDropdownOpen"
                            class="absolute top-full left-0 z-10 w-48 p-3 bg-white rounded-lg shadow">
                            <h6 class="mb-3 text-sm font-medium">Choose Classification</h6>
                            <ul class="space-y-2 text-sm">
                                <li v-for="classification in classifications" :key="classification.id"
                                    class="flex items-center">
                                    <input 
                                    type="checkbox" 
                                    :id="classification.id" 
                                    :value="classification.id"
                                    v-model="selectedClassifications" 
                                    />
                                    <label :for="classification.id" class="ml-2 text-sm font-medium">{{
                                        classification.assistance }}</label>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div v-if="isLoading" class="flex justify-center">
                    <div role="status">Loading...</div>
                </div>
                <table v-else class="w-full text-sm text-left text-gray-500">
                    <thead>
                        <tr>
                            <th scope="col" class="px-4 py-3">ID</th>
                            <th scope="col" class="px-4 py-3">Source</th>
                            <th scope="col" class="px-4 py-3">Case Classification</th>
                            <th scope="col" class="px-4 py-3">Incident/Case</th>
                            <th scope="col" class="px-4 py-3">Assistance</th>
                            <th scope="col" class="px-4 py-3"><span class="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="report in props.reports" :key="report.id">
                            <th scope="row" class="px-4 py-3 font-medium whitespace-nowrap">{{ report.id }}</th>
                            <td class="px-4 py-3">{{ report.source?.sources }}</td>
                            <td class="px-4 py-3">{{ report.assistance?.assistance }}</td>
                            <td class="px-4 py-3">{{ report.incident?.type }}</td>
                            <td class="px-4 py-3">{{ report.actions?.actions }}</td>
                            <td class="px-4 py-3 flex items-center justify-end relative">
                                <button @click.stop="toggleDropdown(report.id)"
                                    class="inline-flex items-center p-0.5 text-sm font-medium rounded-lg"
                                    type="button">Actions</button>
                                <div v-if="openDropdownId === report.id" ref="dropdownRefs" :class="dropClasses"
                                    class="absolute z-[10] divide-gray-100 rounded-lg shadow-sm w-44 right-10 mt-2">
                                    <ul class="py-2 text-sm">
                                        <li>
                                            <RouterLink :to="{ name: 'ReportViewDetails', params: { id: report.id } }"
                                                class="block px-4 py-2">View Details</RouterLink>
                                        </li>
                                        <li>
                                            <RouterLink class="block px-4 py-2">Edit Report</RouterLink>
                                        </li>
                                        <li class="block px-2">
                                            <PrimaryButton @click="formSubmit(report.id)" name="Delete Report" />
                                        </li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>