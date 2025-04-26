<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="flex items-center justify-center w-full gap-7">
    <!-- Import File Button -->
    <RouterLink :to="{ name: 'ImportFile' }">
      <div
        class="h-40 w-40 bg-teal-500 rounded-lg flex flex-col items-center justify-center 
               hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600 text-white p-5 
               transition ease-out duration-300 group"
      >
        <!-- SVG is hidden by default and only shows on hover -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          class="h-20 w-20 hidden group-hover:flex transition-transform duration-300 scale-90 group-hover:scale-110"
        >
          <g><rect fill="none" height="24" width="24" /></g>
          <g>
            <path
              d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M7,9l1.41,1.41L11,7.83V16h2V7.83l2.59,2.58L17,9l-5-5L7,9z"
            />
          </g>
        </svg>
        
        <!-- Text is visible by default and hides on hover -->
        <span class="text-lg group-hover:hidden">
          Import An Excel File
        </span>
      </div>
    </RouterLink>

    <!-- Add Report Button -->
    <RouterLink :to="{ name: 'AddReport' }">
      <div
        class="h-40 w-40 bg-teal-500 rounded-lg flex flex-col items-center justify-center 
               hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600 text-white p-5 
               transition ease-out duration-300 group"
      >
        <!-- SVG is hidden by default and only appears on hover -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          class="h-20 w-20 hidden group-hover:flex transition-transform duration-300 scale-90 group-hover:scale-110"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
        </svg>

        <!-- Text is visible by default and hides on hover -->
        <span class="text-lg group-hover:hidden">
          Add A New Report Through Form
        </span>
      </div>
    </RouterLink>
  </div>
</template>

<style scoped></style>
