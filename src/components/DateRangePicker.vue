<template>
<div class="relative w-full">
    <!-- Input Field -->
    <div
      class="w-full px-3 py-2 flex items-center bg-white dark:bg-teal-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
      ref="datepickerRef"
      @click="toggleDatepicker"
    >
      <span class="mr-3 text-gray-500 dark:text-gray-400">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <!-- Calendar Icon -->
          <path
            d="M6 2a1 1 0 011 1v1h6V3a1 1 0 112 0v1h1a2 2 0 012 2v11a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 112 0v1zM3 8v9h14V8H3z"
          />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Select Date Range"
        class="w-full bg-transparent text-sm focus:outline-none cursor-pointer"
        :value="updateInput()"
        readonly
      />
      <span class="ml-auto text-gray-500 dark:text-gray-400 cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 16 16">
          <!-- Dropdown Arrow -->
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6l4 4 4-4"></path>
        </svg>
      </span>
    </div>

    <!-- Date Picker Container -->
    <div
      v-if="isOpen"
      class="absolute z-50 mt-2 w-full max-w-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden"
      @click.stop
      >
      <!-- Month Navigation -->
      <div class="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700">
        <button @click="changeMonth(-1)" class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
          <svg class="w-4 h-4 text-gray-700 dark:text-gray-200" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11 2L5 8l6 6"></path>
          </svg>
        </button>

        <div class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ currentMonth }}</div>

        <button @click="changeMonth(1)" class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
          <svg class="w-4 h-4 text-gray-700 dark:text-gray-200" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 2l6 6-6 6"></path>
          </svg>
        </button>
      </div>

      <!-- Days of the Week -->
      <div class="grid grid-cols-7 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <div v-for="day in daysOfWeek" :key="day" class="text-center ">{{ day }}</div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 px-4 pb-3 text-sm">
        <div
          v-for="(day, index) in renderCalendar()"
          :key="index"
          :class="day.className"
          class="text-center py-2 cursor-pointer rounded-md hover:bg-teal-500 text-white transition"
          @click="handleDayClick(day.dayString)"
        >
          {{ day.day }}
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700 p-3">
        <button @click="handleCancel" class="px-4 py-2 text-sm font-medium text-teal-500 border border-teal-500 rounded-lg hover:bg-teal-50 dark:hover:bg-gray-700">
          Cancel
        </button>
        <button @click="handleApply" class="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600">
          Apply
        </button>
      </div>
    </div>
  </div>
    
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const currentDate = ref(new Date());

// Get the formatted date string (MM/DD/YYYY) for today and 6 days ago
const formatDate = (date) => date.toLocaleDateString('en-US');

const selectedEndDate = ref(formatDate(currentDate.value));
const selectedStartDate = ref(formatDate(new Date(currentDate.value.setDate(currentDate.value.getDate() - 6))));

const isOpen = ref(false)
const datepickerRef = ref(null)

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const emit = defineEmits(['dateRangeSelected']);

const renderCalendar = () => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()

    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysArray = []

    for (let i = 0; i < firstDayOfMonth; i++) {
        daysArray.push({ day: '', className: '', dayString: '' })
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, month, i)
        const dayString = day.toLocaleDateString('en-US')
        let className =
            'flex items-center justify-center cursor-pointer w-[46px] h-[46px] rounded-full text-dark-3 dark:text-dark-6 my-0.5 hover:bg-teal-700 hover:text-white'

        if (selectedStartDate.value && dayString === selectedStartDate.value) {
            className += ' bg-teal-700 text-white dark:text-white rounded-r-none'
        }
        if (selectedEndDate.value && dayString === selectedEndDate.value) {
            className += ' bg-teal-700 text-white dark:text-white rounded-l-none'
        }
        if (
            selectedStartDate.value &&
            selectedEndDate.value &&
            new Date(day) > new Date(selectedStartDate.value) &&
            new Date(day) < new Date(selectedEndDate.value)
        ) {
            className += ' bg-teal-400 text-white rounded-none dark:bg-teal-500'
        }

        daysArray.push({ day: i, className, dayString })
    }

    return daysArray
}

const handleDayClick = (selectedDay) => {
    if (!selectedStartDate.value || (selectedStartDate.value && selectedEndDate.value)) {
        selectedStartDate.value = selectedDay
        selectedEndDate.value = null
    } else {
        if (new Date(selectedDay) < new Date(selectedStartDate.value)) {
            selectedEndDate.value = selectedStartDate.value
            selectedStartDate.value = selectedDay
        } else {
            selectedEndDate.value = selectedDay
        }
    }
}

const updateInput = () => {
    if (selectedStartDate.value && selectedEndDate.value) {
        return `${selectedStartDate.value}  to  ${selectedEndDate.value}`
    } else if (selectedStartDate.value) {
        return selectedStartDate.value
    } else {
        return ''
    }
}

const toggleDatepicker = () => {
    isOpen.value = !isOpen.value
}

//   const handleApply = () => {
//     console.log('Applied:', selectedStartDate.value, selectedEndDate.value)
//     isOpen.value = false
//   }

const handleApply = () => {
    if (selectedStartDate.value && selectedEndDate.value) {
        emit('dateRangeSelected', { start: selectedStartDate.value, end: selectedEndDate.value })
        console.log('Applied:', selectedStartDate.value, selectedEndDate.value)
        isOpen.value = false
    }
}

const handleCancel = () => {
    // selectedStartDate.value = null
    // selectedEndDate.value = null
    isOpen.value = false
}

const handleDocumentClick = (e) => {
    if (datepickerRef.value && !datepickerRef.value.contains(e.target)) {
        isOpen.value = false
    }
}

const currentMonth = computed(() =>
    currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
)

const changeMonth = (direction) => {
    currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + direction))
}

onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
    document.removeEventListener('click', handleDocumentClick)
})

onMounted(() => {
  selectedEndDate.value = formatDate(new Date());
  selectedStartDate.value = formatDate(new Date(new Date().setDate(new Date().getDate() - 6)));
});

</script>