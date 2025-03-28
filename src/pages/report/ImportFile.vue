<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const errorMessage = ref('');
const maxFileSize = 2 * 1024 * 1024; // 2MB max file size

const handleFileUpload = (event) => {
    const file = event.target.files[0];

    // Check if file exists
    if (!file) {
        errorMessage.value = 'No file selected!';
        return;
    }

    // Get file properties
    const fileType = file.type;
    const fileSize = file.size;

    // Validate file type
    const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(fileType)) {
        errorMessage.value = 'Invalid file type! Please upload an Excel file (.xls, .xlsx).';
        return;
    }

    // Validate file size
    if (fileSize > maxFileSize) {
        errorMessage.value = 'File size exceeds 2MB limit!';
        return;
    }

    // If all checks pass
    errorMessage.value = ''; // Clear any previous errors
    console.log('File uploaded successfully:', file.name);
};
</script>

<template>
    <div class="mt-6 px-2 flex justify-between">
        <h1 class="text-2xl font-bold dark:text-white mb-2">Add a New Report</h1>
        <Button type="button" name="Back" @click.prevent="router.back()"
            class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
            <span class="material-icons mr-2"> arrow_back </span>
            Back
        </Button>
    </div>

    <div class="flex items-center justify-center w-full mt-6">
        <label for="dropzone-file"
            class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Only Excel files (.xls, .xlsx) | Max: 2MB</p>
            </div>
            <input id="dropzone-file" type="file" class="hidden" accept=".xls, .xlsx" @change="handleFileUpload" />
        </label>


    </div>
    <!-- Error message display -->
    <p v-if="errorMessage" class="mt-2 text-sm text-red-500">{{ errorMessage }}</p>
</template>


<style scoped></style>