<template>
    <div :class="bgClass" style="min-height: 100vh;">
        <div class="mx-4" :class>
        <h1 class="text-2xl font-bold mb-6 text-gray-100" :class="textClass">Heat Map here</h1>
        
        <img src="https://th.bing.com/th/id/R.450d7cb80e9013f6d80ad1547a3414c5?rik=f20epSYlcY25AQ&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2ff%2f9%2ff%2f327112.jpg&ehk=iBETV2e95IbNX0zVk%2bZgxp%2bIG0HrkXfGDa7ycjRQ%2bIA%3d&risl=&pid=ImgRaw&r=0" class="w-full h-[700px]" alt="Mapa to"/>
        
    </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { useThemeStore } from '../stores/themeStore';

const themeStore = useThemeStore();

const bgClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-slate-900' : 'bg-gray-900';
})
const textClass = computed(() => {
  return themeStore.isDarkMode ? 'text-gray-100' : 'text-gray-900';
})
const boxClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-800' : 'bg-white';
})
const chartClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-700 border-gray-500' : 'bg-gray-200 border-gray-900';
})

</script>

<style scoped>
.form-group :deep(.p-dropdown),
.form-group :deep(.p-inputtext) {
    width: 100%;
}
</style>
