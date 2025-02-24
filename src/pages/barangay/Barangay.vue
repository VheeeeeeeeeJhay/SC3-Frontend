<script setup>
import { ref, onMounted } from 'vue';
import { FwbA, FwbTable, FwbTableBody, FwbTableCell, FwbTableHead, FwbTableHeadCell, FwbTableRow } from 'flowbite-vue';
import PrimaryButton from '../../components/PrimaryButton.vue';
import AddBarangay from './AddBarangay.vue';
import axiosClient from '../../axios.js';
import Modal from '../../components/Modal.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const formVisibility = ref(false);
const barangays = ref([]);
const errorMessage = ref('');
const errors = ref('');
const isLoading = ref(false);

const openForm = () => {
  formVisibility.value = true;
};

const closeForm = () => {
  formVisibility.value = false;
};

onMounted(() => {
  isLoading.value = true;
  axiosClient.get('/api/911/barangay', {
      headers: {
          'x-api-key': '$m@rtC!ty'
      }
  })
  .then((res) => {
      // console.log(res);
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
});

// Pass The ID To Delete
const formSubmit = (barangay_Id) => {
    errors.value = ''; // 🔹 Reset errors before making a request
    axiosClient.delete(`/api/911/barangay-delete/${barangay_Id}`, {
        headers: {
            'x-api-key': '$m@rtC!ty'
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
</script>

<template>
  <div v-if="!formVisibility">
    <PrimaryButton name="Add New Barangay" @click.prevent="openForm"
      class="bg-white text-green-700 border border-2 border-green-700 font-bold hover:bg-green-700 hover:text-white hover:shadow-md" />
  </div>
  <div v-else="formVisibility">
    <PrimaryButton name="Back to DataTable" @click.prevent="closeForm"
      class="bg-red-500 hover:bg-red-600 hover:shadow-md" />
  </div>

  <Modal />

  <div v-if="formVisibility">
    <AddBarangay />
  </div>
  <div v-else>
    <div v-if="errorMessage">
      <p class="text-red-500">{{ errorMessage }}</p>
    </div>

    <!-- render loading animation before displaying datatable -->
    <div v-if="isLoading" class="flex justify-center">
      <div role="status">
          <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
          <span class="sr-only">Loading...</span>
      </div>
    </div>
    

    <div v-else>
      <div v-if="barangays.length > 0">
          <fwb-table hoverable>
              <fwb-table-head>
                  <fwb-table-head-cell class="text-center" v-for="(value, key) in barangays[0]" :key="key">
                      {{ key }}
                  </fwb-table-head-cell>
                  <fwb-table-head-cell class="text-center">Action</fwb-table-head-cell>
              </fwb-table-head>
              <fwb-table-body>
                  <fwb-table-row v-for="barangay in barangays" :key="barangay.id" class="text-center">
                      <fwb-table-cell>{{ barangay.id }}</fwb-table-cell>
                      <fwb-table-cell>{{ barangay.name }}</fwb-table-cell>
                      <fwb-table-cell>{{ barangay.longitude }}</fwb-table-cell>
                      <fwb-table-cell>{{ barangay.latitude }}</fwb-table-cell>
                      <fwb-table-cell class="justify-center flex">
                          <RouterLink class="p-2" :to="{ name: 'EditBarangay', params: { id: barangay.id } }">
                              <PrimaryButton name="Edit" class="bg-blue-500 hover:bg-blue-600 hover:shadow-md text-white" />
                          </RouterLink>
                          <div class="p-2">
                              <PrimaryButton @click.prevent="formSubmit(barangay.id)" name="Delete" class="bg-red-500 hover:bg-red-600 hover:shadow-md text-white" />
                          </div>
                      </fwb-table-cell>
                  </fwb-table-row>
              </fwb-table-body>
          </fwb-table>
      </div>
      <div v-else>
          <p>No Barangays found.</p>
      </div>
    </div>
    
  </div>
</template>
