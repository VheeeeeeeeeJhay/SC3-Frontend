<script setup>
import { ref, inject, onMounted } from "vue";
import PopupModal from "../../components/PopupModal.vue";
import DateRangePicker from "../../components/DateRangePicker.vue";
import axiosClient from "../../axios.js";

const addToast = inject("addToast");

const backend_url = import.meta.env.VITE_BACKEND_URL;
console.log(backend_url);

const isModalOpen = ref(false);

const data = ref({
  name: "",
  number: "",
  email: "",
  image_path: "",
});

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
  formData.append("image_path", data.value.image_path);
  formData.append("name", data.value.name);
  formData.append("number", data.value.number);
  formData.append("email", data.value.email);

  axiosClient
    .post("/api/911/hotline", formData, {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => {
      addToast("Hotline added successfully", "success", "check_circle");
    })
    .catch((error) => {
      errors.value = error.response.data.errors;
      console.log(errors.value);
      addToast(error.response.data.error, "error", "error");
    });
};

const hotlines = ref([]);
const fetchHotlines = () => {
  axiosClient
    .get("/api/911/hotline", {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => {
      hotlines.value = res.data;
      console.log(hotlines.value);
    })
    .catch((error) => {
      console.log(error);
    });
};

onMounted(() => {
  fetchHotlines();
});

import { useActionDropdown } from "../../composables/useActionDropdown";
const { openDropdownId, dropdownRefs, closeDropdown, toggleDropdown } =
  useActionDropdown();
</script>

<template>
  <section class="w-full min-h-screen p-4">
    <!-- Titleee -->
    <div class="mt-6 px-2 flex justify-between">
      <h1 class="text-2xl font-bold dark:text-white">Hotline Management</h1>
      <div
        class="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-end flex-shrink-0 gap-4"
      >
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
        <!-- <DateRangePicker
          class="max-w-xs"
          @dateRangeSelected="updateDateRange"
        /> -->
      </div>
    </div>



    <div class="mt-6 w-full flex flex-wrap gap-4 px-4">
      <div
        class="w-64 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 relative"
        v-for="hotline in hotlines"
        :key="hotline.id"
      >
      <div class="relative flex justify-center items-center w-full h-48 overflow-hidden">
        <img
          v-if="hotline.image_path"
          class="w-full h-full object-cover rounded-t-lg"
          :src="`${backend_url}/storage/` + hotline.image_path"
          alt="Logo"
        />
        <img
          v-else
          class="w-full h-full object-cover rounded-t-lg"
          src="../../assets/baguio-logo.png"
          alt="Logo"
        />

        <button
          @click.stop="toggleDropdown(hotline.id)"
          class="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 p-1 rounded-full shadow-md"
          type="button"
        >
          <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
          
        </div>
        <div class="p-4">
          <a href="#">
            <h5
              class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
            >
              {{ hotline.name }}
            </h5>
          </a>
          <div class="flex gap-2">
            <p class="mb-3 font-bold text-gray-700 dark:text-gray-400">No:/</p>
            <p class="font-normal text-gray-700 dark:text-gray-400">
              {{ hotline.number }}
            </p>
          </div>
          <div class="flex gap-2">
            <p class="mb-3 font-bold text-gray-700 dark:text-gray-400">
              Email:/
            </p>
            <p class="font-normal text-gray-700 dark:text-gray-400">
              {{ hotline.email }}
            </p>
          </div>
          <!-- ✅ Dropdown menu placed here -->
            <div
              v-if="openDropdownId === hotline.id"
              ref="dropdownRefs"
              class="absolute top-full right-2 mt-1 z-100 w-44 shadow-sm border rounded-md bg-white dark:bg-slate-700"
              @click.stop
            >
              <div class="py-2 text-sm flex flex-col w-full items-center">
                <span class="inline-flex w-full block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer">
                  Edit
                </span>
                <span class="inline-flex w-full block px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer">
                  Delete
                </span>
              </div>
            </div>
        </div>
      </div>
    </div>
  </section>


</template>

<style scoped></style>

