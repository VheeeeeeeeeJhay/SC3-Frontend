<template>
  <div>
    <button @click="showModal" class="block text-white bg-blue-700 hover:bg-blue-800">
      Toggle modal
    </button>

    <!-- Main modal -->
    <div v-if="isShowModal" @close="closeModal" id="progress-modal" tabindex="-1" aria-hidden="true" class="fixed top-0 right-0 left-0 z-50 flex items-center justify-center w-full h-full">
      <div class="relative p-4 w-full max-w-md max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <button @click="closeModal" type="button" class="absolute top-3 right-3 text-gray-400 hover:bg-gray-200 rounded-lg">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
          <div class="p-4 md:p-5">
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const isShowModal = ref(false);

function closeModal() {
  isShowModal.value = false;
}

function showModal() {
  isShowModal.value = true;
}
</script>