<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import axiosClient from  '../../axios.js';
import Badge from '../../components/Badge.vue';
import { useDatabaseStore } from "../../stores/databaseStore";

const selectedClassifications = ref([]);

const searchQuery = ref('');
const message = ref('');
const errors = ref('');
const icon = ref('');
const classes = ref('');
const type = ref('');

const isLoading = ref(false);

let refreshInterval = null;

const databaseStore = useDatabaseStore()

const dashboardRole = async (user) => {
    const newRoleStatus = user.for_911 === 1 ? 0 : 1; // Toggle based on user state

    // Prevent both roles from being false at the same time
    if (newRoleStatus === 0 && user.for_inventory === 0) {
        // alert('At least 1 role must be active');
        type.value = 'warning';
        message.value = 'At least 1 role must be active';
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
        console.log('Role updated successfully');
        // Update local state instantly
        user.for_911 = newRoleStatus;
        type.value = 'success';
        message.value = response.data.message;
    } catch (error) {
        type.value = 'error';
        console.error(error.response?.data?.error);
        errors.value = error.response?.data?.error || 'Failed to update role';
    }
};

// Inventory Role
const inventoryRole = async (user) => {
    const newRoleStatus = user.for_inventory === 1 ? 0 : 1; // Toggle based on user state

    // Prevent both roles from being false at the same time
    if (newRoleStatus === 0 && user.for_911 === 0) {
        // alert('At least 1 role must be active');
        type.value = 'warning';
        message.value = 'At least 1 role must be active';
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
        type.value = 'success';
        user.for_inventory = newRoleStatus;
        message.value = response.data.message;
    } catch (error) {
        type.value = 'error';
        console.error(error.response?.data?.message || error.message);
        errors.value = error.response?.data?.error || 'Failed to update role';
    }
};

// Archive User
const archiveUser = async (user) => {
    try {
        const response = await axiosClient.patch(`/api/911/user-archive/${user.id}`, { for_911: 0, for_inventory: 0 },
            {
                headers: {
                    'x-api-key': import.meta.env.VITE_API_KEY,
                }
            });

        // Update local state instantly
        type.value = 'success';
        message.value = response.data.message;
        user.for_911 = 0;
        user.for_inventory = 0;
    } catch (error) {
        type.value = 'error';
        console.error(error.response?.data?.message || error.message);
        errors.value = error.response?.data?.error || 'Failed to archive user';
    }
};

// Computed property for dynamic search and filtering
const filteredUsers = computed(() => {
    return users.value.filter(user => {
        const matchesSearch = searchQuery.value
            ? user.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user.middleName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
            : true;

        const matchesClassification = selectedClassifications.value.length === 0 ||
            selectedClassifications.value.includes(user.assistance_id);

        return matchesSearch && matchesClassification;
    });
});

// Dropdown
const dropListener = () => {
    document.addEventListener("click", (event) => {
        if (
            openDropdownId.value !== null &&
            !dropdownRefs.value[openDropdownId.value]?.contains(event.target)
        ) {
            closeDropdown();
        }
    });
}

onMounted(() => {
    // fetchData();
    databaseStore.fetchData();

    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);

    // ------------------------------------------
    dropListener();
});

const computedProperties = {
    users: "activeUsers",
};

const { 
    users
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);


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
    return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});
// Get paginated reports
const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredUsers.value.slice(start, end);
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
                </div>

                <div v-if="isLoading" class="flex justify-center">
                    <Loader1 />
                </div>

                <table v-else class="w-full text-sm text-left">
                    <thead class="text-xs uppercase bg-teal-300 text-gray-800 dark:bg-slate-950 dark:text-gray-300">
                        <tr>
                            <th scope="col" class="px-4 py-3">ID</th>
                            <th scope="col" class="px-4 py-3">Name</th>
                            <th scope="col" class="px-4 py-3">Email</th>
                            <th scope="col" class="px-4 py-3">Dashboard</th>
                            <th scope="col" class="px-4 py-3">Inventory</th>
                            <th scope="col" class="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in paginatedUsers" :key="user.id"
                            class="bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                            <td class="px-4 py-3">{{ user.id }}</td>
                            <td class="px-4 py-3">{{ user.firstName }} {{ user.middleName }} {{ user.lastName }}</td>
                            <td class="px-4 py-3">{{ maskEmail(user.email) }}</td>
                            <td class="px-4 py-3">
                                <Badge :Message="user.for_911 ? `Has Access` : `No Access`"
                                    :class="[user.for_911 ? 'bg-green-700' : 'bg-red-700']" />
                            </td>
                            <td class="px-4 py-3">
                                <Badge :Message="user.for_inventory ? `Has Access` : `No Access`"
                                    :class="[user.for_inventory ? 'bg-green-700' : 'bg-red-700']" />
                            </td>
                            <td class="px-4 py-3 flex items-center relative">
                                <button @click.stop="toggleDropdown(user.id)"
                                    class="inline-flex items-center p-0.5 text-sm font-medium rounded-lg">
                                    <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                </button>

                                <div v-if="openDropdownId === user.id" ref="dropdownRefs"
                                    class="absolute z-10 w-44 mt-2 top-full left-0 shadow-sm border rounded-md bg-white dark:bg-slate-700">
                                    <ul class="py-2 text-sm">
                                        <li>
                                            <PrimaryButton @click.prevent="dashboardRole(user)"
                                                :name="user.for_911 === 1 ? 'Revoke Access' : 'Grant Access'"
                                                class="mt-2 hover:text-gray-700 dark:hover:text-gray-300" />
                                        </li>
                                        <li>
                                            <PrimaryButton @click.prevent="inventoryRole(user)"
                                                :name="user.for_inventory === 1 ? 'Revoke Access' : 'Grant Access'"
                                                class="mt-2 hover:text-gray-700 dark:hover:text-gray-300" />
                                        </li>
                                        <li>
                                            <PrimaryButton @click.prevent="archiveUser(user)"
                                                :name="'Archive User'"
                                                class="mt-2 hover:text-gray-700 dark:hover:text-gray-300" />
                                        </li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

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
    <!-- <Toast v-if="message" :message="message" :icon="icon" :classes="classes" /> -->

    <div class="flex flex-col fixed top-17 right-5 w-1/2 items-end">
        <Toast v-if="message" :message="message" :icon="icon" :classes="classes" :type="type"/>
        <Toast v-if="errors" :message="errors" :icon="icon" :classes="classes" :type="type"/>
    </div>

    
</template>

<style scoped>
</style>