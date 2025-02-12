<script setup>
import { PhotoIcon } from '@heroicons/vue/24/solid'
import { ref, computed } from "vue";
import axiosClient from "../axios.js";
import router from "../router.js";
import { useThemeStore } from '../stores/themeStore';
import PrimaryButton from '../components/PrimaryButton.vue';

const themeStore = useThemeStore();

const data = ref({
  image: null,
  label: ''
})

const bgClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-900' : 'bg-gray-100';
})

function submit() {
  const formData = new FormData()
  formData.append('image', data.value.image)
  formData.append('label', data.value.label)
  axiosClient.post('/api/image', formData)
    .then(res => {
      router.push({ name: 'MyImages' })
    })
}

</script>

<template>
  <div :class="bgClass">
    <header :class="themeStore.isDarkMode ? 'bg-gray-900' : 'bg-white'">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight" :class="themeStore.isDarkMode ? 'text-gray-100' : 'text-gray-900'">
          Upload
        </h1>
      </div>
    </header>
    <main>
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <form @submit.prevent="submit">
          <div class="mb-4">
            <label for="cover-photo" class="block text-sm/6 font-medium" :class="themeStore.isDarkMode ? 'text-gray-100' : 'text-gray-900'">Image</label>
            <div class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
              <div class="text-center">
                <PhotoIcon class="mx-auto size-12 text-gray-300" aria-hidden="true" />
                <div class="mt-4 flex text-sm/6" :class="themeStore.isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <label for="file-upload"
                    class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" @change="data.image = $event.target.files[0]"
                      class="sr-only" />
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs/5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
          <div class="mb-4">
            <label for="label" class="block text-sm/6 font-medium text-gray-900">Label</label>
            <div class="mt-2">
              <input type="text" name="label" id="label" v-model="data.label"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            </div>
          </div>
          <!-- <button type="submit"
            class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Upload
          </button> -->
          <PrimaryButton class="bg-green-500 hover:bg-green-600 hover:shadow-md" name="Upload" type="submit"/>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped></style>