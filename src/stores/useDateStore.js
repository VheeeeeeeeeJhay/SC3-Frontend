import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDateStore = defineStore('date', () => {
  const dateRange = ref({
    start: null, 
    end: null
  });

  const updateDateRange = (range) => {
    dateRange.value.start = range.start;
    dateRange.value.end = range.end;
  };

  return { dateRange, updateDateRange };
});
