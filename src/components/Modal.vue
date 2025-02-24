<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue'
// import { MdDeleteForever } from '@kalimahapps/vue-icons';

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
  <div v-if="modelValue" class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-dark/90 px-4 py-5">
    <div ref="modalContainer"
      class="w-full max-w-[570px] rounded-[20px] bg-white px-8 py-8 text-center dark:bg-dark-2 border dark:bg-gray-700">
      <slot name="contents"></slot>
      
      <div class="-mx-3 flex flex-wrap">
        <div class="w-1/2 px-3">
          <button @click="closeModal"
            class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition bg-gray-200 hover:border-green-800 hover:bg-green-800 hover:text-white dark:text-black">
            No, Keep it.
          </button>
        </div>
        <!-- <div class="w-1/2 px-3">
          <button @click="confirmAction"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white">
            Yes, Delete!
          </button>
        </div> -->
      </div>
    </div>
  </div>
</template>