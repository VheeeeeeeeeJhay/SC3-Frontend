<template>
  <nav class="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-md py-4 px-6 shadow-[0_0_20px_rgba(0,255,0,0.6)] z-50">
    <div class="container mx-auto flex justify-between items-center">
      <!-- Logo Button -->
      <button
        class="relative text-2xl font-bold uppercase tracking-wide text-transparent border-none bg-transparent cursor-pointer overflow-hidden"
      >
        <span class="absolute inset-0 w-0 border-r-2 border-green-500 transition-all duration-500 hover:w-full"></span>
        <span class="relative z-10 block text-stroke text-white/60 hover:text-green-500 transition-all duration-500">
          <router-link to="/home" class="block px-4 py-2 text-green-500"> 911-SCC </router-link>
        </span>
      </button>

      <!-- Navigation Links -->
      <div class="hidden md:flex space-x-6">
        <router-link to="/login" class="block px-4 py-2 text-green-500 hover:bg-gray-800"> LOG IN </router-link>
      </div>

      <!-- Mobile Menu Button -->
      <button @click="toggleMobileMenu" class="md:hidden text-green-500 focus:outline-none">
        ☰
      </button>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="absolute top-full left-0 w-full bg-black py-4 shadow-md md:hidden">
        <a href="#about-section" class="block px-4 py-2 text-green-500 hover:bg-gray-800">About SMARTIE</a>
        <a href="#" @click.prevent="$emit('open-modal', 'howToUseModal')" class="block px-4 py-2 text-green-500 hover:bg-gray-800">How to Use</a>
        <a href="#" @click.prevent="$emit('open-modal', 'topicsModal')" class="block px-4 py-2 text-green-500 hover:bg-gray-800">Topics</a>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<style scoped>
.text-stroke {
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.6);
}

button span:first-child {
  position: absolute;
  inset: 0;
  width: 0;
  background: linear-gradient(to right, transparent, rgba(55, 255, 139, 0.8));
  transition: width 0.5s ease-in-out;
}

button:hover span:first-child {
  width: 100%;
}
</style>
