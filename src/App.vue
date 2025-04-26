<script setup>
import { ref, provide } from 'vue';

const toasts = ref([]);

// Function to add a toast
const addToast = (message, type = 'info', icon = '') => {
  const id = Date.now();
  toasts.value.push({ id, message, type, icon });

  // Auto-remove after 5 minutes (300,000 ms)
  setTimeout(() => {
    toasts.value = toasts.value.filter(toast => toast.id !== id);
  }, 15000);
};

// Function to remove a toast manually
const removeToast = (id) => {
  toasts.value = toasts.value.filter(toast => toast.id !== id);
};

// Provide the `addToast` function to be used globally
provide('addToast', addToast);
</script>

<template>
  <RouterView />


  <div class="flex flex-col fixed top-17 right-5 w-1/2 items-end">
    <Toast 
      v-for="toast in toasts" 
      :key="toast.id" 
      :message="toast.message" 
      :type="toast.type" 
      :icon="toast.icon"
      :id="toast.id"
      @remove="removeToast"
    />
  </div>

</template>

<style scoped>

</style>