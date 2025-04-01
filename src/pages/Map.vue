<script setup>
import { ref, computed, onMounted, watch, watchEffect, createApp, h } from "vue";
import axiosClient from "../axios";
import leaflet from "leaflet";
import "leaflet.heat";
import { useGeolocation } from "@vueuse/core";
import { useMapStore } from "../stores/mapStore"; // Import Pinia store for managing state
import DateRangePicker from "../components/DateRangePicker.vue";
import monthYearPicker from "../components/monthYearPicker.vue"; // Import monthYearPicker component
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
const errors = ref("");

const fetchData = async () => {
  try {
    const response = await axiosClient.get("/api/911/report-display", {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    });
    reports.value = response.data[0] || []; // Ensure reports is an array even if empty
    console.log("Fetched Reports:", reports.value);

    // Check if reports have latitude/longitude
    reports.value.forEach((report) => {
      if (!report.barangay.latitude || !report.barangay.longitude) {
        console.warn(`Report missing lat/long: ${JSON.stringify(report)}`);
      }
    });

    // updateHeatmap();
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
    .filter((report) => report.barangay.latitude && report.barangay.longitude) // Ensure lat/lng exist
    .map((report) => ({
      id: report.id, // Keep track of report ID
      latitude: report.barangay.latitude,
      longitude: report.barangay.longitude,
      type: report.incident.type,
      details: report.incident.details || "No details available",
      reportedBy: report.reportedBy || "Anonymous",
      date: report.date || "Unknown",
    }));
});
const groupedReportsByBarangay = computed(() => {
  const grouped = {}; // Object to store barangay data

  reports.value.forEach((report) => {
    const barangay = report.barangay;
    if (!barangay || !barangay.id || !barangay.latitude || !barangay.longitude)
      return; // Ensure valid data

    const barangayId = barangay.id; // Group by Barangay ID

    if (!grouped[barangayId]) {
      grouped[barangayId] = {
        id: barangayId,
        name: barangay.name || "Unknown Barangay", // Optional: Display Barangay name
        latitude: barangay.latitude,
        longitude: barangay.longitude,
        totalReports: 0,
      };
    }

    grouped[barangayId].totalReports += 1; // Count total reports in that barangay
  });

  return Object.values(grouped); // Convert object to array
});

// Initialize the map
onMounted(() => {
  map = leaflet
    .map("map")
    .setView([16.404, 120.599], 13)
    .addLayer(
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
    );
  const bounds = leaflet.latLngBounds(
    [16.35, 120.52], // Southwest (bottom-left)
    [16.48, 120.66] // Northeast (top-right)
  );
  map.setMaxBounds(bounds);
  map.setMinZoom(13);

  if (mapData && mapData.center && mapData.zoom) {
    map.setView(mapData.center, mapData.zoom);
  }

  // ✅ Create heatmap ONCE
  heatmapLayer.value = leaflet
    .heatLayer([], {
      radius: 15,
      blur: 20,
      maxZoom: 12,
      minOpacity: 0.5,
      gradient: {
        0.2: "blue", // Low intensity
        0.4: "green", // Medium-low intensity
        0.6: "yellow", // Medium intensity
        0.8: "orange", // Medium-high intensity
        1.0: "red", // High intensity
      },
    })
    .addTo(map);

  // ✅ Add Custom Control for Toggle Button
  const toggleControl = leaflet.control({ position: "topleft" });

  toggleControl.onAdd = function () {
    const div = leaflet.DomUtil.create(
      "div",
      "leaflet-bar leaflet-control leaflet-control-custom"
    );
    div.innerHTML = `<button id="toggleBordersBtn" class="border-toggle-btn">Borders</button>`;

    div.onclick = () => {
      mapStore.showGeoJSONBorders = !mapStore.showGeoJSONBorders; // Toggle the state
    };

    return div;
  };

  toggleControl.addTo(map); // ✅ Add the control to the map

  // Create another control for the new button
  const anotherControl = leaflet.control({ position: "topright" });

anotherControl.onAdd = function () {
  const div = leaflet.DomUtil.create("div", "leaflet-bar leaflet-control-custom");
  div.id = "date-picker-container"; // Unique ID for mounting Vue component

  return div;
};

anotherControl.addTo(map);


  // ✅ Style the Buttons with CSS
  const style = document.createElement("style");
  style.innerHTML = `
    .border-toggle-btn {
      background: white;
      border: none;
      cursor: pointer;
      font-size: 11px;
      font-weight: bold;
      text-align: center;
      width: 50px;
    }

    .border-toggle-btn:hover {
      background: #007FFF;
      color: white;
    }
  `;
  document.head.appendChild(style);

  let persistentPopup = null; // Store the last clicked popup
  map.on("mousemove", (event) => {
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
  });

  // ✅ Click event for Heatmap Points (Keeps popup open)
  map.on("click", (event) => {
    const { lat, lng } = event.latlng;
    let closestBarangay = null;
    let minDistance = Infinity;

    groupedReportsByBarangay.value.forEach((barangay) => {
      const distance = map.distance(
        [lat, lng],
        [barangay.latitude, barangay.longitude]
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestBarangay = barangay;
      }
    });

    if (closestBarangay && minDistance < 50) {
      let popupContent = `<strong>${closestBarangay.name}</strong><br>`; // ✅ Show Barangay name
      popupContent += `<strong>Total Reports:</strong> ${closestBarangay.totalReports}<br>`; // ✅ Show total reports

      // ✅ Close previous popup
      if (persistentPopup) {
        map.closePopup(persistentPopup);
      }

      // ✅ Show new popup
      persistentPopup = leaflet
        .popup()
        .setLatLng([closestBarangay.latitude, closestBarangay.longitude])
        .setContent(popupContent)
        .openOn(map);

      event.originalEvent.stopPropagation(); // Prevent interference with other events
    }
  });

  // ✅ Add GeoJSON Layer with hover effect for barangay names
  if (mapData && mapData.features) {
    geojsonLayer.value = leaflet
      .geoJSON(mapData, {
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
              layer
                .bindTooltip(adm4_en, { permanent: false, direction: "center" })
                .openTooltip();
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
            // layer.unbindTooltip();
          });

          // Set initial style
          layer.setStyle({
            weight: mapStore.showGeoJSONBorders ? 2 : 0,
            color: "#007FFF",
            fillOpacity: mapStore.showGeoJSONBorders ? 0.2 : 0,
          });
        },
      })
      .addTo(map);
  }

  // updateHeatmap();
});

