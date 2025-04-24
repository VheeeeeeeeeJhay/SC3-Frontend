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

<template>
  <div class="flex items-center space-x-2 w-full">
    <!-- Mode Selector -->
    <select id="modeSelect" v-model="mode"
      class="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800">
      <option value="range">Date Range</option>
      <option value="month">Month & Year</option>
    </select>

    <!-- Dynamic Picker -->
    <div class="flex items-center space-x-2">
      <DateRangePicker v-if="mode === 'range'" class="max-w-xs" @dateRangeSelected="updateDateRange"
        @change="emitCombinedValue" />
      <MonthYearPicker v-else class="flex" v-model:selectedMonth="selectedMonth1" v-model:selectedYear="selectedYear1"
        @change="emitCombinedValue" />
    </div>
  </div>
</template>

<style scoped>
select {
  appearance: none;
}
</style>