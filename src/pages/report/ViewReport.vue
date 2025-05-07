<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import viewMap from '../../components/Maps/viewMap.vue';
import { useArrayStore } from '../../stores/arrayStore';
import { computed } from 'vue';

const router = useRouter();
const store = useArrayStore();
const storage = ref({});
storage.value = store.getData();
console.log(storage.value);

const props = defineProps({
  data: Object
});

const urgencyBannerColor = computed(() => {
  switch (data.value.urgency) {
    case 'Life-Saving':
      return 'bg-red-500';
    case 'Critical':
      return 'bg-orange-500';
    case 'High Priority':
      return 'bg-yellow-500 text-black';
    case 'Moderate':
      return 'bg-green-500 text-white';
    case 'Low Priority':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
});

const urgencyBorderColor = computed(() => {
  switch (data.value.urgency) {
    case 'Life-Saving':
      return 'border-red-500';
    case 'Critical':
      return 'border-orange-500';
    case 'High Priority':
      return 'border-yellow-500';
    case 'Moderate':
      return 'border-green-500';
    case 'Low Priority':
      return 'border-gray-500';
    default:
      return 'border-gray-500';
  }
});

const urgencyShadowColor = computed(() => {
  switch (data.value.urgency) {
    case 'Life-Saving':
      return 'shadow-red-500';
    case 'Critical':
      return 'shadow-orange-500';
    case 'High Priority':
      return 'shadow-yellow-500';
    case 'Moderate':
      return 'shadow-green-500';
    case 'Low Priority':
      return 'shadow-gray-500';
    default:
      return 'shadow-gray-500';
  }
});

const data = ref({
  name: storage.value.name,
  source: storage.value.source.sources,
  assistance: storage.value.assistance.assistance,
  incident: storage.value.incident.type,
  actions: storage.value.actions.actions,
  date_received: storage.value.date_received,
  arrival_on_site: storage.value.arrival_on_site,
  time: storage.value.time,
  barangay: storage.value.barangay.name,
  landmark: storage.value.landmark,
  longitude: storage.value.barangay.longitude,
  latitude: storage.value.barangay.latitude,
  urgency: storage.value.urgency.urgency,
  description: storage.value.description,
});
</script>

<template>
 <div class="min-h-screen p-4 text-black dark:text-white bg-white dark:bg-gradient-to-br from-gray-900 via-gray-950 to-black ">
  <!-- Back Button -->
  <div class="mb-4 flex justify-start sm:justify-end">
  <button
    type="button"
    name="Back"
    @click.prevent="router.back()"
    class="px-4 py-2 bg-gray-300 text-gray-800 dark:bg-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition duration-200 flex items-center shadow-md"
  >
    <span class="material-icons mr-2">arrow_back</span>
    Back
  </button>
</div>

    
    <!-- Banner Header -->
    <div
      :class="[ 
        'relative w-full h-36 rounded-lg shadow-lg overflow-hidden mb-6 transition-all duration-300', 
        urgencyBannerColor
      ]"
    >
      <!-- Circuit Background -->
      <div class="absolute left-0 top-0 w-full h-full bg-cover opacity-20"></div>

      <!-- Angled Accent -->
      <div class="absolute left-0 top-0 w-250 h-full bg-gradient-to-r from-black/100 to-transparent backdrop-blur-sm"></div>

      <!-- Headline Content -->
      <div class="relative z-10 p-6">
        <h1 class="text-3xl sm:text-5xl lg:text-7xl font-extrabold uppercase tracking-wide">
          <span class="text-white">{{ data.incident }}</span>
        </h1>
        <p class="mt-2 text-lg text-blue-200">{{ data.barangay }}</p>
      </div>
    </div>

    <!-- Incident Card -->
    <div 
      :class="[
        'bg-white dark:bg-black/60 text-gray-900 dark:text-white rounded-xl p-6 shadow-xl border-l-4 transition-all duration-300',
        urgencyBorderColor,
        urgencyShadowColor
      ]"
    >
    <div class="w-full overflow-x-hidden">
      <div class="flex flex-col md:flex-row gap-6">
        
        <!-- Left Side: Incident Details -->
        <div class="md:w-1/2">
          <h2 class="text-xl font-bold mb-4 border-b border-blue-400 pb-2">Incident Details</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Name:</span> {{ data.name }}</p>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Incident Type:</span> {{ data.incident }}</p>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Action:</span> {{ data.actions }}</p>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Source:</span> {{ data.source }}</p>
            </div>
            <div>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Urgency:</span> {{ data.urgency }}</p>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Date Received:</span> {{ data.date_received }}</p>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Arrival Time:</span> {{ data.arrival_on_site }}</p>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Incident Time:</span> {{ data.time }}</p>
            </div>
            <div class="col-span-2">
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Description:</span> {{ data.description }}</p>
            </div>
          </div>

          <div class="border-t border-gray-300 dark:border-gray-600 my-4"></div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Barangay:</span> {{ data.barangay }}</p>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Details:</span> {{ data.landmark }}</p>
            </div>
            <div>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Longitude:</span> {{ data.longitude }}</p>
              <p><span class="font-semibold text-blue-500 dark:text-blue-300">Latitude:</span> {{ data.latitude }}</p>
            </div>
          </div>
        </div>

        <!-- Right Side: Map -->
        <div class="md:w-1/2 flex justify-center items-center bg-gray-100 dark:bg-[#0f172a] rounded-lg p-4">
          <viewMap
            v-if="data.latitude && data.longitude"
            :reportLat="data.latitude"
            :reportLong="data.longitude"
            class="w-full h-64 sm:h-80 lg:h-96 rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
#map {
  height: 50vh;
  width: 100%;
  max-width: 500px;
  border: 1px solid #ccc;
}
</style>
