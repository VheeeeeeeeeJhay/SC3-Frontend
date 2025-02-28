<script setup>
import { ref, onMounted, computed } from 'vue';
import PrimaryButton from '../../components/PrimaryButton.vue';
import AddBarangay from './AddBarangay.vue';
import EditBarangay from './EditBarangay.vue';
import axiosClient from '../../axios.js';
import Modal from '../../components/Modal.vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '../../stores/themeStore';
import Loader1 from '../../components/Loader1.vue';

// For dark mode
const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "bg-slate-800 border border-gray-600 text-gray-200"
    : "bg-sky-50 border border-gray-200 text-gray-800 shadow-sm";
});

// Hover styles (separate for reusability)
const hoverClasses = computed(() => {
  return themeStore.isDarkMode 
  ? "border border-black hover:bg-slate-700 hover:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:outline-none" 
  : "border border-gray-700 hover:bg-sky-100 hover:border-gray-500 focus:ring-2 focus:ring-sky-400 focus:outline-none";
});
const barangays = ref([]);
const errorMessage = ref('');
const errors = ref('');
const isLoading = ref(false);
const selectedBarangay = ref(null);

onMounted(() => {
  isLoading.value = true;
  axiosClient.get('/api/911/barangay', {
      headers: {
          'x-api-key': import.meta.env.VITE_API_KEY
      }
  })
  .then((res) => {
      // console.log(res);
      console.log(res);
      // barangays.value = res.data;
      // isLoading.value = false;
      setTimeout(() => {
          barangays.value = res.data;
          isLoading.value = false; // Stop loading after delay
      }, 1500);
  })
  .catch((error) => {
      isLoading.value = false;
      console.error('Error fetching data:', error);
      errorMessage.value = 'Failed to load barangays. Please try again later.';
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

const classifications = ref([]);
const searchQuery = ref("");
//search query
const selectedClassifications = ref([]);

// Computed property for dynamic search and filtering
const filteredBarangays = computed(() => {
  return barangays.value.filter(barangay => {
    const barangayName = barangay.name?.toLowerCase() || "";
    const barangayId = String(barangay.id)?.toLowerCase() || "";
    const barangayLat = String(barangay.latitude)?.toLowerCase() || "";
    const barangayLong = String(barangay.longitude)?.toLowerCase() || "";
    const query = searchQuery.value.toLowerCase();

    // Match search query
    const matchesSearch = query
      ? barangayId.includes(query) ||
        barangayName.includes(query) ||
        barangayLat.includes(query) ||
        barangayLong.includes(query)
      : true;

    // const matchesClassification = selectedClassifications.value.length === 0 || 
    //   selectedClassifications.value.includes(barangay.assistance_id);

    // return matchesSearch && matchesClassification;
    return matchesSearch;
  });
});


// Pass The ID To Delete
const formSubmit = (barangay_Id) => {
    errors.value = ''; // 🔹 Reset errors before making a request
    axiosClient.delete(`/api/911/barangay-delete/${barangay_Id}`, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
    .then(() => {
        // Remove the deleted barangay from the list without refreshing the page
        barangays.value = barangays.value.filter(b => b.id !== barangay_Id);
        console.log('Barangay deleted successfully');
    })
    .catch(error => {
        console.error('Error deleting barangay:', error.response?.data);
        errors.value = error.response?.data?.errors || 'Failed to delete barangay.';
    });
};

// For Modal
const isModalOpen = ref(false)
const openModal = () => {
   isModalOpen.value = true;
   console.log("🚀 ~ openModal ~ isModalOpen:", isModalOpen.value)
};

const isEditModalOpen = ref(false)
const openEditModal = (barangay) => {
  selectedBarangay.value = barangay; // Store barangay details
  isEditModalOpen.value = true;
   console.log("🚀 ~ openModal ~ isEditModalOpen:", isEditModalOpen.value)
};

//for dropdown
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
const itemsPerPage = ref(10); // Number of reports per page
const totalItems = computed(() => barangays.value.length); // Total number of reports
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value)); // Calculate total pages

const paginatedBarangays = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredBarangays.value.slice(start, end);
});
</script>

<template>
  <div class="min-h-screen">
    <div v-if="errorMessage">
      <p class="text-red-500">{{ errorMessage }}</p>
    </div>


      <!-- <div v-if="barangays.length > 0" > -->
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
                                      <span class="material-icons">
                                          search
                                      </span>
                                  </div>
                                  <input 
                                  v-model="searchQuery"
                                  type="text" 
                                  id="simple-search"
                                  class="border text-sm rounded-lg block w-full pl-10 p-2"
                                  :class="hoverClasses"
                                  placeholder="Search..."
                                  />

                              </div>
                          </form>
                      </div>
                      <div
                          class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0" >
                          
                              <button @click.stop="openModal()" type="button"
                                  class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium focus:outline-none border rounded-lg" :class="hoverClasses">
                                  <span class="material-icons">
                                      add
                                  </span>
                                  Add Barangay
                              </button>
                              <Modal v-if="isModalOpen" v-model="isModalOpen" @click.stop :modal-title="'Add Barangay'">
                                <template #contents>
                                  <div class="p-6">
                                    <AddBarangay />
                                  </div>
                                  <!-- <FormInput /> -->
                                </template>
                              </Modal>
                          
                          <div class="flex items-center space-x-3 w-full md:w-auto relative">

                              <!-- Filter Dropdown Menu -->
                              <div
                              id="filterDropdown"
                              v-show="isFilterDropdownOpen"
                              class="absolute top-full left-0 z-10 w-48 p-3 bg-white rounded-lg shadow"
                              >
                              <h6 class="mb-3 text-sm font-medium">Choose Classification</h6>
                                  <ul class="space-y-2 text-sm">
                                      <li v-for="classification in classifications" :key="classification.id" class="flex items-center">
                                          <input
                                            type="checkbox"
                                            :id="classification.id"
                                            :value="classification.id"
                                            v-model="selectedClassifications"
                                            class="w-4 h-4"
                                          />
                                          <label :for="classification.id" class="ml-2 text-sm font-medium">{{ classification.assistance }}</label>
                                      </li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="">
                      <!-- render loading animation before displaying datatable -->
                      <div v-if="isLoading" class="flex justify-center">
                        <Loader1 />
                      </div>
                      <table v-else class="w-full text-sm text-left border border-gray-600 divide-y divide-gray-600"
                        :class="themeStore.isDarkMode ? 'text-gray-300' : 'text-gray-800'">
                        
                        <thead class="text-xs uppercase"
                          :class="themeStore.isDarkMode ? 'bg-slate-900 text-gray-300' : 'bg-teal-300 text-gray-800'">
                          <tr>
                            <th scope="col" class="px-4 py-3">Barangay ID</th>
                            <th scope="col" class="px-4 py-3">Barangay Name</th>
                            <th scope="col" class="px-4 py-3">Barangay Longitude</th>
                            <th scope="col" class="px-4 py-3">Barangay Latitude</th>
                            <th scope="col" class="px-4 py-3">Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr v-for="barangay in paginatedBarangays" :key="barangay.id"
                            :class="themeStore.isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-50 hover:bg-gray-100'">
                            
                            <td class="px-4 py-3 border border-gray-600">{{ barangay.id }}</td>
                            <td class="px-4 py-3 border border-gray-600">{{ barangay.name }}</td>
                            <td class="px-4 py-3 border border-gray-600">{{ barangay.longitude }}</td>
                            <td class="px-4 py-3 border border-gray-600">{{ barangay.latitude }}</td>
                            
                            <td class="px-4 py-3 border border-gray-600">
                              <div class="p-2 space-x-2">
                                <PrimaryButton @click.stop="openEditModal(barangay)" name="Edit"
                                  class="bg-blue-500 hover:bg-blue-600 text-gray-100 shadow-md" />
                                <PrimaryButton @click.prevent="formSubmit(barangay.id)" name="Delete"
                                  class="bg-red-500 hover:bg-red-600 text-gray-100 shadow-md" />
                              </div>
                            </td>
                          </tr>
                        </tbody>

                      </table>

                  </div>
                  <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
                      <span class="text-sm font-normal">
                          Showing
                          <span class="font-semibold">{{ (currentPage - 1) * itemsPerPage + 1 }} - 
                          {{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
                          of
                          <span class="font-semibold">{{ totalItems }}</span>
                      </span>
                      
                      <ul class="inline-flex items-stretch -space-x-px">
                          <!-- Previous Page -->
                          <li>
                              <button 
                                  @click="currentPage = Math.max(1, currentPage - 1)" 
                                  :disabled="currentPage === 1"
                                  class="flex items-center justify-center h-full py-1.5 px-3 ml-0 rounded-l-lg border"
                                  :class="hoverClasses">
                                  <span class="sr-only">Previous</span>
                                  <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg">
                                      <path fill-rule="evenodd"
                                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                          clip-rule="evenodd" />
                                  </svg>
                              </button>
                          </li>

                          <!-- Page Numbers -->
                          <li v-for="page in totalPages" :key="page">
                              <button 
                                  @click="currentPage = page" 
                                  :class="[hoverClasses, { [hoverClasses]: page === currentPage }]"
                                  class="flex items-center justify-center text-sm py-2 px-3 leading-tight border">
                                  {{ page }}
                              </button>
                          </li>

                          <!-- Next Page -->
                          <li>
                              <button 
                                  @click="currentPage = Math.min(totalPages, currentPage + 1)" 
                                  :disabled="currentPage === totalPages"
                                  class="flex items-center justify-center h-full py-1.5 px-3 leading-tight rounded-r-lg border"
                                  :class="hoverClasses">
                                  <span class="sr-only">Next</span>
                                  <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg">
                                      <path fill-rule="evenodd"
                                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                          clip-rule="evenodd" />
                                  </svg>
                              </button>
                          </li>
                      </ul>
                  </nav>
              </div>
          </div>
              <!-- Edit Barangay Modal -->
            <div>
              <!-- Use the modal component and bind the v-model -->
              <Modal v-if="isEditModalOpen" v-model="isEditModalOpen" @click.stop >
                <template #contents>
                  <div class="p-6">
                    <EditBarangay v-if="selectedBarangay" :barangay="selectedBarangay" />
                  </div>
                  <!-- <FormInput /> -->
                </template>
              </Modal>
            </div>
          </section>

      </div>
      <!-- <div v-else>
          <p>No Barangays found.</p>
      </div> -->

<!-- </div> -->
</template>
