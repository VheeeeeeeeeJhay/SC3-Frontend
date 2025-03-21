<template>
    <div class="relative w-full">
      <!-- Month Picker Toggle -->
      <div 
        @click="openPicker" 
        class="bg-teal-500 text-white px-4 py-2 rounded-md shadow cursor-pointer flex items-center justify-between w-full"
      >
        <span class="text-sm font-medium whitespace-nowrap">{{ months[selectedMonth - 1] }} {{ selectedYear }}</span>
        <svg 
          class="w-4 h-4 transition-transform duration-200" 
          :class="{ 'rotate-180': isOpen }"
          fill="none" stroke="currentColor" viewBox="0 0 16 16"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6l4 4 4-4"></path>
        </svg>
      </div>
  
      <!-- Dropdown Menu -->
      <div 
        v-if="isOpen" 
        class="absolute bg-white shadow-lg rounded-md mt-1 min-w-[250px] w-full p-2 z-50 border border-gray-200"
      >
        <!-- Year Carousel -->
        <div class="flex items-center justify-between px-3 py-2">
          <button @click="scrollYears(-1)" class="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            ‹
          </button>
          <div ref="yearCarousel" class="overflow-hidden w-24 text-center">
            <div 
              class="flex transition-transform duration-300"
              :style="{ transform: `translateX(-${scrollOffset}px)` }"
            >
              <button
                v-for="year in years"
                :key="year"
                @click="selectYear(year)"
                class="px-3 py-1 text-sm font-medium rounded-md"
                :class="selectedYear === year ? 'bg-teal-600 text-white' : 'hover:bg-teal-500 hover:text-white'"
              >
                {{ year }}
              </button>
            </div>
          </div>
          <button @click="scrollYears(1)" class="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            ›
          </button>
        </div>
  
        <!-- Month Selector -->
        <div class="grid grid-cols-3 gap-1 mt-2">
          <button
            v-for="(month, index) in months"
            :key="month"
            @click="selectMonth(index + 1)"
            class="px-3 py-2 text-xs font-medium rounded-md transition duration-150 w-full text-center"
            :class="selectedMonth === index + 1 
              ? 'bg-teal-600 text-white shadow-md' 
              : 'hover:bg-teal-500 hover:text-white'"
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
  