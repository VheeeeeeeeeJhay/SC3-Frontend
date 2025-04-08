<template>
    <div class="max-w-3/4 mx-auto px-4 py-8">
        <ol class="flex items-center space-x-4 justify-evenly">
            <li v-for="(step, index) in steps" :key="step.id" class="flex items-center space-x-2.5" :class="{
                'text-teal-600 dark:text-teal-500': currentStep === index + 1,
                'text-gray-500 dark:text-gray-400': currentStep !== index + 1,
                'text-green-500 dark:text-green-400': currentStep > index + 1
            }">
                <span class="flex items-center justify-center w-10 h-10 border rounded-full shrink-0" :class="{
                    'border-teal-600 dark:border-teal-500': currentStep === index + 1,
                    'border-gray-500 dark:border-gray-400': currentStep !== index + 1,
                    'border-green-500 dark:border-green-600 dark:bg-green-600 dark:text-white': currentStep > index + 1
                }">
                    <!-- Display checkmark for completed steps, otherwise display the step number -->
                    <!-- <span v-if="currentStep > index + 1" class="text-green-500 dark:text-green-400">✔</span> -->
                    <span v-if="currentStep > index + 1" class="text-green-500 dark:text-white material-icons">
                    check
                    </span>
                    <span v-else>{{ index + 1 }}</span>
                </span>
                <span>
                    <h3 class="font-medium leading-tight">{{ step.title }}</h3>
                </span>
            </li>
        </ol>

        <!-- Content for active step -->
        <div v-if="currentStep === 1" class="mt-4 p-4 bg-gray-100 rounded-lg">
            <p>Oliverr.</p>
        </div>

        <div v-if="currentStep === 2" class="mt-4 p-4 bg-gray-100 rounded-lg">
            <p>Ebramm</p>
        </div>

        <div v-if="currentStep === 3" class="mt-4 p-4 bg-gray-100 rounded-lg">
            <p>Andrree.</p>
        </div>

        <div class="mt-8 flex justify-between">
            <button :disabled="currentStep === 1" @click="prevStep"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors hover:bg-gray-400">
                Previous
            </button>

            <button :disabled="currentStep === steps.length" @click="nextStep"
                class="px-4 py-2 bg-teal-600 text-white rounded-lg disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors hover:bg-teal-700">
                Next
            </button>
        </div>
    </div>


    tareadfs
</template>

<script setup>
import { ref } from 'vue';

const currentStep = ref(1); // The current active step
const steps = [
    { id: 1, title: "Import File", details: "Step details here" },
    { id: 2, title: "Verify Data", details: "Step details here" },
    { id: 3, title: "Import Successful!", details: "Step details here" }
];

// Arrow function for nextStep
const nextStep = () => {
    if (currentStep.value < steps.length) {
        currentStep.value++;
    }
};

// Arrow function for prevStep
const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};
</script>

<style scoped>
/* Optional: Scoped styles for the component */
</style>
