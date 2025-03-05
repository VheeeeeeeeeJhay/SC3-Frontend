<script setup>
import { ref, computed, onMounted, watchEffect } from "vue";
import axiosClient from "../axios";
import leaflet from "leaflet";
import "leaflet.heat";
import { useGeolocation } from "@vueuse/core";
import { userMarker } from "../stores/mapStore.js";

// Import map.json from assets folder (GeoJSON)
import mapData from "../assets/map.json"; // Adjust the path as needed

const { coords } = useGeolocation();
const reports = ref([]);
const heatmapLayer = ref(null);
const geojsonLayer = ref(null); // Reference for GeoJSON layer
let map = null;

// **Reactive State for GeoJSON Border Toggle**
const showGeoJSONBorders = ref(true); // Default: borders are shown

// **Fetch Reports**
onMounted(() => {
  axiosClient
    .get("/api/911/report-display", {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => {
      reports.value = res.data[0] || []; // Ensure reports is an array even if empty
      console.log("Fetched Reports:", reports.value);

      // Check if reports have latitude/longitude
      reports.value.forEach((report) => {
        if (!report.barangay.latitude || !report.barangay.longitude) {
          console.warn(`Report missing lat/long: ${JSON.stringify(report)}`);
        }
      });

      updateHeatmap(); // Update heatmap after fetching reports
    })
    .catch((error) => console.error("Error fetching reports:", error));
});

// **Compute Grouped Reports**
const groupedReports = computed(() => {
  const grouped = {};

  if (reports.value && reports.value.length > 0) {
    reports.value.forEach((report) => {
      const { barangay, incident } = report;
      const { id, name, latitude, longitude } = barangay;

      if (!latitude || !longitude) {
        console.warn(`Missing lat/long for barangay ID: ${id}`);
        return; // Skip reports with missing lat/long
      }

      if (!grouped[id]) {
        grouped[id] = { name, latitude, longitude, incidents: {} };
      }

      if (!grouped[id].incidents[incident.id]) {
        grouped[id].incidents[incident.id] = { name: incident.type, count: 0 };
      }

      grouped[id].incidents[incident.id].count += 1;
    });
  }

  return grouped;
});

// **Initialize Map**
onMounted(() => {
  map = leaflet
    .map("map")
    .setView([16.404, 120.599], 13) // Default position if no mapData
    .addLayer(
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
    );

  // Use data from map.json to adjust map settings (optional)
  if (mapData && mapData.center && mapData.zoom) {
    const { center, zoom } = mapData;
    map.setView(center, zoom); // Set map view from map.json if available
  }

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

  // **Add GeoJSON Layer with hover effect**
  if (mapData && mapData.features) {
    geojsonLayer.value = leaflet.geoJSON(mapData, {
      onEachFeature: (feature, layer) => {
        // Hover effect - when mouse enters
        layer.on("mouseover", () => {
          layer.setStyle({
            weight: 2,        // Thinner border (adjust this value to make it thinner or thicker)
            color: "#ff0000", // Red border on hover
            fillOpacity: 0.7  // Slightly transparent fill on hover
          });
        });

        // Reset style when mouse leaves
        layer.on("mouseout", () => {
          geojsonLayer.value.resetStyle(layer); // Reset to original style
        });
      }
    }).addTo(map);

    // Initially, check if borders should be visible
    if (!showGeoJSONBorders.value) {
      geojsonLayer.value.eachLayer((layer) => {
        layer.setStyle({
          weight: 0, // Hide border by setting weight to 0
        });
      });
    }

    console.log("GeoJSON Layer added to the map with hover effect.");
  }

  updateHeatmap(); // ✅ Only update points
});

// **Toggle GeoJSON Borders**
const toggleGeoJSONBorders = () => {
  showGeoJSONBorders.value = !showGeoJSONBorders.value;

  // Update GeoJSON border visibility based on the toggle
  if (geojsonLayer.value) {
    geojsonLayer.value.eachLayer((layer) => {
      layer.setStyle({
        weight: showGeoJSONBorders.value ? 2 : 0, // Show or hide border based on the toggle
      });
    });
  }
};

// **Extract Data for Heatmap**
const getHeatmapData = () => {
  let heatData = [];

  Object.values(groupedReports.value).forEach(({ latitude, longitude, incidents }) => {
    const totalCount = Object.values(incidents).reduce((sum, inc) => sum + inc.count, 0);

    // Safely check if latitude and longitude exist
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
    
    <!-- Button to toggle GeoJSON Borders -->
    <button @click="toggleGeoJSONBorders" class="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md">
      Toggle GeoJSON Borders
    </button>

    <div id="map"></div>
  </div>
</template>

<style scoped>
#map {
  height: 70vh;
  width: 100%;
}
</style>
