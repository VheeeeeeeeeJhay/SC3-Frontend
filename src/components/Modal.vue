<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed } from 'vue'
// import { MdDeleteForever } from '@kalimahapps/vue-icons';

const props = defineProps({
  modelValue: Boolean, // v-model binding for modal open state
  transactionName: String, // Pass the transaction name
  transaction: Object,
  modalTitle: String
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
  <div 
    v-if="modelValue" 
    class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md"
    @click.self="closeModal"
  >
    <!-- Modal Container (No shadow) -->
    <div ref="modalContainer" class="w-full max-w-md rounded-lg p-6 border dark:border-gray-700 transition-all">
      
      <!-- Header -->
      <div class="flex justify-between items-center pb-4 border-b dark:border-gray-600">
        <h2 class="text-lg font-semibold">
          {{ modalTitle}}
        </h2>
        <button @click="closeModal" class="text-gray-500 hover:text-red-500">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Content Slot -->
      <slot name="contents"></slot>

    </div>
  </div>
</template>
