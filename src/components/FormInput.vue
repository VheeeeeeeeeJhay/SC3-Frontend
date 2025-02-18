<template>
    <input 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)" 
      :type="type" 
      :name="name" 
      :placeholder="placeholder" 
      :class="class"
    />
  </template>
  
<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    name: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    class: {
        type: String,
        default: ''
    }
});
</script>