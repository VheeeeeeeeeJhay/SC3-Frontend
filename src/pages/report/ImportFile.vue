<script setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import axiosClient from '../../axios.js';
import UploadedFileTable from '../../components/tables/UploadedFileTable.vue';

const router = useRouter();
const errorMessage = ref('');
const successMessage = ref('');
const maxFileSize = 2 * 1024 * 1024;
const uploadedFileName = ref('');
const fileInput = ref(null);
let selectedFile = null;

const addToast = inject('addToast'); // Inject global toast function

const contained_data = ref([]);

const handleFileUpload = (event) => {
    const file = event.target.files[0];
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

    errorMessage.value = '';
    uploadedFileName.value = file.name;
    selectedFile = file;
};

// Add new drag and drop handlers
const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // Add visual feedback for drag over
    const dropZone = document.getElementById('dropzone-file');
    if (dropZone) {
        dropZone.classList.add('border-blue-500');
    }
};

const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // Remove visual feedback
    const dropZone = document.getElementById('dropzone-file');
    if (dropZone) {
        dropZone.classList.remove('border-blue-500');
    }
};

const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Remove visual feedback
    const dropZone = document.getElementById('dropzone-file');
    if (dropZone) {
        dropZone.classList.remove('border-blue-500');
    }

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload({ target: { files: [files[0]] } });
    }
};

// ✅ FIXED: Only clears table data and returns to step 1, keeps file
const removeFile = () => {
    uploadedFileName.value = '';
    selectedFile = null;
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

const clearData = () => {
    contained_data.value = [];
    successMessage.value = '';
    errorMessage.value = '';
    currentStep.value = 1;
};

const isLoading = ref(false);

const verifyFileData = async () => {
    isLoading.value = true;
    if (!selectedFile) {
        errorMessage.value = 'Please upload a file before submitting.';
        return;
    }

    const uploadFile = new FormData();
    uploadFile.append('file', selectedFile);

    await axiosClient.post('/api/911/import-excel', uploadFile, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY
        }
    })
    .then(response => {
        addToast(response.data.message, 'success', 'check_circle');
        contained_data.value = response.data.data;
        currentStep.value = 2;
    })
    .catch(error => {
        errorMessage.value = error.response?.data?.message || 'Something went wrong!';
        addToast(error.response?.data.message, 'error', 'error');
    })
    .finally(() => {
        isLoading.value = false;
    });
};

const submitFileData = async () => {
    isLoading.value = true;
    try {
        await axiosClient.post('/api/911/import-excel-data', { data: contained_data.value }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': import.meta.env.VITE_API_KEY,
            },
        });

        addToast('Report data imported successfully!', 'success', 'check_circle');
        currentStep.value = 3; // ✅ Go to Step 3 on success
    } catch (error) {
        addToast(error.response?.data?.message || 'Failed to import data.', 'error', 'error');
    }
    finally {
        isLoading.value = false;
    }
};


// Stepper logic
const currentStep = ref(1);
const steps = [
    { id: 1, title: "Import File" },
    { id: 2, title: "Verify Data" },
    { id: 3, title: "Import Successful!" }
];

const goToStep1AndClearFiles = () => {
    currentStep.value = 1; // Reset to step 1 (file upload)
    successMessage.value = '';
    errorMessage.value = '';
    uploadedFileName.value = ''; // Clear uploaded file name
    selectedFile = null; // Reset the selected file
    if (fileInput.value) {
        fileInput.value.value = ''; // Reset the file input field
    }
};
</script>

