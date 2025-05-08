<script setup>
import { ref } from 'vue';
import ArchiveTabs from './ArchiveTabs.vue';
import ActiveTabs from './ActiveTabs.vue';

// Define the active tab using a reactive reference
const activeTab = ref('active'); // Set the default active tab to 'active'
</script>

<template>
  <div class="mt-6 border-b border-gray-200 dark:border-gray-700">
    <ul class="flex flex-col sm:flex-row -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
      <!-- Active Tab -->
      <li class="me-0 sm:me-2 w-full sm:w-1/2">
        <a 
          href="#" 
          class="inline-flex items-center justify-center gap-1 sm:gap-2 p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group w-full"
          :class="{ 'text-teal-600 border-teal-600 dark:text-teal-500 dark:border-teal-500': activeTab === 'active' }"
          @click.prevent="activeTab = 'active'" 
        >
          <span class="material-icons text-base sm:text-lg">people_alt</span> 
          <span class="text-xs sm:text-sm">ACTIVE</span>
        </a>
      </li>

      <!-- Archive Tab -->
      <li class="me-0 sm:me-2 w-full sm:w-1/2">
        <a 
          href="#" 
          class="inline-flex items-center justify-center gap-1 sm:gap-2 p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group w-full"
          :class="{ 'text-teal-600 border-teal-600 dark:text-teal-500 dark:border-teal-500': activeTab === 'archive' }"
          @click.prevent="activeTab = 'archive'"
        >
          <span class="material-icons text-base sm:text-lg">archive</span> 
          <span class="text-xs sm:text-sm">ARCHIVE</span>
        </a>
      </li>
    </ul>
  </div>

  <!-- Display content based on the active tab -->
  <div v-if="activeTab === 'active'">
    <ActiveTabs />
  </div>
  <div v-if="activeTab === 'archive'">
    <ArchiveTabs />
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>
