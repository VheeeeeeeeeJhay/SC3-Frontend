<script setup>
import { ref, onMounted, computed, watch, onUnmounted, inject } from 'vue';
import axiosClient from '../../axios.js';
import Badge from '../../components/Badge.vue';
import { useDatabaseStore } from "../../stores/databaseStore";
import { useActionDropdown } from '../../composables/useActionDropdown';
import { usePagination } from '../../composables/usePagination';

const addToast = inject('addToast');

const selectedClassifications = ref([]);

const searchQuery = ref('');
const message = ref('');
const errors = ref('');

const isLoading = ref(false);

let refreshInterval = null;
const databaseStore = useDatabaseStore()
onMounted(() => {
    databaseStore.fetchData();
    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);
});
onUnmounted(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});
const computedProperties = {
    usersList: "users",
};
const {
    usersList
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);
const users = usersList.value.filter(user => 
    ((user.for_911 === 1 && user.for_inventory === 1 && user.for_traffic === 1 && user.is_deleted === 0) || 
    (user.for_911 === 1 && user.for_inventory === 0 && user.for_traffic === 1 && user.is_deleted === 0) || 
    (user.for_911 === 0 && user.for_inventory === 1 && user.for_traffic === 1 && user.is_deleted === 0) ||
    (user.for_911 === 1 && user.for_inventory === 1 && user.for_traffic === 0 && user.is_deleted === 0) ||
    (user.for_911 === 1 && user.for_inventory === 0 && user.for_traffic === 0 && user.is_deleted === 0) ||
    (user.for_911 === 0 && user.for_inventory === 1 && user.for_traffic === 0 && user.is_deleted === 0) ||
    (user.for_911 === 0 && user.for_inventory === 0 && user.for_traffic === 1 && user.is_deleted === 0)) 
);

const dashboardRole = async (user) => {
    const newRoleStatus = !user.for_911; // Toggle boolean value directly

    // Prevent all roles from being false at the same time
    if (!newRoleStatus && !user.for_inventory && !user.for_traffic) {
        addToast('At least 1 role must be active', 'error', 'error');
        return;
    }

    try {
        const response = await axiosClient.patch(`/api/911/user-dashboard-role/${user.id}`, {
            for_911: newRoleStatus
        }, {
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY
            }
        });
        // Update local state instantly
        user.for_911 = newRoleStatus;
        addToast(response.data.message, 'success', 'check_circle');
        databaseStore.fetchData();
        clearInterval(refreshInterval);
        refreshInterval = setInterval(() => {
            databaseStore.fetchData(); // runs again every 50s
        }, 50000);
    } catch (error) {
        console.error(error.response?.data?.error);
        errors.value = error.response?.data?.error;
        addToast(errors.value, 'error', 'error');
    }
};

// Inventory Role
const inventoryRole = async (user) => {
    const newRoleStatus = !user.for_inventory; // Toggle boolean value directly

    // Prevent all roles from being false at the same time
    if (!newRoleStatus && !user.for_911 && !user.for_traffic) {
        addToast('At least 1 role must be active', 'error', 'error');
        return;
    }

    try {
        const response = await axiosClient.patch(`/api/911/user-inventory-role/${user.id}`, { for_inventory: newRoleStatus },
            {
                headers: {
                    'x-api-key': import.meta.env.VITE_API_KEY
                }
            });
        // Update local state instantly
        user.for_inventory = newRoleStatus;
        addToast(response.data.message, 'success', 'check_circle');
        databaseStore.fetchData();
        clearInterval(refreshInterval);
        refreshInterval = setInterval(() => {
            databaseStore.fetchData(); // runs again every 50s
        }, 50000);
    } catch (error) {
        console.error(error.response?.data?.error);
        errors.value = error.response?.data?.error;
        addToast(errors.value, 'error', 'error');
    }
};
    
