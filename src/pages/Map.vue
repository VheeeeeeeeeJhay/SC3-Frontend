<script setup>
import { ref, computed, onMounted, watch, watchEffect } from "vue";
import axiosClient from "../axios";
import leaflet from "leaflet";
import "leaflet.heat";
import { useGeolocation } from "@vueuse/core";
import { useMapStore } from "../stores/mapStore"; // Import Pinia store for managing state

// Import map.json from assets folder (GeoJSON)
import mapData from "../assets/map.json"; // Adjust the path as needed

const { coords } = useGeolocation();
const reports = ref([]);
const heatmapLayer = ref(null);
const geojsonLayer = ref(null); // Reference for GeoJSON layer
let map = null;

// Access Pinia store for GeoJSON border visibility
const mapStore = useMapStore();

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
      const { barangay, incident, latitude, longitude } = report;
      const { id, name } = barangay;

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

  // **Add GeoJSON Layer with hover effect and clickability**
  if (mapData && mapData.features) {
    geojsonLayer.value = leaflet.geoJSON(mapData, {
      onEachFeature: (feature, layer) => {
        // Hover effect - when mouse enters (only if borders are enabled)
        layer.on("mouseover", () => {
          if (mapStore.showGeoJSONBorders) {
            layer.setStyle({
              weight: 5,        // Thicker border on hover
              color: "#007FFF", // Light blue border on hover
              fillOpacity: 0.7  // Slightly transparent fill on hover
            });
          }
        });

        // Reset style when mouse leaves (only if borders are enabled)
        layer.on("mouseout", () => {
          if (mapStore.showGeoJSONBorders) {
            layer.setStyle({
              weight: 2,        // Normal border size
              color: "#007FFF", // Ensure it stays light blue even after mouseout
              fillOpacity: 0.2  // Reset opacity
            });
          } else {
            // If borders are disabled, reset completely (no hover effect)
            layer.setStyle({
              weight: 0, // No border
              color: "",  // No color for border
              fillOpacity: 0  // No fill opacity
            });
          }
        });

        // Add click event for interactivity
        layer.on("click", () => {
          // Extract feature data
          const { adm4_en, geo_level, area_km2, len_km } = feature.properties;
          
          // Display a popup with feature info
          const popupContent = `
            <strong>Area:</strong> ${adm4_en}<br>
            <strong>Geo Level:</strong> ${geo_level}<br>
            <strong>Length (km):</strong> ${len_km} km<br>
            <strong>Area (km²):</strong> ${area_km2} km²
          `;
          layer.bindPopup(popupContent).openPopup();
          
          // Example: You could display additional details about the clicked feature here
          console.log("Feature clicked:", feature);
        });

        // Set initial style based on border toggle state
        layer.setStyle({
          weight: mapStore.showGeoJSONBorders ? 2 : 0, // Show or hide border based on the toggle
          color: "#007FFF", // Ensure the default color is light blue
          fillOpacity: mapStore.showGeoJSONBorders ? 0.2 : 0, // Ensure background is removed when toggled off
        });
      }
    }).addTo(map);

    console.log("GeoJSON Layer added to the map with hover effect and clickability.");
  }

  updateHeatmap(); // ✅ Only update points
});

// **Watch for changes in showGeoJSONBorders**
watch(
  () => mapStore.showGeoJSONBorders, // Watch the showGeoJSONBorders state
  (newVal) => {
    updateGeoJSONStyles(); // Apply the new styles when the value changes
  }
);

// **Update GeoJSON Layer Styles**
const updateGeoJSONStyles = () => {
  if (geojsonLayer.value) {
    geojsonLayer.value.eachLayer((layer) => {
      // Update style based on border visibility
      layer.setStyle({
        weight: mapStore.showGeoJSONBorders ? 2 : 0, // Show or hide borders based on the toggle
        color: mapStore.showGeoJSONBorders ? "#007FFF" : "", // Light blue border when active, no border when inactive
        fillOpacity: mapStore.showGeoJSONBorders ? 0.2 : 0, // Light opacity fill when active, no fill when inactive
        fillColor: mapStore.showGeoJSONBorders ? "#007FFF" : "", // Optional: Set fill color based on border state
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

    <!-- Toggle GeoJSON Borders -->
    <label class="inline-flex items-center me-5 cursor-pointer">
      <input 
        type="checkbox" 
        v-model="mapStore.showGeoJSONBorders" 
        class="sr-only peer"
      />
      <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600 dark:peer-checked:bg-teal-600"></div>
      <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Toggle GeoJSON Borders</span>
    </label>

    <div id="map"></div>
  </div>
</template>

<style scoped>
#map {
  height: 70vh;
  width: 100%;
}
</style>