const addBarangayMarkers = () => {
  if (!map || !groupedReportsByBarangay.value) return;

  groupedReportsByBarangay.value.forEach((barangay) => {
    const totalReports = barangay.totalReports || 0;

    let markerColor;
    if (totalReports >= 10) {
      markerColor = "red"; // High reports
    } else if (totalReports === 0) {
      markerColor = "green"; // No reports
    } else {
      markerColor = "yellow"; // Moderate reports
    }

    leaflet
      .marker([barangay.latitude, barangay.longitude], {
        icon: leaflet.divIcon({
          className: "custom-marker",
          html: `<div style="width: 24px; height: 24px; background-color: ${markerColor}; border-radius: 50%; border: 2px solid white;"></div>`,
        }),
      })
      .addTo(map)
      .bindPopup(
        `<strong>${barangay.name}</strong><br>Total Reports: ${totalReports}`
      );
  });
};
onMounted(() => {
  fetchData().then(() => {
    addBarangayMarkers(); // ✅ Add markers after fetching data
  });
});

watchEffect(() => {
  if (reports.value.length > 0) {
    addBarangayMarkers(); // ✅ Refresh markers when data changes
  }
});

// ✅ Mount Vue Component in the Leaflet Control
onMounted(() => {
  createApp({
    render: () => h(DateRangePicker, { 
      class: "max-w-xs",
      onDateRangeSelected: updateDateRange, // Pass event handler
    }),
  }).mount("#date-picker-container");
});

const updateDateRange = (range) => {
  console.log("Selected Date Range:", range);
  // Add logic to filter reports based on date
};
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
  return processedReports.value.map(({ latitude, longitude }) => [
    latitude,
    longitude,
    1,
  ]); // ✅ Now uses barangay lat/lng
};

// **Update Heatmap Layer**
const updateHeatmap = () => {
  if (!map || !heatmapLayer.value) return;

  const heatData = getHeatmapData();
  heatmapPoints.value = heatData.map(([lat, lng, count]) => ({
    lat,
    lng,
    count,
  }));
  heatmapLayer.value.setLatLngs(heatData);
};

// ✅ Refresh heatmap only when reports change (prevent excessive updates)
watchEffect(() => {
  if (reports.value.length > 0) {
    // updateHeatmap();
  }
});
</script>
<!-- nawawala buttons pag nilalagay yung inset -->
<template>
  <div class="h-full w-full">
    <div id="map" class="h-full w-full"></div>
  </div>
</template>

<style scoped>
#map {
  height: 100%;
  width: 100%;
  pointer-events: auto;
}
</style>
