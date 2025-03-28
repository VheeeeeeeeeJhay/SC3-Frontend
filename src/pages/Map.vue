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
const heatmapPoints = ref([]); // Store report locations


// Access Pinia store for GeoJSON border visibility
const mapStore = useMapStore();

const errors = ref('');

const fetchData = async () => {
  try {
    const response = await axiosClient.get("/api/911/report-display", {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    reports.value = response.data[0] || []; // Ensure reports is an array even if empty
    console.log("Fetched Reports:", reports.value);

    // Check if reports have latitude/longitude
    reports.value.forEach((report) => {
      if (!report.barangay.latitude || !report.barangay.longitude) {
        console.warn(`Report missing lat/long: ${JSON.stringify(report)}`);
      }
    });

    updateHeatmap();
  } catch (error) {
    console.error("Error fetching reports:", error);
    errors.value = error.response.data.error;
  }
};

onMounted(() => {
  fetchData();
});

// **Compute Grouped Reports**
// **Store Reports Directly Based on Latitude & Longitude**
const processedReports = computed(() => {
  return reports.value
    .filter((report) => report.latitude && report.longitude) // Ensure lat/lng exist
    .map((report) => ({
      id: report.id, // Keep track of report ID
      latitude: report.latitude,
      longitude: report.longitude,
      type: report.incident.type,
      details: report.incident.details || "No details available",
      reportedBy: report.reportedBy || "Anonymous",
      date: report.date || "Unknown",
    }));
});

// Initialize the map
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

  if (mapData && mapData.center && mapData.zoom) {
    map.setView(mapData.center, mapData.zoom);
  }

  // ✅ Create heatmap ONCE
  heatmapLayer.value = leaflet.heatLayer([], {
    radius: 15,
    blur: 20,
    maxZoom: 12,
    minOpacity: 0.5,
    gradient: {
      0.2: 'blue',    // Low intensity
      0.4: 'green',   // Medium-low intensity
      0.6: 'yellow',  // Medium intensity
      0.8: 'orange',  // Medium-high intensity
      1.0: 'red'      // High intensity
    },
  }).addTo(map);

  let persistentPopup = null; // Store the last clicked popup

  // click effect for Heatmap Points
  // map.on("mousemove", (event) => {
  //   const { lat, lng } = event.latlng;
  // click effect for Heatmap Points
  map.on("mousemove", (event) => {
    const { lat, lng } = event.latlng;

    let closestPoint = null;
    let minDistance = Infinity;
    // let closestPoint = null;
    // let minDistance = Infinity;

    heatmapPoints.value.forEach((point) => {
      const distance = map.distance([lat, lng], [point.lat, point.lng]);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });
  });

  // ✅ Click event for Heatmap Points (Keeps popup open)
  map.on("click", (event) => {
    const { lat, lng } = event.latlng;

    let closestPoint = null;
    let minDistance = Infinity;

    heatmapPoints.value.forEach((point) => {
      const distance = map.distance([lat, lng], [point.lat, point.lng]);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    // ✅ Show a **persistent** popup on click
    if (closestPoint && minDistance < 50) {
      // ✅ Find the **single** matching report for the heatmap point
      const matchingReport = reports.value.find(
        (report) =>
          report.latitude === closestPoint.lat &&
          report.longitude === closestPoint.lng
      );

      let popupContent = "<strong>Reported Case</strong><br>";

      if (matchingReport) {
        popupContent += `<strong>Type:</strong> ${matchingReport.incident.type} <br>`;
        popupContent += `<strong>Landmarks:</strong> ${matchingReport.landmark || "N/A"} <br>`;
        popupContent += `<strong>Reported By:</strong> ${matchingReport.name || "Anonymous"} <br>`;
        popupContent += `<strong>Date:</strong> ${matchingReport.date_received || "Unknown"} <br>`;

        console.log(matchingReport); // ✅ Debugging: Log the single matched report
      } else {
        popupContent += "No details available.";
      }

      // ✅ Close the previous persistent popup (if any)
      if (persistentPopup) {
        map.closePopup(persistentPopup);
      }

      // ✅ Create and store a new persistent popup
      persistentPopup = leaflet
        .popup()
        .setLatLng([closestPoint.lat, closestPoint.lng])
        .setContent(popupContent)
        .openOn(map);

      event.originalEvent.stopPropagation(); // ✅ Prevents GeoJSON hover from interfering
    }
  });


  // ✅ Add GeoJSON Layer with hover effect for barangay names
  if (mapData && mapData.features) {
    geojsonLayer.value = leaflet.geoJSON(mapData, {
      onEachFeature: (feature, layer) => {
        layer.on("mouseover", (event) => {
          if (mapStore.showGeoJSONBorders) {
            layer.setStyle({
              weight: 5,
              color: "#007FFF",
              fillOpacity: 0.7,
            });

            // Show barangay name as a tooltip
            const { adm4_en } = feature.properties;
            layer.bindTooltip(adm4_en, { permanent: false, direction: "center" }).openTooltip();
          }
        });

        layer.on("mouseout", () => {
          if (mapStore.showGeoJSONBorders) {
            layer.setStyle({
              weight: 2,
              color: "#007FFF",
              fillOpacity: 0.2,
            });
          } else {
            layer.setStyle({
              weight: 0,
              color: "",
              fillOpacity: 0,
            });
          }

          // Remove tooltip when mouse leaves
          layer.unbindTooltip();
        });

        // Set initial style
        layer.setStyle({
          weight: mapStore.showGeoJSONBorders ? 2 : 0,
          color: "#007FFF",
          fillOpacity: mapStore.showGeoJSONBorders ? 0.2 : 0,
        });
      },
    }).addTo(map);
  }

  updateHeatmap();
});

// **Watch for changes in showGeoJSONBorders**
watch(
  () => mapStore.showGeoJSONBorders, // Watch the showGeoJSONBorders state
  () => {
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

// **Extract Data for Heatmap (No Grouping)**
const getHeatmapData = () => {
  return processedReports.value.map(({ latitude, longitude }) => [latitude, longitude, 1]); // Each report is one point
};


// **Update Heatmap Layer**
const updateHeatmap = () => {
  if (!map || !heatmapLayer.value) return;

  const heatData = getHeatmapData();
  heatmapPoints.value = heatData.map(([lat, lng, count]) => ({ lat, lng, count }));
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
    <!-- Titleee -->
    <div class="mt-6 px-2 flex justify-between">
      <h1 class="text-2xl font-bold dark:text-white">Heatmap of Incidents/Cases</h1>
    </div>

    <!-- Toggle GeoJSON Borders -->
    <label class="inline-flex items-center me-5 cursor-pointer">
      <input type="checkbox" v-model="mapStore.showGeoJSONBorders" class="sr-only peer" />
      <div
        class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600 dark:peer-checked:bg-teal-600">
      </div>
      <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Toggle GeoJSON Borders</span>
    </label>

    <div id="map" class="z-10"></div>
  </div>
</template>

<style scoped>
#map {
  height: 80vh;
  width: 100%;
}
</style>
