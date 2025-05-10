<script setup>
import AuditsTable from '../../components/tables/AuditsTable.vue';
</script>

<template>
    <div class="w-full min-h-screen p-4">
        <div class="mt-6 px-2 flex justify-between">
            <h1 class="text-2xl font-bold dark:text-white">Logs Management</h1>
        </div>

        <AuditsTable />
    </div>
</template>

<style scoped></style>