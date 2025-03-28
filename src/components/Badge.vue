<script setup>
defineProps({
    Message: String,
    Class: String
})
</script>

<template>
    <span :class="Class" class="text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm text-gray-800 dark:text-gray-300">{{ Message }}</span>
</template>