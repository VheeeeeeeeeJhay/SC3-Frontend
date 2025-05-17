<script setup>
import { ref, inject, onMounted, onUnmounted, computed } from "vue";
import PopupModal from "../../components/PopupModal.vue";
import axiosClient from "../../axios.js";
import { useDatabaseStore } from "../../stores/databaseStore";
import AddContact from "./AddContact.vue";
import EditContact from "./EditContact.vue";
import { useActionDropdown } from "../../composables/useActionDropdown.js";

const addToast = inject("addToast");

const backend_url = import.meta.env.VITE_BACKEND_URL;

const databaseStore = useDatabaseStore();
let refreshInterval = null;
// onMounted(() => {
//   databaseStore.fetchData();
//   refreshInterval = setInterval(() => {
//     databaseStore.fetchData();
//   }, 50000);
// });
// onUnmounted(() => {
//   clearInterval(refreshInterval);
// });

const computedProperties = {
    hotlines: "contacts",
};
const {
    hotlines
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);


const { openDropdownId, dropdownRefs, closeDropdown, toggleDropdown } =
  useActionDropdown();


const archiveHotline = (id) => {
  axiosClient
  .put(`/api/911/emergency-contacts-archive/${id}`, null, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
    },
  })
  .then((res) => {
    addToast("Hotline archived successfully", "success", "check_circle");
  })
  .catch((error) => {
    errors.value = error.response.data.errors;
    addToast(error.response.data.error, "error", "error");
  });
};
</script>

<template>
  <section class="w-full min-h-screen p-4">
    <!-- Titleee -->
    <div class="mt-6 px-2 flex justify-between">
      <h1 class="text-2xl font-bold dark:text-white">Emergency Contacts List</h1>
      <div
        class="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-end flex-shrink-0 gap-4"
      >
          <AddContact/>
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
          <!-- ✅ Dropdown menu placed here -->
          <div
              v-if="openDropdownId === hotline.id"
              ref="dropdownRefs"
              class="absolute top-10 right-2 mt-1 z-50 text-black dark:text-white w-44 shadow-sm border rounded-md bg-white dark:bg-slate-700"
              @click.stop
            >
              <div class="py-2 text-sm flex flex-col w-full items-center">
                <span class="inline-flex w-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer">
                  <EditContact :hotline="hotline" />
                </span>
                <!-- <span class="inline-flex w-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer"> -->
                  <button @click="archiveHotline(hotline.id)">Delete</button>
                <!-- </span> -->
              </div>
            </div>
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
          
        </div>
      </div>
    </div>
  </section>


</template>

<style scoped></style>

