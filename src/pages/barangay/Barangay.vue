<script setup>
import { ref, onMounted } from 'vue';
import { FwbA, FwbTable, FwbTableBody, FwbTableCell, FwbTableHead, FwbTableHeadCell, FwbTableRow } from 'flowbite-vue'
import PrimaryButton from '../../components/PrimaryButton.vue';
import AddBarangay from './AddBarangay.vue';
import axiosClient from '../../axios.js';
import Modal from '../../components/Modal.vue';

const formVisibility = ref(false);

const openForm = () => {
  formVisibility.value = true;
};

const closeForm = () => {
  formVisibility.value = false;
};

const barangays = ref([]);

const errorMessage = ref('');

onMounted(() => {
  axiosClient.get('/api/911/barangay', {
      headers: {
          'x-api-key': '$m@rtC!ty'
      }
  })
  .then((res) => {
      console.log(res);
      barangays.value = res.data;
  })
  .catch((error) => {
      console.error('Error fetching data:', error);
      errorMessage.value = 'Failed to load barangays. Please try again later.';
  });
});

const openEditForm = (barangayId) => {
  console.log(barangayId);
  axiosClient.put(`/api/911/barangay/${barangayId}`, {}, {
    headers: {
        'x-api-key': '$m@rtC!ty'
    }
    })
    .then((res) => {
      console.log(res);
      // router.push({ name: 'EditBarangay', params: { id: barangayId } });
    })
    .catch((error) => {
    console.error('Error fetching data:', error);
    errorMessage.value = 'Failed to load barangays. Please try again later.';
    });
}
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
    <fwb-table hoverable>
      <fwb-table-head>
        <fwb-table-head-cell class="text-center" v-for="(value, key) in barangays[0]" :key="key">
          {{ key }}
        </fwb-table-head-cell>
      </fwb-table-head>
      <fwb-table-body>
        <fwb-table-row v-for="barangay in barangays" :key="barangay.id" class="text-center">
          <fwb-table-cell>{{ barangay.id }}</fwb-table-cell>
          <fwb-table-cell>{{ barangay.name }}</fwb-table-cell>
          <fwb-table-cell>{{ barangay.longitude }}</fwb-table-cell>
          <fwb-table-cell>{{ barangay.latitude }}</fwb-table-cell>
          <fwb-table-cell>
            <!-- <PrimaryButton name="Edit" @click="openEditForm(barangay.id)" :value="barangay.id" /> -->
            <RouterLink :to="{ name: 'EditBarangay', params: { id: barangay.id } }">
              Edit
            </RouterLink>
          </fwb-table-cell>
        </fwb-table-row>
      </fwb-table-body>
    </fwb-table>
  </div>
</template>
