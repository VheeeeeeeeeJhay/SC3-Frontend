<script setup>
import ReportsTable from '../../components/tables/ReportsTable.vue';
import DateRangePicker from "../../components/DateRangePicker.vue";
import { ref } from 'vue';

const startDate = ref(null);
const endDate = ref(null);

const updateDateRange = ({ start, end }) => {
    startDate.value = start;
    endDate.value = end;
};
</script>

<template>
    <section class="w-full min-h-screen p-4">
        <!-- Titleee -->
        <div class="mt-6 px-2 flex justify-between">
            <h1 class="text-2xl font-bold dark:text-white">Reports Management</h1>
            <div
                class="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-end flex-shrink-0">
                <DateRangePicker class="max-w-xs" @dateRangeSelected="updateDateRange" />
            </div>
        </div>

        <ReportsTable :startDate="startDate" :endDate="endDate" />
    </section>
</template>
