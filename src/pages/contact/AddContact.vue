<script setup>
import { ref, inject, onMounted, onUnmounted, computed } from "vue";
import PopupModal from "../../components/PopupModal.vue";
import axiosClient from "../../axios.js";
import { useDatabaseStore } from "../../stores/databaseStore";
import AddContact from "./AddContact.vue";

const addToast = inject("addToast");

const backend_url = import.meta.env.VITE_BACKEND_URL;

const data = ref({
  name: "",
  number: "",
  email: "",
  image_path: "",
});

const isModalOpen = ref(false);

const imagePreview = ref(null);

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    data.value.image_path = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const errors = ref({});

const addHotline = () => {
  const formData = new FormData();
  if (data.value.image_path instanceof File) {
    formData.append("image_path", data.value.image_path);
  }
  formData.append("name", data.value.name);
  formData.append("number", data.value.number);
  formData.append("email", data.value.email);

  axiosClient
    .post("/api/911/emergency-contacts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => {
      addToast("Hotline added successfully", "success", "check_circle");
    })
    .catch((error) => {
      errors.value = error.response.data.errors;
      addToast(error.response.data.error, "error", "error");
    });
};
</script>

<template>
    <div class="w-full md:w-auto">
        <PopupModal
        Title="Add a New Emergency Hotline"
        ModalButton="Add Hotline"
        Icon=""
        Classes=""
        :show="isModalOpen"
        @update:show="isModalOpen = $event"
        ButtonClass="px-2 flex items-center justify-center font-medium rounded-lg text-sm px- py-2 bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600"
        >
        <template #modalContent>
            <form @submit.prevent="addHotline">
            <div>
                <!-- Preview Image -->
                <div class="flex items-center justify-center">
                <img
                    v-if="imagePreview"
                    :src="imagePreview"
                    alt="Preview"
                    class="w-24 h-24 object-cover mb-2"
                />
                </div>

                <!-- Upload Input -->
                <div>
                <label for="image_path" class="font-medium text-gray-900 dark:text-white">Image</label>
                <input
                    type="file"
                    id="image_path"
                    @change="handleImageUpload"
                    accept="image/*"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
                </div>
            </div>
            <div>
                <label
                for="name"
                class="font-medium text-gray-900 dark:text-white"
                >Name</label
                >
                <input
                type="text"
                id="name"
                v-model="data.name"
                placeholder="Enter name"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
                <p v-if="errors.name" class="text-red-500">
                {{ errors.name[0] }}
                </p>
            </div>
            <div>
                <label
                for="number"
                class="font-medium text-gray-900 dark:text-white"
                >Number</label
                >
                <input
                type="text"
                id="number"
                v-model="data.number"
                placeholder="Enter number"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
                <p v-if="errors.number" class="text-red-500">
                {{ errors.number[0] }}
                </p>
            </div>
            <div>
                <label
                for="email"
                class="font-medium text-gray-900 dark:text-white"
                >Email</label
                >
                <input
                type="email"
                id="email"
                v-model="data.email"
                placeholder="Enter email"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
                <p v-if="errors.email" class="text-red-500">
                {{ errors.email[0] }}
                </p>
            </div>

            <PrimaryButton
                name="Add Hotline"
                type="submit"
                class="w-full py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-all"
            >
            </PrimaryButton>
            </form>
        </template>
        </PopupModal>
    </div>
</template>

<style scoped>
</style>