// Traffic Role
const trafficRole = async (user) => {
    const newRoleStatus = !user.for_traffic; // Toggle boolean value directly

    // Prevent all roles from being false at the same time
    if (!newRoleStatus && !user.for_911 && !user.for_inventory) {
        addToast('At least 1 role must be active', 'error', 'error');
        return;
    }

    try {
        const response = await axiosClient.patch(`/api/911/user-traffic-role/${user.id}`, { for_traffic: newRoleStatus },
            {
                headers: {
                    'x-api-key': import.meta.env.VITE_API_KEY
                }
            });
        // Update local state instantly
        user.for_traffic = newRoleStatus;
        addToast(response.data.message, 'success', 'check_circle');
        databaseStore.fetchData();
        clearInterval(refreshInterval);
        refreshInterval = setInterval(() => {
            databaseStore.fetchData(); // runs again every 50s
        }, 50000);
    } catch (error) {
        console.error(error.response?.data?.message || error.message);
        errors.value = error.response?.data?.error || 'Failed to archive user';
        addToast(errors.value, 'error', 'error');
    }
};

// Archive User
const archiveUser = async (user) => {
    try {
        const response = await axiosClient.patch(`/api/911/user-archive/${user.id}`, { is_deleted: 1 },
            {
                headers: {
                    'x-api-key': import.meta.env.VITE_API_KEY,
                }
            });
        // Update local state instantly
        user.is_deleted = 1;
        addToast(response.data.message, 'success', 'check_circle');
        databaseStore.fetchData();
        refreshInterval = setInterval(() => {
            databaseStore.fetchData(); // runs again every 50s
        }, 50000);
    } catch (error) {
        console.error(error.response?.data?.message || error.message);
        errors.value = error.response?.data?.error || 'Failed to archive user';
        addToast(errors.value, 'error', 'error');
    }
};

const sortName = ref('none'); // 'none', 'asc', 'desc'
const toggleSortName = () => {
    if (sortName.value === 'none') {
        sortName.value = 'asc';
    } else if (sortName.value === 'asc') {
        sortName.value = 'desc';
    } else {
        sortName.value = 'none';
    }
    console.log('Sort Name:', sortName.value);
};

const sortEmail = ref('none'); // 'none', 'asc', 'desc'
const toggleSortEmail = () => {
    if (sortEmail.value === 'none') {
        sortEmail.value = 'asc';
    } else if (sortEmail.value === 'asc') {
        sortEmail.value = 'desc';
    } else {
        sortEmail.value = 'none';
    }
    console.log('Sort Email:', sortEmail.value);
};

// Computed property for dynamic search and filtering
const filteredUsers = computed(() => {
    // Step 1: Filter users
    const result = users.filter(user => {
        const matchesSearch = searchQuery.value
            ? user.firstName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user.middleName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
            : true;

        const matchesClassification = selectedClassifications.value.length === 0 ||
            selectedClassifications.value.includes(user.assistance_id);

        return matchesSearch && matchesClassification;
    });

    // Step 2: Sort the filtered users if sort is enabled
    if (sortName.value !== 'none') {
        return [...result].sort((a, b) => {
            return sortName.value === 'asc'
                ? a.firstName.localeCompare(b.firstName)
                : b.firstName.localeCompare(a.firstName);
        });
    }

    if (sortEmail.value !== 'none') {
        return [...result].sort((a, b) => {
            return sortEmail.value === 'asc'
                ? a.email.localeCompare(b.email)
                : b.email.localeCompare(a.email);
        });
    }
    // Step 3: Return the filtered (but unsorted) users
    return result;
});





// composable action dropdown activator
const { openDropdownId, dropdownRefs, toggleDropdown } = useActionDropdown();

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

// // Pagination
// const currentPage = ref(1);
// const itemsPerPage = ref(10);
// // Total pages based on filtered results
// const totalPages = computed(() => {
//     return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
// });
// // Get paginated reports
// const paginatedUsers = computed(() => {
//     const start = (currentPage.value - 1) * itemsPerPage.value;
//     const end = start + itemsPerPage.value;
//     return filteredUsers.value.slice(start, end);
// });

