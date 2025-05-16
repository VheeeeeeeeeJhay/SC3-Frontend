<script setup>
import { ref } from 'vue'

defineProps({
    show: Boolean,
    ModalButton: String,
    Title: String,
    Icon: String,
    Classes: String,
    ButtonClass: String
});

// const isModalOpen = ref(false)

// const toggleModal = () => {
//   isModalOpen.value = !isModalOpen.value
// }

const emit = defineEmits(['update:show']);
const closeModal = () => {
  emit('update:show', false); // Notify parent to close modal
};

defineOptions({ inheritAttrs: false });
</script>

<template>
    <!-- Button to toggle modal -->
    <button @click="$emit('update:show', true)" :class="ButtonClass">
        <span class="">{{ ModalButton }}</span>
    </button>


    <!-- Modal structure -->
    <Teleport to="body">
        <div 
          v-if="show" 
          tabindex="-1" 
          @click.stop
          :class="['overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-full max-h-full bg-black/50 backdrop-blur-md',  $attrs.class]">
            <div class="relative p-4 w-full max-w-md max-h-full">
                <div class="relative bg-sky-50 rounded-lg shadow-sm dark:bg-gray-700">
                    <!-- Close button -->
                    <button 
                      @click="closeModal" 
                      type="button" 
                      class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>

                    <!-- Modal content -->
                    <div class="p-4 md:p-5 text-center max-w-lg mx-auto bg-sky-50 dark:bg-slate-950 p-6 rounded-lg shadow-md ">
                        <span class="mx-auto mb-2 text-gray-400 w-12 h-6 dark:text-gray-200 material-icons" :class="Classes">{{ Icon }}</span>
                        <h2 class="text-2xl font-semibold text-gray-700 dark:text-white mb-4">{{ Title }}</h2>                    
                        <slot name="modalContent"></slot>

                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
