<script setup>
import { ref, onMounted } from 'vue';

//sample on how to use toast to other page

//<Toast message="Successfully saved!" icon="check_circle" type="success" />
//<Toast message="Error! Something went wrong." icon="error" type="error" />
//<Toast message="Warning! Check your inputs." icon="warning" type="warning" />
//<Toast message="Info: Updates available." icon="info" type="info" />


defineProps({
  message: String,
  icon: String,
  type: {
    type: String,
    default: "info", // Options: success, error, warning, info
  },
});

const isVisible = ref(true);

// Function to close the toast
const closeToast = () => {
    isVisible.value = false;
};

// Set a timeout to automatically close the toast after 5 seconds
// onMounted(() => {
//     setTimeout(() => {
//         closeToast();
//     }, 600000); // Automatically close after 1 minute (60000ms)
// });

// Define colors based on the type of toast
const typeClasses = {
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};
</script>

<template>
    <transition name="fade">
        <div
            v-if="isVisible"
            class="m-1 relative flex items-center w-full max-w-xs p-2.5 rounded-md shadow-md transition-all duration-300 ease-in-out opacity-90"
            :class="typeClasses[type]"
            role="alert"
        >
            <!-- Icon -->
            <div class="flex items-center justify-center w-7 h-7 rounded-full" :class="typeClasses[type]">
                <span class="material-icons text-sm">{{ icon }}</span>
            </div>

            <!-- Message -->
            <div class="ml-2 text-xs font-medium">{{ message }}</div>

            <!-- Close Button -->
            <button
                @click="closeToast"
                type="button"
                class="ml-auto text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md focus:ring-1 focus:ring-gray-300 p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Close"
            >
                <span class="sr-only">Close</span>
                <svg class="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
    </transition>
</template>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