<template>
    <div class="min-h-screen p-4">
        <!-- Header -->
        <div class="mt-6 px-2 flex justify-between">
            <h1 class="text-2xl font-bold dark:text-white mb-2">
                {{ contained_data.length === 0 ? 'Add a New Report' : 'Verifying Imported Reports List' }}
            </h1>
            <button @click.prevent="router.back()" class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 flex items-center">
                <span class="material-icons mr-2">arrow_back</span>
                Back
            </button>
        </div>

        <!-- Guidelines -->
        <div>
            <h2 class="text-lg font-bold dark:text-white mt-4 mx-2">Guidelines When Importing an Excel File:</h2>
            <ul class="list-disc list-inside mx-2 text-gray-700 dark:text-gray-300">
                <li>Ensure the Excel file is formatted correctly with the required columns.</li>
                <li>Verify that the data types match the expected format.</li>
                <li>Check for any missing or invalid entries.</li>
                <li>Confirm that the file size is within the allowed limit.</li>
            </ul>
        </div>

        <a
        href="/src/assets/file-upload-template.xlsx"
        download="file-upload-template.xlsx"
        class="inline-block mt-4 mx-2 px-4 py-2 rounded text-white bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500"
        >
        Download File Upload Template
        </a>


        <!-- Stepper -->
        <div class="mx-auto px-4 py-8">
            <ol class="flex items-center space-x-4 justify-evenly">
                <li v-for="(step, index) in steps" :key="step.id" class="flex items-center space-x-2.5"
                    :class="{
                        'text-teal-600 dark:text-teal-500': currentStep === index + 1,
                        'text-gray-500 dark:text-gray-400': currentStep !== index + 1,
                        'text-green-500 dark:text-green-400': currentStep > index + 1
                    }">
                    <span class="flex items-center justify-center w-10 h-10 border rounded-full"
                          :class="{
                              'border-teal-600': currentStep === index + 1,
                              'border-gray-500': currentStep !== index + 1,
                              'border-green-500 bg-green-500 text-white': currentStep > index + 1
                          }">
                        <span v-if="currentStep > index + 1" class="material-icons">check</span>
                        <span v-else>{{ index + 1 }}</span>
                    </span>
                    <h3 class="font-medium leading-tight">{{ step.title }}</h3>
                </li>
            </ol>

            <hr class="text-gray-500 dark:text-gray-400 mt-4">

            <!-- Step 1: Upload -->
            <div v-if="currentStep === 1" class="mt-6">
                <form @submit.prevent="verifyFileData" class="space-y-6">
                    <div class="flex items-center justify-center w-full" 
                         @dragover.prevent="handleDragOver" 
                         @dragleave.prevent="handleDragLeave" 
                         @drop.prevent="handleDrop">
                        <label v-if="!uploadedFileName" for="dropzone-file"
                            class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
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

                        <div v-else class="mt-4 rounded-lg p-4 bg-gray-700 hover:bg-gray-600 border-l-10 border-l-green-700 flex items-center justify-between w-full">
                            <p class="text-sm text-green-500">File uploaded: <strong>{{ uploadedFileName }}</strong></p>
                            <button @click="removeFile" class="text-red-500 hover:text-red-700 ml-2">
                                <span class="material-icons">close</span>
                            </button>
                        </div>
                    </div>

                    <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
                    <p v-if="successMessage" class="text-sm text-green-500">{{ successMessage }}</p>

                    <div class="flex justify-between gap-4 w-full" v-if="uploadedFileName">
                        <button type="button" @click="removeFile" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 w-1/2">
                            Remove File
                        </button>
                        <button :disabled="isLoading" type="submit" :class="[isLoading ? 'px-6 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-600 w-1/2' : 'px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 w-1/2']">
                            {{ isLoading ? 'Verifying, Please wait a moment...' : 'Verify Contents'}}
                        </button>
                    </div>
                </form>
            </div>

            <!-- Step 2: Review -->
            <div v-if="currentStep === 2" class="mt-6">
                <UploadedFileTable :contained_data="contained_data" />
                <div class="flex justify-between gap-4 py-4">
                    <button @click="clearData" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 w-1/2">
                        Cancel Transaction
                    </button>
                    <button :disabled="isLoading" @click="submitFileData" :class="[isLoading ? 'px-6 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-600 w-1/2' : 'px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 w-1/2']">
                        {{ isLoading ? 'Submitting, Please wait a moment...' : 'Submit Report Data' }}
                    </button>
                </div>
            </div>

            <!-- Step 3: Success -->
            <div v-if="currentStep === 3" class="">
                <div class="flex flex-col justify-center items-center">
                    <div class="flex w-1/2">
                        <img src="../../assets/baguio-logo.png" alt="Success" class="w-1/2">
                        <img src="../../assets/breathe-baguio.png" alt="Success" class="w-1/2">
                    </div>
                    <h1 class="text-2xl font-bold dark:text-white mb-2 text-center italic">You have successfully imported the file.</h1>
                </div>

                <div class="flex justify-between gap-4 py-4">
                    <button @click="goToStep1AndClearFiles" class="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 w-1/2">
                        Upload A New File
                    </button>
                    <button @click="(() => router.push('/reports-management'))" class="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 w-1/2">
                        Back to Report Table
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Optional custom styles */
</style>
