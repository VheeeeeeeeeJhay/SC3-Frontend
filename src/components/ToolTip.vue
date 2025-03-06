<script setup>
import { onMounted } from 'vue';
import { Tooltip } from 'flowbite';

defineProps({
    Information: {
        type: String,
        required: true
    }
})

onMounted(() => {
  const button = document.querySelector('[data-tooltip-target="tooltip-hover"]'); // Button
  const tooltip = document.getElementById('tooltip-hover'); // Tooltip

  if (button && tooltip) {
    new Tooltip(tooltip, button, {
      placement: 'top', // Position of the tooltip
      triggerType: 'hover', // Show on hover
    });
  }
});
</script>



<template>
    <button data-tooltip-target="tooltip-hover" data-tooltip-trigger="hover" type="button"
        class="material-icons text-teal-600 hover:text-teal-800">
        help
    </button>

    <Teleport to="body">

        <div id="tooltip-hover" role="tooltip"
            class="absolute z-50 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
            {{ Information }}
            <div class="tooltip-arrow" data-popper-arrow></div>
        </div>

    </Teleport>


</template>
