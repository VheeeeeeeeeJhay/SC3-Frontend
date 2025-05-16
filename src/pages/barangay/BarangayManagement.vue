<script setup>
import BarangaysTable from '../../components/tables/BarangaysTable.vue';
import { ref } from 'vue';
import DateRangePicker from "../../components/DateRangePicker.vue";

const startDate = ref(null);
const endDate = ref(null);

const updateDateRange = ({ start, end }) => {
    startDate.value = start;
    endDate.value = end;
};
</script>

<template>
  <div class="min-h-screen p-4">
    <!-- Title -->
    <div class="mt-6 px-2 flex justify-between">
      <h1 class="text-2xl font-bold dark:text-white">Barangays Management</h1>
      <div
        class="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-end flex-shrink-0">
        <DateRangePicker class="max-w-xs" @dateRangeSelected="updateDateRange" />
      </div>
    </div>

    <section class="w-full">
      <BarangaysTable :startDate="startDate" :endDate="endDate" />
    </section>
  </div>
</template>
