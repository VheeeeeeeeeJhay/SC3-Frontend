<script setup>
import { ref, inject, onMounted, onUnmounted, computed, watch } from "vue";
import PopupModal from "../../components/PopupModal.vue";
import axiosClient from "../../axios.js";
import { useDatabaseStore } from "../../stores/databaseStore";
import AddContact from "./AddContact.vue";

const addToast = inject("addToast");

const backend_url = import.meta.env.VITE_BACKEND_URL;

const props = defineProps({
  hotline: Object
});
console.log(props.hotline);

const data = ref({
    id: "",
  name: "",
  number: "",
  email: "",
  image_path: "",
});

watch(() => props.hotline, (newVal) => {
    data.value.id = newVal.id;
    data.value.name = newVal.name;
    data.value.number = newVal.number;
    data.value.email = newVal.email;
    data.value.image_path = newVal.image_path;
    console.log(data.value);
}, { immediate: true });


const isModalOpen = ref(false);

const imagePreview = ref(null);

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    data.value.image_path = file;
    imagePreview.value = URL.createObjectURL(file);
  } else {
    // If no new file is selected, use the existing image
    if (props.hotline.image_path) {
      imagePreview.value = props.hotline.image_path;
    }
  }
};

const errors = ref({});

const editHotline = (id) => {
    console.log(data.value);
    console.log(data.value.name);
    const formData = new FormData();
    formData.append("name", data.value.name);
    formData.append("number", data.value.number);
    formData.append("email", data.value.email);
    if (data.value.image_path instanceof File) {
  formData.append("image_path", data.value.image_path);
}

  axiosClient
    .put(`/api/911/emergency-contacts-update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => {
      addToast("Hotline updated successfully", "success", "check_circle");
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
        Title="Edit Emergency Hotline"
        ModalButton="Edit Hotline"
        Icon=""
        Classes=""
        :show="isModalOpen"
        @update:show="isModalOpen = $event"
        ButtonClass="px-2 flex items-center justify-center font-medium rounded-lg text-sm px- py-2 bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600"
        >
        <template #modalContent>
            <form @submit.prevent="editHotline(data.id)">
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
                <!-- <p v-if="errors.value.name" class="text-red-500">
                {{ errors.value.name[0] }}
                </p> -->
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
                <!-- <p v-if="errors.value.number" class="text-red-500">
                {{ errors.value.number[0] }}
                </p> -->
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
                <!-- <p v-if="errors.value.email" class="text-red-500">
                {{ errors.value.email[0] }}
                </p> -->
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
