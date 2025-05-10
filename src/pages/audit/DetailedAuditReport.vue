<script setup>
import { ref, computed } from 'vue';
import { useArrayStore } from '../../stores/arrayStore';
import { useRouter } from 'vue-router';
import axiosClient from  '../../axios.js';
import DetailedAuditReportsTable from '../../components/tables/DetailedAuditReportsTable.vue';

const router = useRouter();

const storage = ref([]);
const store = useArrayStore();
storage.value = store.getData();

const parsedInnerData = computed(() => {
  if (!storage.value.data) return [];

  try {
    const data = JSON.parse(storage.value.data);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Invalid JSON in storage.data", error);
    return [];
  }
});

const formattedStorageDate = computed(() => {
  if (!storage.value?.created_at) return '';
  const date = new Date(storage.value.created_at);
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});
</script>

<template>
    <div class="w-full min-h-screen p-4">
        <div class="mt-6 px-2 flex justify-between">
            <h1 class="text-2xl font-bold dark:text-white">Detailed Audit Report</h1>
            <button type="button" name="Back" @click.prevent="router.back()"
                class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
                <span class="material-icons mr-2">
                    arrow_back
                </span>
                Back
            </button>
        </div>

        <div class="mt-6 relative shadow-md sm:rounded-lg bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white mb-6">
            <table class="w-full text-sm text-left">
                <thead class="text-xs uppercase bg-teal-300 text-gray-800 dark:bg-slate-950 dark:text-gray-300">
                    <tr>
                        <th scope="col" class="px-4 py-3 text-center">ID</th>
                        <th scope="col" class="px-4 py-3 text-center">Category</th>
                        <th scope="col" class="px-4 py-3 text-center">Action</th>
                        <th scope="col" class="px-4 py-3 text-center">Description</th>
                        <th scope="col" class="px-4 py-3 text-center">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="bg-sky-50 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                        <td class="px-4 py-3 text-center">{{ storage.id }}</td>
                        <td class="px-4 py-3 text-center">{{ storage.category }}</td>
                        <td class="px-4 py-3 text-center">{{ storage.action }}</td>
                        <td class="px-4 py-3 text-center">{{ storage.description }}</td>
                        <td class="px-4 py-3 text-center">{{ formattedStorageDate }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <DetailedAuditReportsTable />
    </div>
</template>

<style scoped></style>