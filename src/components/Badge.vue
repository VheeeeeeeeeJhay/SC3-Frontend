<script setup>
defineProps({
    Message: String
})
</script>

<template>
    <span class="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-yellow-900 dark:text-yellow-300">{{ Message }}</span>
</template>