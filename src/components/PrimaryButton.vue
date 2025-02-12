<script setup>
import { ref } from 'vue';
import { useThemeStore } from '../stores/themeStore';

defineProps({
    class: String,
    name: String,
    type: String
})

const props = ref({
    class: 'null',
    name: 'null',
    type: 'null'
})

const themeStore = useThemeStore();

</script>

<template>
    <button :type="type" :name="name" :class="class" class="px-2 py-1.5 rounded-md my-2">{{ name }}</button>
</template>