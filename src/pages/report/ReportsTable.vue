<script setup>
import { ref, onMounted, computed } from 'vue';
import axiosClient from '../../axios.js';
import { RouterLink } from 'vue-router';
import PrimaryButton from '../../components/PrimaryButton.vue';
import { useThemeStore } from '../../stores/themeStore';
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

const reports = ref([]);
const classifications = ref([]);

const isLoading = ref(false);

onMounted(() => {
    isLoading.value = true;
    axiosClient.get('/api/911/report-display', {
        headers: {
            'x-api-key': '$m@rtC!ty'
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



// Delete A Report
const errors = ref('');

const formSubmit = (report_Id) => {
    errors.value = ''; // 🔹 Reset errors before making a request
    axiosClient.delete(`/api/911/report-delete/${report_Id}`, {
        headers: {
            'x-api-key': '$m@rtC!ty'
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
    <section class="w-full">
        <div class="mt-6 px-4 w-full" >
            <!-- Start coding here -->
            <div class="relative shadow-md sm:rounded-lg overflow-hidden" :class="themeClasses">
                <div
                    class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                    <div class="w-full md:w-1/2">
                        <form class="flex items-center">
                            <label for="simple-search" class="sr-only">Search</label>
                            <div class="relative w-full">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg aria-hidden="true" class="w-5 h-5"
                                        fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <input type="text" id="simple-search"
                                    class="border text-sm rounded-lg  block w-full pl-10 p-2 "
                                    placeholder="Search" required="">
                            </div>
                        </form>
                    </div>
                    <div
                        class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0" >
                        <RouterLink :to="{ name: 'ReportForm'}" class="border rounded">
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
                            <button
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
                            </button>

                            <!-- Actions Dropdown Menu -->
                            <div
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
                            </div>

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
                            class="absolute top-full left-0 z-10 w-48 p-3 bg-white rounded-lg shadow"
                            >
                            <h6 class="mb-3 text-sm font-medium">Choose brand</h6>
                            <ul class="space-y-2 text-sm">
                                <li class="flex items-center">
                                <input id="apple" type="checkbox" class="w-4 h-4" />
                                <label for="apple" class="ml-2 text-sm font-medium">Apple (56)</label>
                                </li>
                                <li class="flex items-center">
                                <input id="fitbit" type="checkbox" class="w-4 h-4" />
                                <label for="fitbit" class="ml-2 text-sm font-medium">Microsoft (16)</label>
                                </li>
                                <li class="flex items-center">
                                <input id="razor" type="checkbox" class="w-4 h-4" />
                                <label for="razor" class="ml-2 text-sm font-medium">Razor (49)</label>
                                </li>
                                <li class="flex items-center">
                                <input id="nikon" type="checkbox" class="w-4 h-4" />
                                <label for="nikon" class="ml-2 text-sm font-medium">Nikon (12)</label>
                                </li>
                                <li class="flex items-center">
                                <input id="benq" type="checkbox" class="w-4 h-4" />
                                <label for="benq" class="ml-2 text-sm font-medium">BenQ (74)</label>
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
                    <table v-else class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <!-- <tr v-for="(value, key) in reports[0]" :key="key">
                                <th scope="col" class="px-4 py-3">{{ key }}</th>
                                <th scope="col" class="px-4 py-3">
                                    <span class="sr-only">Actions</span>
                                </th>
                            </tr> -->
                            <tr>
                                <th scope="col" class="px-4 py-3">ID</th>
                                <th scope="col" class="px-4 py-3">Source</th>
                                <th scope="col" class="px-4 py-3">Case Classification</th>
                                <th scope="col" class="px-4 py-3">Incident/Case</th>
                                <th scope="col" class="px-4 py-3">Assistance</th>
                                <th scope="col" class="px-4 py-3">
                                    <span class="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b dark:border-gray-700" v-for="report in reports" :key="report.id">
                                <th scope="row"
                                    class="px-4 py-3 font-medium whitespace-nowrap">
                                    {{ report.id }}
                                </th>
                                <td class="px-4 py-3">{{ report.source.sources }}</td>
                                <td class="px-4 py-3">{{ report.assistance.assistance }}</td>
                                <td class="px-4 py-3">{{ report.incident.type }}</td>
                                <td class="px-4 py-3">{{ report.actions.actions }}</td>
                                <td class="px-4 py-3 flex items-center justify-end relative">
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
                                    <div v-if="openDropdownId === report.id" ref="dropdownRefs" :class="dropClasses"
                                        class="absolute z-[10] divide-gray-100 rounded-lg shadow-sm w-44 right-10 = mt-2">
                                        <ul class="py-2 text-sm">
                                            <li>
                                                <RouterLink :to="{ name: 'ReportViewDetails', params: { id: report.id } }"
                                                    class="block px-4 py-2" :class="hoverClasses">View Details</RouterLink>
                                            </li>
                                            <li>
                                                <RouterLink 
                                                    class="block px-4 py-2 " :class="hoverClasses">Edit Report</RouterLink>
                                            </li>
                                            <li class="block px-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                <PrimaryButton @click="formSubmit(report.id)" name="Delete Report" />
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                    aria-label="Table navigation">
                    <span class="text-sm font-normal">
                        Showing
                        <span class="font-semibold">1-10</span>
                        of
                        <span class="font-semibold">1000</span>
                    </span>
                    <ul class="inline-flex items-stretch -space-x-px">
                        <li>
                            <a href="#"
                                class="flex items-center justify-center h-full py-1.5 px-3 ml-0 rounded-l-lg border" :class="hoverClasses">
                                <span class="sr-only">Previous</span>
                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </a>
                        </li>
                        <li>
                            <a href="#"
                                class="flex items-center justify-center text-sm py-2 px-3 leading-tight border" :class="hoverClasses">1</a>
                        </li>
                        <li>
                            <a href="#"
                                class="flex items-center justify-center text-sm py-2 px-3 leading-tight border" :class="hoverClasses">2</a>
                        </li>
                        <li>
                            <a href="#" aria-current="page"
                                class="flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight border" :class="hoverClasses">3</a>
                        </li>
                        <li>
                            <a href="#"
                                class="flex items-center justify-center text-sm py-2 px-3 leading-tight  border " :class="hoverClasses">...</a>
                        </li>
                        <li>
                            <a href="#"
                                class="flex items-center justify-center text-sm py-2 px-3 leading-tight  border " :class="hoverClasses">100</a>
                        </li>
                        <li>
                            <a href="#"
                                class="flex items-center justify-center h-full py-1.5 px-3 leading-tight rounded-r-lg border" :class="hoverClasses">
                                <span class="sr-only">Next</span>
                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </section>
</template>
