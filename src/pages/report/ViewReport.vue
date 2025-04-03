<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import viewMap from '../../components/Maps/viewMap.vue';
import { useArrayStore } from '../../stores/arrayStore';

const router = useRouter();

const store = useArrayStore();
const storage = ref({});
storage.value = store.getData();
console.log(storage.value);

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
});
</script>

<template>
  <div class="min-h-screen p-4">
    <!-- Titleee -->
    <div class="mt-6 px-2 flex justify-between">
      <h1 class="text-2xl font-bold dark:text-white">Report View of Case {{ data.id }}</h1>
      <Button type="button" name="Back" @click.prevent="router.back()"
        class="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
        <span class="material-icons mr-2"> arrow_back </span>
        Back
      </Button>
    </div>

    <!-- Content Wrapper -->
    <div class="container mx-auto mt-6 bg-sky-50 dark:bg-slate-800 shadow-md rounded-lg">
      <div class="flex flex-col md:flex-row">
        <!-- Left Side: Text Information -->
        <div class="w-full md:w-1/2 p-6 rounded-lg text-gray-800 dark:text-gray-200">
          <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Incident Details</h2>
          
          <div class="grid grid-cols-2 grid-rows-1 gap-4">
            <div>
              <div>
                <span class="font-semibold ">Name:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.name }}</div>
              </div>
              <div>
                <span class="font-semibold ">Incident Type:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.incident }}</div>
              </div>
              <div>
                <span class="font-semibold ">Action:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.actions }}</div>
              </div>
            </div>
            <div>
              <div>
                <span class="font-semibold ">Source:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.source }}</div>
              </div>
              <div>
                <span class="font-semibold ">Incident:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.incident }}</div>
              </div>
              <div>
                <span class="font-semibold ">Urgency:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.urgency }}</div>
              </div>
            </div>
          </div>

          <br>
          <hr class="border-gray-300 dark:border-gray-700">
          <br>

          <div class="grid grid-cols-2 grid-rows-1 gap-4">
            <div>
              <div>
                <span class="font-semibold ">Received Date:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.date_received }}</div>
              </div>
              <div>
                <span class="font-semibold ">Arrival Time:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.arrival_on_site }}</div>
              </div>
            </div>
            <div>
              <div>
                <span class="font-semibold ">Incident Time:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.time }}</div>
              </div>
            </div>
          </div>

          <br>
          <hr class="border-gray-300 dark:border-gray-700">
          <br>

          <div class="grid grid-cols-2 grid-rows-1 gap-4">
            <div>
              <div>
                <span class="font-semibold ">Barangay:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.barangay }}</div>
              </div>
              <div>
                <span class="font-semibold ">Details:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.landmark }}</div>
              </div>
            </div>
            <div>
              <div>
                <span class="font-semibold ">Longitude:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.longitude }}</div>
              </div>
              <div>
                <span class="font-semibold ">Latitude:</span>
                <div
                  class="relative p-2 rounded bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-700 dark:to-transparent">
                  {{ data.latitude }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Map -->
        <div class="w-full md:w-1/2 flex justify-center items-center mt-6 md:mt-0">
          <!-- <div id="map" class="rounded-lg shadow-md"></div> -->
          <viewMap v-if="data.latitude && data.longitude" id="map" class=" z-10 rounded-lg shadow-md"
            :reportLat="data.latitude" :reportLong="data.longitude" />
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
