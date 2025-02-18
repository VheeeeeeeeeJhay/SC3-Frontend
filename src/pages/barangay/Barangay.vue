<template>

  
    <div v-if="!formVisibility">
      <PrimaryButton name="Add New Barangay" @click.prevent="openForm" class="bg-green-500 hover:bg-green-600 hover:shadow-md"/>
    </div>
    <div v-else="formVisibility">
      <PrimaryButton name="Close Add Form" @click.prevent="closeForm" class="bg-red-500 hover:bg-red-600 hover:shadow-md"/>
    </div>
    
  
    <div v-if="formVisibility">
      <AddBarangay />
    </div>

    <div>

    <fwb-table hoverable>
    <fwb-table-head>
      <fwb-table-head-cell>Product name</fwb-table-head-cell>
      <fwb-table-head-cell>Color</fwb-table-head-cell>
      <fwb-table-head-cell>Category</fwb-table-head-cell>
      <fwb-table-head-cell>Price</fwb-table-head-cell>
      <fwb-table-head-cell>
        <span class="sr-only">Edit</span>
      </fwb-table-head-cell>
    </fwb-table-head>
    <fwb-table-body>
      <fwb-table-row>
        <fwb-table-cell>Apple MacBook Pro 17"</fwb-table-cell>
        <fwb-table-cell>Sliver</fwb-table-cell>
        <fwb-table-cell>Laptop</fwb-table-cell>
        <fwb-table-cell>$2999</fwb-table-cell>
        <fwb-table-cell>
          <fwb-a href="#">
            Edit
          </fwb-a>
        </fwb-table-cell>
      </fwb-table-row>
      <fwb-table-row>
        <fwb-table-cell>Microsoft Surface Pro</fwb-table-cell>
        <fwb-table-cell>White</fwb-table-cell>
        <fwb-table-cell>Laptop PC</fwb-table-cell>
        <fwb-table-cell>$1999</fwb-table-cell>
        <fwb-table-cell>
          <fwb-a href="#">
            Edit
          </fwb-a>
        </fwb-table-cell>
      </fwb-table-row>
      <fwb-table-row>
        <fwb-table-cell>Magic Mouse 2</fwb-table-cell>
        <fwb-table-cell>Black</fwb-table-cell>
        <fwb-table-cell>Accessories</fwb-table-cell>
        <fwb-table-cell>$99</fwb-table-cell>
        <fwb-table-cell>
          <fwb-a href="#">
            Edit
          </fwb-a>
        </fwb-table-cell>
      </fwb-table-row>
    </fwb-table-body>
  </fwb-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  FwbA,
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow,
} from 'flowbite-vue'
import { RouterLink } from 'vue-router';
import PrimaryButton from '../../components/PrimaryButton.vue';
import AddBarangay from './AddBarangay.vue';


const navigation = [
  { name: 'AddBarangay', to: { name: 'AddBarangay' } },
]

const formVisibility = ref(false);

const openForm = () => {
  console.log('Form opened');
  formVisibility.value = true;
};

const closeForm = () => {
  console.log('Form closed');
  formVisibility.value = false;
};
</script>