// // Pagination controls
// const nextPage = () => {
//     if (currentPage.value < totalPages.value) {
//         currentPage.value++;
//     }
// };
// const prevPage = () => {
//     if (currentPage.value > 1) {
//         currentPage.value--;
//     }
// };
// const goToPage = (page) => {
//     if (page >= 1 && page <= totalPages.value) {
//         currentPage.value = page;
//     }
// };
// // Reset to first page when searching
// watch(searchQuery, () => {
//     currentPage.value = 1;
// });

// const maxVisiblePages = 3;

// const paginationStart = computed(() => {
//     if (currentPage.value <= Math.floor(maxVisiblePages / 2)) {
//         return 1;
//     } else if (currentPage.value + Math.floor(maxVisiblePages / 2) >= totalPages.value) {
//         return Math.max(1, totalPages.value - maxVisiblePages + 1);
//     } else {
//         return currentPage.value - Math.floor(maxVisiblePages / 2);
//     }
// });

// const paginationEnd = computed(() => {
//     return Math.min(totalPages.value, paginationStart.value + maxVisiblePages - 1);
// });

// const visiblePages = computed(() => {
//     return Array.from({ length: paginationEnd.value - paginationStart.value + 1 }, (_, i) => paginationStart.value + i);
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
} = usePagination(filteredUsers, { itemsPerPage: 10, maxVisiblePages: 3 })

watch(searchQuery, () => resetPage())


const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

// Email Masking
const maskEmail = (email) => {
    const parts = email.split('@')
    const name = parts[0]
    const domain = parts[1]

    if (name.length <= 2) {
        return name + '@' + domain // No masking for very short names
    }

    const maskedName = `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`
    return `${maskedName}@${domain}`
}

