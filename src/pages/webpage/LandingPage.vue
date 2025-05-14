<template>
  <div class="bg-black text-white font-[Poppins]">
    <!-- ✅ Navbar Component -->
    <Navbar />

    <!-- Floating Header -->
    <header
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center z-50 bg-black/90 backdrop-blur-md py-6 px-4 shadow-[0_0_20px_rgba(0,255,0,0.6)]"
    >
      <h1 class="text-5xl md:text-7xl font-bold text-green-700" style="text-shadow: 10px 10px 4px black;">
        911-Smart City
      </h1>
      <h2 class="text-2xl md:text-4xl font-semibold text-white mt-2" style="text-shadow: 10px 10px 4px black;">
        Command and Control Center
      </h2>
      <p class="text-lg md:text-2xl text-blue-900 italic mt-4" style="text-shadow: 10px 10px 4px black;">
        SMARTIE - Your AI Assistant
      </p>
    </header>

    <!-- Carousel -->
    <div id="full-width-carousel" class="relative w-full h-screen overflow-hidden">
      <div class="relative w-full h-full">
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          :class="{ 'opacity-100 z-10': index === currentSlide, 'opacity-0 z-0': index !== currentSlide }"
        >
          <img :src="slide" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '../../components/navbar/Navbar.vue'

// ✅ FIXED: correct relative path from /src/pages/landing/ to /src/assets/
import slide1 from '../../assets/Baguio-Smart-City-1.jpg'
import slide2 from '../../assets/Baguio-Smart-City-2.jpg'
import slide3 from '../../assets/Baguio-Smart-City-3.jpg'

const slides = [slide1, slide2, slide3]
const currentSlide = ref(0)

onMounted(() => {
  setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, 5000)
})
</script>

<style scoped>
/* Additional slide transition styling is handled by Tailwind */
</style>
