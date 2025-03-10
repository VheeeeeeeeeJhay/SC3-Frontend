<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axiosClient from '../../axios.js';
import { RouterLink } from 'vue-router';
import PrimaryButton from '../../components/PrimaryButton.vue';
import Loader1 from '../../components/Loader1.vue';
import Toast from '../../components/Toast.vue';
import PopupModal from '../../components/PopupModal.vue';
import Badge from '../../components/Badge.vue';

const users = ref([]);
const searchQuery = ref("");
const isLoading = ref(false);

const selectedClassifications = ref([]);


const fetchData = async () => {
    try {
        isLoading.value = true;
        await axiosClient.get('/api/911/users', {
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY
            }
        })
            .then((res) => {
                setTimeout(() => {
                    users.value = res.data; // Assuming reports are in the first index
                });
            })
            .catch((error) => {
                console.log(error.response.data.message);
            })
            .finally(() => {
                isLoading.value = false;
            });
    } catch (error) {
        console.log(error.response.data.message);
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


// Role
const dashboardRole = async (user) => {
    const newRoleStatus = user.for_911 === 1 ? 0 : 1; // Toggle based on user state

    try {
        await axiosClient.patch(`/api/911/user-dashboard-role/${user.id}`, {
            for_911: newRoleStatus
        }, {
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Content-Type': 'application/json',
            }
        });

        user.for_911 = newRoleStatus; // Update local state instantly
    } catch (error) {
        console.error(error.response?.data?.message || error.message);
    }
};

const inventoryRole = async (user) => {
    const newRoleStatus = user.for_inventory === 1 ? 0 : 1; // Toggle based on user state

    try {
        await axiosClient.patch(`/api/911/user-inventory-role/${user.id}`, {
            for_inventory: newRoleStatus
        }, {
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Content-Type': 'application/json',
            }
        });

        user.for_inventory = newRoleStatus; // Update local state instantly
    } catch (error) {
        console.error(error.response?.data?.message || error.message);
    }
};
</script>

<template>
    <section class="w-full min-h-screen">
        <!-- Titleee -->
        <div class="mt-6 px-2 flex justify-between">
            <h1 class="text-2xl font-bold dark:text-white">Users Management</h1>
        </div>
        <div class="mt-6 px-4 w-full">
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
                                <Badge :Message="`Has Access`" v-if="user.for_911 === 1" />
                                <Badge :Message="`No Access`" v-else />
                            </td>
                            <td class="px-4 py-3">
                                <Badge :Message="`Has Access`" v-if="user.for_inventory === 1" />
                                <Badge :Message="`No Access`" v-else />
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
                                            <!-- <PrimaryButton @click.prevent="dashboardRole(user.id)" 
                                                name="Grant Access Dashboard" 
                                                v-if="user.for_911 === 0" class="mt-2 hover:text-gray-700 dark:hover:text-gray-300"/>
                                                <PrimaryButton @click.prevent="dashboardRole(user.id)" 
                                                name="Revoke Access Dashboard" 
                                                v-if="user.for_911 === 1" class="mt-2 hover:text-gray-700 dark:hover:text-gray-300"/> -->
                                            <PrimaryButton @click.prevent="dashboardRole(user)"
                                                :name="user.for_911 === 1 ? 'Revoke Access Dashboard' : 'Grant Access Dashboard'"
                                                class="mt-2 hover:text-gray-700 dark:hover:text-gray-300" />
                                        </li>
                                        <li>
                                            <!-- <PrimaryButton @click.prevent="inventoryRole(user.id)" 
                                                name="Grant Access Inventory" 
                                                v-if="user.for_inventory === 0" class="mt-2 hover:text-gray-700 dark:hover:text-gray-300"/>
                                            <PrimaryButton @click.prevent="inventoryRole(user.id)" 
                                            name="Revoke Access Inventory" 
                                            v-if="user.for_inventory === 1" class="mt-2 hover:text-gray-700 dark:hover:text-gray-300"/> -->
                                            <PrimaryButton @click.prevent="inventoryRole(user)"
                                                :name="user.for_inventory === 1 ? 'Revoke Access Inventory' : 'Grant Access Inventory'"
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
                        <li><button @click="prevPage" :disabled="currentPage === 1"
                                class="px-3 py-1 rounded-l-lg border hover:bg-gray-300 dark:hover:bg-slate-600">Previous</button>
                        </li>
                        <li v-for="page in totalPages" :key="page">
                            <button @click="goToPage(page)"
                                :class="['px-3 py-1 border', currentPage === page ? 'bg-slate-500 text-white border-black' : 'hover:bg-gray-300 dark:hover:bg-slate-600']">
                                {{ page }}
                            </button>
                        </li>
                        <li><button @click="nextPage" :disabled="currentPage === totalPages"
                                class="px-3 py-1 rounded-r-lg border hover:bg-gray-300 dark:hover:bg-slate-600">Next</button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </section>

</template>