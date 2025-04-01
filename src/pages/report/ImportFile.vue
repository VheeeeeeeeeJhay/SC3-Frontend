<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axiosClient from '../../axios.js';

const router = useRouter();
const errorMessage = ref('');
const successMessage = ref('');
const maxFileSize = 2 * 1024 * 1024; // 2MB max file size
const uploadedFileName = ref(''); // Store the file name
const fileInput = ref(null); // Ref for the file input

let selectedFile = null; // Local variable to store the selected file

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    console.log('Selected file:', file); // Log the selected file

    if (!file) {
        errorMessage.value = 'No file selected!';
        return;
    }

    const fileType = file.type;
    const fileSize = file.size;
    const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(fileType)) {
        errorMessage.value = 'Invalid file type! Please upload an Excel file (.xls, .xlsx).';
        return;
    }

    if (fileSize > maxFileSize) {
        errorMessage.value = 'File size exceeds 2MB limit!';
        return;
    }

    errorMessage.value = ''; // Clear previous errors
    uploadedFileName.value = file.name; // Store the uploaded file name
    selectedFile = file; // Store the selected file in the local variable
};

const removeFile = () => {
    uploadedFileName.value = ''; // Clear the uploaded file name
    if (fileInput.value) {
        fileInput.value.value = ''; // Clear the file input
    }
};

const submitForm = async () => {
    try {
        console.log('Selected file before submitting:', selectedFile); // Log the selected file
        if (!selectedFile) {
            errorMessage.value = 'Please upload a file before submitting.';
            return;
        }

        // Create a FormData object and append the file
        const uploadFile = new FormData();
        uploadFile.append('file', selectedFile);  // Use the local variable

        // Send the request using axios
        const response = await axiosClient.post('/api/911/upload-excel', uploadFile, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'x-api-key': import.meta.env.VITE_API_KEY,  // Optional if required
            },
        });

        console.log('File uploaded successfully:', response.data);
        successMessage.value = 'File uploaded successfully!';
        errorMessage.value = ''; // Clear any previous errors

    } catch (error) {
        console.error('Error uploading file:', error);
        errorMessage.value = error.response?.data?.message || 'Something went wrong!';
    }
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

    <form @submit.prevent="submitForm" class="mt-6 space-y-6">
        <div class="flex items-center justify-center w-full">
            <label v-if="!uploadedFileName" for="dropzone-file"
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
                <input id="dropzone-file" ref="fileInput" type="file" class="hidden" accept=".xls, .xlsx" @change="handleFileUpload" />
            </label>

            <div v-if="uploadedFileName" class="mt-4 rounded-lg p-4 bg-gray-700 hover:bg-gray-600 border-l-10 border-l-green-700 flex items-center justify-between">
                <p class="text-sm text-green-500">File uploaded: <strong>{{ uploadedFileName }}</strong></p>
                <button @click="removeFile" class="text-red-500 hover:text-red-700 ml-2">
                    <span class="material-icons">close</span>
                </button>
            </div>
        </div>

        <p v-if="errorMessage" class="mt-2 text-sm text-red-500">{{ errorMessage }}</p>
        <p v-if="successMessage" class="mt-2 text-sm text-green-500">{{ successMessage }}</p>

        <div v-if="uploadedFileName">
            <button type="submit" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Submit
            </button>
        </div>
    </form>
</template>

<style scoped>
/* Add any additional styles here */
</style>