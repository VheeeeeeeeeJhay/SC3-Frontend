<script setup>
defineProps({
    Message: String,
    Class: String
})
</script>

<template>
    <span :class="Class" class="text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm">{{ Message }}</span>
</template>