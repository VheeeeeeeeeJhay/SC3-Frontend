<template>
  <div class="relative w-full">
    <!-- Month Picker Toggle -->
    <div 
      @click="openPicker" 
      class="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md shadow cursor-pointer flex items-center justify-between w-auto min-w-[6rem]"
    >
      <span class="text-xs font-medium whitespace-nowrap">
        {{ months[selectedMonth - 1] }} {{ selectedYear }}
      </span>
      <svg 
        class="w-3.5 h-3.5 transition-transform duration-200" 
        :class="{ 'rotate-180': isOpen }"
        fill="none" stroke="currentColor" viewBox="0 0 16 16"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6l4 4 4-4"></path>
      </svg>
    </div>

    <!-- Dropdown Menu -->
    <div 
      v-if="isOpen" 
      class="absolute bg-white dark:bg-gray-800 shadow-md rounded-md mt-1 min-w-[200px] p-1 z-50 border border-gray-200 dark:border-gray-700"
    >
      <!-- Year Carousel -->
      <div class="flex items-center justify-between px-2 py-1">
        <button @click="scrollYears(-1)" class="p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-xs">
          ‹
        </button>
        <div ref="yearCarousel" class="overflow-hidden w-20 text-center">
          <div 
            class="flex transition-transform duration-300"
            :style="{ transform: `translateX(-${scrollOffset}px)` }"
          >
            <button
              v-for="year in years"
              :key="year"
              @click="selectYear(year)"
              class="px-2 py-1 text-xs font-medium rounded-md"
              :class="selectedYear === year ? 'bg-teal-600 dark:bg-teal-700 text-white' : 'hover:bg-teal-500 dark:hover:bg-teal-600 hover:text-white'"
            >
              {{ year }}
            </button>
          </div>
        </div>
        <button @click="scrollYears(1)" class="p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-xs">
          ›
        </button>
      </div>

      <!-- Month Selector -->
      <div class="grid grid-cols-3 gap-[2px] mt-1">
        <button
          v-for="(month, index) in months"
          :key="month"
          @click="selectMonth(index + 1)"
          class="px-2 py-1 text-xs font-medium rounded-md transition duration-150 w-full text-center dark:text-gray-200"
          :class="selectedMonth === index + 1 
            ? 'bg-teal-600 dark:bg-teal-700 text-white shadow' 
            : 'hover:bg-teal-500 dark:hover:bg-teal-600 hover:text-white'"
        >
          {{ month }}
        </button>
      </div>
    </div>
  </div>
</template>


  
  <script setup>
  import { ref, defineProps, defineEmits, computed } from "vue";
  
  // Props
  const props = defineProps({
  selectedYear: Number,
  selectedMonth: Number,
  });
  
  // Emit Event
  const emit = defineEmits(["update:selectedMonth", "update:selectedYear"]);
  
  const isOpen = ref(false);
  const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];
  
  // Generate a list of years dynamically
  const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  });
  
  // Year Picker Scrolling
  const scrollOffset = ref(0);
  const yearIndex = computed(() => years.value.indexOf(props.selectedYear));
  
  // Open picker & scroll to selected year
const openPicker = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    scrollOffset.value = yearIndex.value * 50; // Auto-center selected year
  }
};

  const scrollYears = (direction) => {
    let newIndex = yearIndex.value + direction;
    if (newIndex >= 0 && newIndex < years.value.length) {
      scrollOffset.value = newIndex * 50; // Adjust for button size
      emit("update:selectedYear", years.value[newIndex]);
    }
  };
  
  // Select Functions
  const selectYear = (year) => {
    emit("update:selectedYear", year);
  };
  
  const selectMonth = (month) => {
    emit("update:selectedMonth", month);
    isOpen.value = false;
  };
  </script>
  
  <style>
  /* Add custom styles if necessary */
  </style>
  