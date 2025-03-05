<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../stores/themeStore';

// Dark mode
const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode 
    ? "bg-slate-800 border border-black text-white hover:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:outline-none"
    : "bg-sky-50 border border-gray-200 text-gray-800 hover:border-gray-300 focus:ring-2 focus:ring-sky-400 focus:outline-none";
});
defineProps({
    ModalButton: String,
    Title: String,
    Icon: String,
    Classes: String,
    ButtonClass: String
});

const isModalOpen = ref(false)

const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value
}
</script>

<template>
    <!-- Button to toggle modal -->
    <button 
      @click="toggleModal" 
      :class="ButtonClass" 
      type="button">
        {{ ModalButton }}
    </button>

    <!-- Modal structure -->
    <Teleport to="body">
        <div 
          v-if="isModalOpen" 
          tabindex="-1" 
          @click.stop
          class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div class="relative p-4 w-full max-w-md max-h-full">
                <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    <!-- Close button -->
                    <button 
                      @click="toggleModal" 
                      type="button" 
                      class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>

                    <!-- Modal content -->
                    <div class="p-4 md:p-5 text-center">
                        <span class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200 material-icons" :class="Classes">{{ Icon }}</span>
                        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{{ Title }}</h3>                    
                        <slot name="modalContent"></slot>

                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
