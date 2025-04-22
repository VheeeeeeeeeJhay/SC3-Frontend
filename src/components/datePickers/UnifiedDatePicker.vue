<template>
    <div class="relative w-full space-y-2">
      <!-- Mode Selector -->
      <div class="flex justify-between items-center text-sm text-gray-300">
        <label for="modeSelect" class="font-medium">Filter:</label>
        <select
          id="modeSelect"
          v-model="mode"
          class="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 focus:outline-none"
        >
          <option value="range">Date Range</option>
          <option value="month">Month & Year</option>
        </select>
      </div>
  
      <!-- Dynamic Picker -->
      <div>
        <DateRangePicker
          v-if="mode === 'range'"
          @dateRangeSelected="updateDateRange"
          @change="emitCombinedValue"
        />
        <MonthYearPicker
          v-else
          v-model:selectedMonth="selectedMonth1" v-model:selectedYear="selectedYear1"

          @change="emitCombinedValue"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import DateRangePicker from '../DateRangePicker.vue'
  import MonthYearPicker from '../MonthYearPicker.vue'
  
  const emit = defineEmits(['update:modelValue'])
  
  const currentYear = new Date().getFullYear()
  const selectedYear1 = ref(currentYear)
  const selectedMonth1 = ref(new Date().getMonth() + 1)
  const startDate = ref(null)
  const endDate = ref(null)
  
  const mode = ref('range')
  
  const updateDateRange = ({ start, end }) => {
    startDate.value = start
    endDate.value = end
    emitCombinedValue()
  }
  
  watch([selectedYear1, selectedMonth1, mode], () => {
    if (mode.value === 'month') {
      emitCombinedValue()
    }
  })
  
  function emitCombinedValue() {
    if (mode.value === 'range') {
      emit('update:modelValue', {
        type: 'range',
        startDate: startDate.value,
        endDate: endDate.value
      })
    } else {
      emit('update:modelValue', {
        type: 'month',
        year: selectedYear1.value,
        month: selectedMonth1.value
      })
    }
  }
  </script>
  
  
  <style scoped>
  select {
    appearance: none;
  }
  </style>
  