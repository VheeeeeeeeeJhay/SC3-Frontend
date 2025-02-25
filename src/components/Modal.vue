<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed } from 'vue'
// import { MdDeleteForever } from '@kalimahapps/vue-icons';
import { useThemeStore } from '../stores/themeStore';
// For dark mode
const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "bg-slate-800 border border-black text-white hover:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:outline-none"
    : "bg-sky-50 border border-gray-200 text-sky-900 hover:border-gray-300 focus:ring-2 focus:ring-sky-400 focus:outline-none";
});

const props = defineProps({
  modelValue: Boolean, // v-model binding for modal open state
  transactionName: String, // Pass the transaction name
  transaction: Object
})

const emit = defineEmits(['update:modelValue', 'confirmDelete'])

const modalContainer = ref(null)

const closeModal = () => {
  emit('update:modelValue', false) // Notify parent to close modal
}

const confirmDelete = () => {
  console.log("DELETE")
  closeModal()
}

const handleClickOutside = (event) => {
  if (modalContainer.value && !modalContainer.value.contains(event.target)) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})


</script>

<template>
  
  <div v-if="modelValue" class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      
      <!-- Modal Container (No shadow) -->
      <div ref="modalContainer" class="w-full max-w-md rounded-lg p-6 border dark:border-gray-700 transition-all" :class="themeClasses">
        
        <!-- Header -->
        <div class="flex justify-between items-center pb-4 border-b dark:border-gray-600">
          <h2 class="text-lg font-semibold">
            Confirm Action // Modal Message
          </h2>
          <button @click="closeModal" class="text-gray-500 hover:text-red-500">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Content Slot -->
        <slot name="contents"></slot>
      
      <!-- <div class="-mx-3 flex flex-wrap">
        <div class="w-1/2 px-3">
          <button @click="closeModal"
            class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition bg-gray-200 hover:border-green-800 hover:bg-green-800 hover:text-white dark:text-black">
            No, Keep it.
          </button>
        </div>
        <div class="w-1/2 px-3">
          <button @click="confirmAction"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white">
            Yes, Delete!
          </button>
        </div>
      </div> -->
    </div>
  </div>
</template>