// generate pdf user
const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    printWindow.document.write(`
        <html>
            <head>
                <title>Printed Active Users</title>
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
                    <h1>Users Management - Printed Report</h1>
                    <p>Printed on: ${new Date().toLocaleString()}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Dashboard</th>
                            <th>Inventory</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredUsers.value.map(report => `
                            <tr>
                                <td>${report.id}</td>
                                <td>${report.firstName} {report.middleName} {report.lastName}</td>
                                <td>${report.email}</td>
                                <td>${report.for_911 ? `Has Access` : `No Access`}</td>
                                <td>${report.for_inventory ? `Has Access` : `No Access`}</
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="print-footer">
                    <p>Total Users: ${filteredUsers.value.length}</p>
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
    <section class="w-full min-h-screen">

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
                        <button @click="handlePrint"
                            class="flex items-center justify-center font-medium rounded-lg text-sm px-3 py-2 bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600">
                            Print Users
                        </button>
                    </div>
                </div>

               
                <div class="overflow-x-auto w-full">
                    <div v-if="isLoading" class="flex justify-center">
                    <Loader1 />
                </div>
                <table v-else class="w-full text-sm text-left">
                    <thead class="text-xs uppercase bg-teal-300 text-gray-800 dark:bg-slate-950 dark:text-gray-300">
                        <tr>
                            <th scope="col" class="px-4 py-3 text-center">ID</th>
                            <th scope="col" class="px-4 py-3 text-center"><button class="" @click="toggleSortName">NAME
                                    <i
                                        :class="sortName === 'asc' ? 'pi pi-sort-alpha-up' : (sortName === 'desc' ? 'pi pi-sort-alpha-down-alt' : 'pi pi-sort-alt')"></i></button>
                            </th>
                            <th scope="col" class="px-4 py-3 text-center"><button class=""
                                    @click="toggleSortEmail">EMAIL <i
                                        :class="sortEmail === 'asc' ? 'pi pi-sort-alpha-up' : (sortEmail === 'desc' ? 'pi pi-sort-alpha-down-alt' : 'pi pi-sort-alt')"></i></button>
                            </th>
                            <th scope="col" class="px-4 py-3 text-center">Roles</th>
                            <th scope="col" class="px-4 py-3">Verified</th>
                            <th scope="col" class="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in paginatedData" :key="user.id"
                            class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b dark:border-gray-700">
                            <td class="px-4 py-3 text-center">{{ user.id }}</td>
                            <td class="px-4 py-3 text-center">{{ user.firstName }} {{ user.middleName }} {{
                                user.lastName }}</td>
                            <td class="px-4 py-3 text-center">{{ maskEmail(user.email) }}</td>
                            <td class="px-4 py-3 text-center">
                                911: 
                                <Badge :Message="user.for_911 ? `Has Access` : `No Access`"
                                    :class="[user.for_911 ? 'bg-green-700' : 'bg-red-700', 'text-white']" />
                                Inventory: 
                                <Badge :Message="user.for_inventory ? `Has Access` : `No Access`"
                                    :class="[user.for_inventory ? 'bg-green-700' : 'bg-red-700', 'text-white']" />
                                Traffic: 
                                <Badge :Message="user.for_traffic ? `Has Access` : `No Access`"
                                    :class="[user.for_traffic ? 'bg-green-700' : 'bg-red-700', 'text-white']" />
                            </td>
                            <td class="px-4 py-3 text-center">
                                <Badge :Message="user.email_verified_at ? `Verified` : `Not Verified`"
                                    :class="[user.email_verified_at ? 'bg-green-700' : 'bg-red-700', 'text-white']" />
                            </td>
                            <td class="px-4 py-3 flex items-center justify-center relative">
                                <button @click.stop="toggleDropdown(user.id)"
                                    class="inline-flex items-center p-0.5 text-sm font-medium rounded-lg">
                                    <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                </button>

                                <div v-if="openDropdownId === user.id" 
                                    :ref="el => dropdownRefs[user.id] = el"
                                    class="absolute z-10 w-48 top-full right-0 shadow-sm border rounded-md bg-white dark:bg-slate-700">
                                    <ul class="py-2 text-sm">
                                        <li class="hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <PrimaryButton @click="'Change Password'"
                                                :name="'Change Password'"
                                                class="mt-2 hover:text-gray-700 dark:hover:text-gray-300" />
                                        </li>
                                        <li class="hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <PrimaryButton @click.prevent="dashboardRole(user)"
                                                :name="user.for_911 === 1 ? 'Deactive 911 Access' : 'Activate 911 Access'"
                                                class="mt-2 hover:text-gray-700 dark:hover:text-gray-300" />
                                        </li>
                                        <li class="hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <PrimaryButton @click.prevent="inventoryRole(user)"
                                                :name="user.for_inventory === 1 ? 'Deactive Inventory Access' : 'Activate Inventory Access'"
                                                class="mt-2 hover:text-gray-700 dark:hover:text-gray-300" />
                                        </li>
                                        <li class="hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <PrimaryButton @click.prevent="trafficRole(user)"
                                                :name="user.for_traffic === 1 ? 'Deactive Traffic Access' : 'Activate Traffic Access'"
                                                class="mt-2 hover:text-gray-700 dark:hover:text-gray-300" />
                                        </li>
                                        <li class="hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <PrimaryButton @click.prevent="archiveUser(user)" :name="'Archive User'"
                                                class="mt-2 hover:text-gray-700 dark:hover:text-gray-300" />
                                        </li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

                <nav
                    class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
                    <span class="text-sm font-normal">Showing {{ filteredUsers.length > 0 ? (currentPage - 1) *
                        itemsPerPage + 1 : 0 }} to {{
                            Math.min(currentPage * itemsPerPage, filteredUsers.length) }} of {{ filteredUsers.length
                        }}</span>

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
                                class="px-3 py-1 border hover:bg-gray-300 dark:hover:bg-slate-600">{{ totalPages
                                }}</button>
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

<style scoped></style>