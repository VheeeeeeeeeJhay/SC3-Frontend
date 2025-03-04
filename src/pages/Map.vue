<script setup>
import { ref, computed, onMounted, watchEffect } from "vue";
import axiosClient from "../axios";
import leaflet from "leaflet";
import "leaflet.heat";
import { useGeolocation } from "@vueuse/core";
import { userMarker } from "../stores/mapStore.js";

const { coords } = useGeolocation();
const reports = ref([]);
const heatmapLayer = ref(null);
let map = null;

// **Fetch Reports**
onMounted(() => {
  axiosClient
    .get("/api/911/report-display", {
      headers: { 
        "x-api-key": import.meta.env.VITE_API_KEY
      },
    })
    .then((res) => {
      reports.value = res.data[0];
      console.log("Fetched Reports:", reports.value);
      updateHeatmap();
    })
    .catch((error) => console.error("Error fetching reports:", error));
});

// **Compute Grouped Reports**
const groupedReports = computed(() => {
  const grouped = {};

  reports.value.forEach((report) => {
    const { barangay, incident } = report;
    const { id, name, latitude, longitude } = barangay;

    if (!grouped[id]) {
      grouped[id] = { name, latitude, longitude, incidents: {} };
    }

    if (!grouped[id].incidents[incident.id]) {
      grouped[id].incidents[incident.id] = { name: incident.type, count: 0 };
    }

    grouped[id].incidents[incident.id].count += 1;
  });

  return grouped;
});

// **Initialize Map**
onMounted(() => {
  map = leaflet
    .map("map")
    .setView([16.404, 120.599], 13)
    .addLayer(
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
    );

  // ✅ Create heatmap ONCE
  heatmapLayer.value = leaflet.heatLayer([], {
    radius: 25,
    blur: 15,
    maxZoom: 17,
    minOpacity: 0.4,
    gradient: {
      0.3: "blue",
      0.6: "green",
      1.0: "red",
    },
  }).addTo(map);

  updateHeatmap(); // ✅ Only update points
  
});



// **Extract Data for Heatmap**
const getHeatmapData = () => {
  let heatData = [];

  Object.values(groupedReports.value).forEach(({ latitude, longitude, incidents }) => {
    const totalCount = Object.values(incidents).reduce((sum, inc) => sum + inc.count, 0);
    if (latitude && longitude) {
      heatData.push([latitude, longitude, totalCount]);
    }
  });

  return heatData;
};

// **Update Heatmap Layer**
const updateHeatmap = () => {
  if (!map || !heatmapLayer.value) return;

  const heatData = getHeatmapData();

  // ✅ Instead of re-adding, update heat layer data
  heatmapLayer.value.setLatLngs(heatData);
};




// ✅ Refresh heatmap only when reports change (prevent excessive updates)
watchEffect(() => {
  if (reports.value.length > 0) {
    updateHeatmap();
  }
});
</script>


<template>
  <div class="min-h-screen">
    <h2 class="text-lg font-bold mb-4">Heatmap of Incidents</h2>
    <div id="map"></div>
  </div>
</template>

<style scoped>
#map {
  height: 70vh;
  width: 100%;
}
</style>
