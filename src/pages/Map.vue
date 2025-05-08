<script setup>
import {
  ref,
  computed,
  onMounted,
  watch,
  watchEffect,
  createApp,
  onUnmounted,
  h,
} from "vue";
import axiosClient from "../axios";
import leaflet from "leaflet";
import "leaflet.heat";
import { useGeolocation } from "@vueuse/core";
import { useMapStore } from "../stores/mapStore"; // Import Pinia store for managing state
import DateRangePicker from "../components/DateRangePicker.vue";
import monthYearPicker from "../components/monthYearPicker.vue"; // Import monthYearPicker component
// Import map.json from assets folder (GeoJSON)
import mapData from "../assets/updated-map.json"; // Adjust the path as needed
import { useDatabaseStore } from "../stores/databaseStore";


const { coords } = useGeolocation();
// const reports = ref([]);
const heatmapLayer = ref(null);
const geojsonLayer = ref(null); // Reference for GeoJSON layer
let map = null;
const heatmapPoints = ref([]); // Store report locations


let refreshInterval = null;
const databaseStore = useDatabaseStore();

onMounted(() => {
    databaseStore.fetchData();
    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);
});

onUnmounted(() => {
  // Clear the interval when the component is unmounted or page is reloaded
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

const computedProperties = {
    reports: "reports",
};

const {
    reports,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])  
);

// Access Pinia store for GeoJSON border visibility
const mapStore = useMapStore();
const errors = ref("");
let legendControl; 



const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const endDate = ref(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
// console.log("Start Date:", startDate.value);
// console.log("End Date:", endDate.value);
const updateDateRange = ({ start, end }) => {
  startDate.value = start;
  endDate.value = end;
  // console.log("📅 Date range updated:", start, "to", end);

  addBarangayMarkers(); // Refresh markers based on the new date range
};

watch([startDate, endDate], () => {
  addBarangayMarkers();
  // console.log("nacall naman date range");
});

const groupedReportsByBarangay = computed(() => { 
  if (!startDate.value || !endDate.value) return []; // If no date selected, return empty

  const startISO = new Date(startDate.value).toISOString().split("T")[0];
  const endISO = new Date(endDate.value).toISOString().split("T")[0];

  const grouped = {};

  reports.value
    .filter((report) => {
      if (!report.date_received) return false;

      const reportDate = new Date(report.date_received).toISOString().split("T")[0];

      return reportDate >= startISO && reportDate <= endISO;
    })
    .forEach((report) => {
      const barangay = report.barangay;
      if (!barangay || !barangay.id || !barangay.latitude || !barangay.longitude) return;

      const barangayId = barangay.id;
      if (!grouped[barangayId]) {
        grouped[barangayId] = {
          id: barangayId,
          name: barangay.name || "Unknown Barangay",
          latitude: barangay.latitude,
          longitude: barangay.longitude,
          totalReports: 0,
        };
      }
      grouped[barangayId].totalReports += 1;
    });

  return Object.values(grouped);
});

// Initialize the map
onMounted(() => {
  map = leaflet
    .map("map")
    .setView([16.404, 120.599], 13)
    .addLayer(
      leaflet.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          ext: 'png'
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

  // ✅ Custom Control for Dropdown with Dark Mode and Borders Toggle
  const dropdownControl = leaflet.control({ position: "topleft" });

dropdownControl.onAdd = function () {
  const div = leaflet.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");

  // Create the dropdown container
  div.innerHTML = `
    <div class="dropdown">
      <button class="dropbtn">⚙️</button>
      <div class="dropdown-content">
        <button id="darkModeToggleBtn" class="dark-mode-toggle"></button>
        <button id="toggleBordersBtn" class="border-toggle-btn">Borders</button>
        <button id="captureMapBtn" class="capture-map-btn">Capture Map</button>
      </div>
    </div>
  `;

  // Handle toggle events
  div.querySelector("#darkModeToggleBtn").onclick = () => {
    toggleDarkMode();
  };
  div.querySelector("#toggleBordersBtn").onclick = () => {
    mapStore.showGeoJSONBorders = !mapStore.showGeoJSONBorders; // Toggle borders state
  };
  div.querySelector("#captureMapBtn").onclick = () => {
    captureImage();
  };

  return div;
};

dropdownControl.addTo(map);

// Initialize tile layers
const lightTileLayer = leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

const darkTileLayer = leaflet.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

  /// ✅ Check the dark mode state on page load
  const checkDarkMode = () => {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    map.removeLayer(lightTileLayer);
    map.addLayer(darkTileLayer);
  } else {
    map.removeLayer(darkTileLayer);
    map.addLayer(lightTileLayer);
  }
  updateToggleButton(isDarkMode);
};

// ✅ Update the toggle button UI
const updateToggleButton = (isDarkMode) => {
  const button = document.getElementById("darkModeToggleBtn");
  if (button) {
    button.innerHTML = isDarkMode ? "Default Tile" : "Dark Tile";
  }
};

    // ✅ Add Custom Control for Dark Mode Toggle
    const darkModeControl = leaflet.control({ position: "topleft" });

    darkModeControl.onAdd = function () {
      const div = leaflet.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom"
      );
      // div.innerHTML = `<button id="darkModeToggleBtn" class="dark-mode-toggle">🌙 Dark Mode</button>`;

      div.onclick = () => {
        toggleDarkMode();
      };

      return div;
    };

    darkModeControl.addTo(map);

    // ✅ Call checkDarkMode to set the initial state when the map loads
    checkDarkMode();

    // ✅ Function to Toggle Dark Mode

// ✅ Toggle dark mode by switching tile layers
const toggleDarkMode = () => {
  const isCurrentlyDark = localStorage.getItem('darkMode') === 'true';
  const newDarkMode = !isCurrentlyDark;

  localStorage.setItem('darkMode', newDarkMode.toString());

  if (newDarkMode) {
    map.removeLayer(lightTileLayer);
    map.addLayer(darkTileLayer);
  } else {
    map.removeLayer(darkTileLayer);
    map.addLayer(lightTileLayer);
  }
  updateToggleButton(newDarkMode);
};

  // Create another control for the new button
  const anotherControl = leaflet.control({ position: "topright" });

  anotherControl.onAdd = function () {
    const div = leaflet.DomUtil.create(
      "div",
      "leaflet-bar leaflet-control-custom"
    );
    div.id = "date-picker-container"; // Unique ID for mounting Vue component
    return div;
  };

  anotherControl.addTo(map);

  // Add legend control
  watch(groupedReportsByBarangay, (newVal) => {
  // Only proceed if data is present
  if (!newVal || newVal.length === 0) return;

  // Remove existing legend (if any) to avoid duplication
  if (legendControl) {
    map.removeControl(legendControl);
  }

  // Define legend control
  legendControl = leaflet.control({ position: "bottomleft" });

  legendControl.onAdd = function () {
    const div = leaflet.DomUtil.create("div", "legend leaflet-control");

    const reportsArray = newVal
      .map((b) => b.totalReports)
      .filter((r) => !isNaN(r) && r !== undefined);

    const minReports = reportsArray.length ? Math.min(...reportsArray) : 0;
    const maxReports = reportsArray.length ? Math.max(...reportsArray) : 3;

    const legendHTML = `
      <h4>Incident Reports</h4>
      <div class="legend-gradient">
        <span>${minReports}</span>
        <div class="gradient-bar"></div>
        <span>${maxReports}</span>
      </div>
    `;

    div.innerHTML = legendHTML;
    return div;
  };

  legendControl.addTo(map); // ✅ Add legend only when data is ready
});


  // ✅ Style the Buttons and Legend with CSS
  const style = document.createElement("style");
  style.innerHTML = `
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropbtn {
    background: white;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 4px;
  }

  .dropbtn:hover {
    background: #007FFF;
    color: white;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: white;
    min-width: 160px;
    z-index: 1;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
    padding: 5px 0;
  }

  .dropdown:hover .dropdown-content {
    display: block;
  }

  .dropdown-content button {
    background: white;
    border: none;
    cursor: pointer;
    padding: 8px 12px;
    width: 100%;
    text-align: left;
  }

  .dropdown-content button:hover {
    background-color: #f1f1f1;
  }
    .border-toggle-btn, .dark-mode-toggle {
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

    .legend {
      background: white;
      padding: 10px;
      border-radius: 4px;
      box-shadow: 0 1px 5px rgba(0,0,0,0.4);
      font-size: 12px;
      line-height: 1.5;
    }

    .legend h4 {
      margin: 0 0 5px;
      font-size: 14px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
    }
    .legend-circle {
      display: inline-block;
      border-radius: 50%;
      margin-right: 8px;
      border: 1px solid #444;
    }

    .legend-gradient {
      display: flex;
      align-items: center;
    }
    .gradient-bar {
      flex: 1;
      height: 12px;
      margin: 0 8px;
      background: linear-gradient(to right, hsl(120, 100%, 50%), hsl(0, 100%, 50%));
      border: 1px solid #aaa;
    }

    .dark-mode-toggle {
    background: white;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    padding: 5px 10px;
    border-radius: 4px;
  }

  .dark-mode-toggle:hover {
    background: #007FFF;
    color: white;
  }
`;
  document.head.appendChild(style);

  // ✅ Convert LineStrings to Polygons before rendering
if (mapData && mapData.features) {
  mapData.features = mapData.features.map((feature) => {
    if (feature.geometry.type === "LineString") {
      const coords = feature.geometry.coordinates;

      // Close the loop if it's not already closed
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push(first);
      }

      return {
        ...feature,
        geometry: {
          type: "Polygon",
          coordinates: [coords], // Wrap in array for Polygon
        },
      };
    }

    return feature;
  });

  // ✅ Add GeoJSON Layer with hover effect for barangay names
  geojsonLayer.value = leaflet
    .geoJSON(mapData, {
      onEachFeature: (feature, layer) => {
        const barangayName = feature.properties.adm4_en || feature.properties.name;
        
        // Create a formatted popup content with all properties
        const properties = feature.properties;
        const popupContent = `
          <div class="p-1">
            <h4 class="font-bold">${barangayName}</h4>
          </div>
        `;

        layer.on("click", () => {
          layer.bindPopup(popupContent, {
            maxWidth: 300,
            closeButton: true
          }).openPopup();
        });

        layer.on("mouseover", () => {
          if (mapStore.showGeoJSONBorders) {
            layer.setStyle({
              weight: 5,
              color: "#007FFF",
              fill: true,
              fillColor: getBarangayColor(barangayName),
              fillOpacity: 0.7,
            });

            layer
              .bindTooltip(barangayName, {
                permanent: false,
                direction: "center",
              })
              .openTooltip();
          }
        });

        layer.on("mouseout", () => {
          if (mapStore.showGeoJSONBorders) {
            layer.setStyle({
              weight: 2,
              color: "#007FFF",
              fill: true,
              fillColor: getBarangayColor(barangayName),
              fillOpacity: 0.2,
            });
          } else {
            layer.setStyle({
              weight: 0,
              color: "",
              fillOpacity: 0,
            });
          }
        });

        // Initial style
        layer.setStyle({
          weight: mapStore.showGeoJSONBorders ? 2 : 0,
          color: "#007FFF",
          fill: true,
          fillColor: getBarangayColor(barangayName),
          fillOpacity: mapStore.showGeoJSONBorders ? 0.2 : 0,
        });
      },
    })
    .addTo(map);
}

  // updateHeatmap();
});


const getBarangayColor = (barangayName) => {
  const safeName = (name) => (typeof name === "string" ? name.trim().toLowerCase() : "");
  const barangayData = groupedReportsByBarangay.value.find(
    (b) => safeName(b.name) === safeName(barangayName)
  );
  

  if (!barangayData) return "#cccccc"; // default gray if no data

  const totalReports = barangayData.totalReports || 0;

  const reportsArray = groupedReportsByBarangay.value.map((b) => b.totalReports);
  const minReports = Math.min(...reportsArray);
  const maxReports = Math.max(...reportsArray);

  const normalized =
    maxReports !== minReports
      ? (totalReports - minReports) / (maxReports - minReports)
      : 0.5;

  const hue = 120 - normalized * 120; // green (120) to red (0)
  return `hsl(${hue}, 100%, 50%)`;
};


//For the markers of each barangay setting the color and sizes
let markers = []; // Store markers for clearing later

const addBarangayMarkers = () => {
  // console.log("🟢 Running addBarangayMarkers...");
  
  if (!map || groupedReportsByBarangay.value.length === 0) {
    // console.warn("⚠️ No grouped reports available for markers.");
    return;
  }

  // console.log("📊 Total Barangays to Process:", groupedReportsByBarangay.value.length);

  // Remove old markers
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  const reportsArray = groupedReportsByBarangay.value.map((b) => b.totalReports);
  const minReports = Math.min(...reportsArray);
  const maxReports = Math.max(...reportsArray);

  groupedReportsByBarangay.value.forEach((barangay) => {
    // console.log(
    //   `📍 Processing Barangay: ${barangay.name}, Lat: ${barangay.latitude}, Lng: ${barangay.longitude}`
    // );

    if (!barangay.latitude || !barangay.longitude) {
      // console.warn(`⚠️ Skipping ${barangay.name}: Missing coordinates`);
      return;
    }

    const totalReports = barangay.totalReports || 0;

    // Avoid division by zero if minReports === maxReports
    const normalized = maxReports !== minReports
      ? (totalReports - minReports) / (maxReports - minReports)
      : 0.5; // Default to mid-value if all reports are the same

    const markerSize = 15 + normalized * 20; // Size varies from 15px to 30px
    const hue = 120 - normalized * 120; // From green (120) to red (0)
    const markerColor = normalized <= 0.5 
      ? `hsl(${120 - normalized * 120}, 100%, 50%)` // Green to orange
      : `hsl(${60 - (normalized - 0.5) * 120}, 100%, 50%)`; // Orange to red

    const marker = leaflet
      .marker([barangay.latitude, barangay.longitude], {
        icon: leaflet.divIcon({
          className: "custom-marker",
          html: `<div style="width: ${markerSize}px; height: ${markerSize}px; background-color: ${markerColor}; border-radius: 50%; opacity: 0.7; border: 1px solid black;"></div>`,
        }),
      })
      .addTo(map)
      .bindPopup(`<strong>${barangay.name}</strong><br>Total Reports: ${totalReports}`);

    markers.push(marker);
  });

  // console.log("✅ Markers added successfully.");
};


// 🏁 Run when component is mounted
onMounted(() => {
  databaseStore.fetchData().then(() => {
    // console.log("🔄 Data fetched, adding markers...");
    addBarangayMarkers();
  });
});

// 🔄 Refresh markers when grouped reports change
watch(groupedReportsByBarangay, () => {
  // console.log("🟡 Detected change in barangay reports, refreshing markers...");
  addBarangayMarkers();
}, { deep: true });

watch(groupedReportsByBarangay, () => {
  if (geojsonLayer.value) {
    geojsonLayer.value.eachLayer((layer) => {
      const barangayName = layer.feature.properties.adm4_en;
      layer.setStyle({
        fillColor: getBarangayColor(barangayName),
      });
    });
  }
}, { deep: true });


// ✅ Mount Vue Component in the Leaflet Control
onMounted(() => {
  createApp({
    render: () =>
      h(DateRangePicker, {
        class: "max-w-xs",
        onDateRangeSelected: (range) => updateDateRange(range), // Capture selected range
      }),
  }).mount("#date-picker-container");
});

// for toggling the border button
watch(
  () => mapStore.showGeoJSONBorders,
  () => {
    updateGeoJSONStyles(); 
  }
);
//for border fill color effect
watchEffect(() => {
  if (
    geojsonLayer.value &&
    mapData &&
    mapData.features &&
    groupedReportsByBarangay.value.length > 0
  ) {
    updateGeoJSONStyles();
  }
});

const updateGeoJSONStyles = () => {
  if (geojsonLayer.value) {
    geojsonLayer.value.eachLayer((layer) => {
      const barangayName =
        layer.feature?.properties?.adm4_en || layer.feature?.properties?.name;

      layer.setStyle({
        weight: mapStore.showGeoJSONBorders ? 2 : 0,
        color: mapStore.showGeoJSONBorders ? "#007FFF" : "",
        fillOpacity: mapStore.showGeoJSONBorders ? 0.2 : 0,
        fillColor: mapStore.showGeoJSONBorders
          ? getBarangayColor(barangayName)
          : "",
      });
    });
  }
};

import domtoimage from 'dom-to-image';

// Refs
const captureTarget = ref(null);
const exportedImageUrl = ref(null);

// Capture the map area as an image
const exportAsImage = () => {
  if (!captureTarget.value) return;

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  // const filename = `Map-Capture-${timestamp}.png`;

  // 👇 Target the dropdown wrapper and zoom controls
  const dropdownEl = document.querySelector(".dropdown");
  const zoomControlEl = document.querySelector(".leaflet-control-zoom");

  // Temporarily hide the dropdown
  if (dropdownEl) dropdownEl.style.display = "none";
  if (zoomControlEl) zoomControlEl.style.display = "none";

  domtoimage.toPng(captureTarget.value)
    .then((dataUrl) => {
      // Save the data URL for preview
      exportedImageUrl.value = dataUrl;
    })
    .catch((error) => {
      console.error('Error capturing image!', error);
    })
    .finally(() => {
      if (dropdownEl) dropdownEl.style.display = ""; // Show it again
      if (zoomControlEl) zoomControlEl.style.display = "";
    });
};

// Capture the image when the button is clicked
const captureImage = () => {
  exportAsImage();
};

// Remove the captured image
const removeImage = (event) => {
  event.stopPropagation();  // Prevent the button click from firing
  exportedImageUrl.value = null;
};

// Download the captured image
const downloadImage = () => {
  if (!exportedImageUrl.value) return;

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const filename = `Map-Capture-${timestamp}.png`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = exportedImageUrl.value;
  link.click();
};

// Generate PDF with the captured image
const generatePdf = () => {
  if (!exportedImageUrl.value) return;

  const printWindow = window.open('', '_blank', 'width=800,height=600');

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Map as PDF</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          img {
            max-width: 100%;
            max-height: 100%;
          }
        </style>
      </head>
      <body>
        <h1>Captured Map</h1>
        <img src="${exportedImageUrl.value}" />
      </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for the content to load before printing
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };
};

const showExportMenu = ref(false)

// Toggle the dropdown
function toggleExportMenu() {
  showExportMenu.value = !showExportMenu.value
}

// Optional: Close dropdown if clicked outside
const dropdownRef = ref(null)

// onClickOutside(dropdownRef, () => {
//   showExportMenu.value = false
// })

const minimized = ref(false);
const toggleMinimize = () => {
  minimized.value = !minimized.value;
  // console.log(minimized.value);
};
</script>
<template>
  <!-- <div class="h-full w-full">
    <div id="map-wrapper">
      <div id="map" class="z-10"></div>
    </div>
  </div> --><!-- Button to trigger image export -->
  <!-- Button to trigger image capture -->
  

  <!-- Export Preview Drawer -->
<div v-if="exportedImageUrl">
  <!-- Drawer Content -->
  <div v-if="!minimized"
    class="fixed bottom-0 right-0 z-50 w-96 m-5 rounded bg-white dark:bg-gray-900 p-6 shadow-xl">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">Export Preview</h3>
      <div class="flex gap-2">
        <button @click="toggleMinimize" class="text-gray-500 hover:text-gray-700 font-bold">—</button>
        <button @click="removeImage" class="text-red-500 hover:text-red-700 font-bold">✕</button>
      </div>
    </div>

    <div class="h-30">
      <div class="flex flex-row space-x-4 overflow-x-auto scrollbar-thin">
        <div class="relative flex-shrink-0">
          <img 
            :src="exportedImageUrl" 
            alt="Captured Map" 
            class="w-24 h-24 object-cover rounded-md"
          />
          <button @click="downloadImage"
            class="absolute top-0 right-0 text-white p-1 rounded-full text-xs hover:bg-gray-800 transition-all">⬇</button>
          <button @click="removeImage"
            class="absolute top-0 left-0 text-red-500 font-bold p-1 rounded-full text-xs hover:text-red-700 hover:font-black transition-all">✕</button>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="mt-6 flex gap-4 text-sm">
      <button @click="downloadImage"
        class="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition duration-200">
        Download Image
      </button>
      <button @click="generatePdf"
        class="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition duration-200">
        Save as PDF
      </button>
      <button @click="removeImage"
        class="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition duration-200">
        Clear Export
      </button>
    </div>
  </div>

  <!-- Minimized Toggle Button -->
  <div class="fixed end-6 bottom-6 group z-30">
    <button v-if="minimized" @click="toggleMinimize" type="button"
      class="flex items-center justify-center text-white bg-teal-700 rounded-lg w-14 h-14 hover:bg-teal-800">
      <span class="material-icons">output</span>
      <span class="sr-only">Open Export Preview</span>
    </button>
  </div>
</div>



  <!-- Map wrapper -->
  <div class="w-full h-[580px] sm:h-[400px] md:h-[640px] lg:h-full">
  <div id="map-wrapper" ref="captureTarget" class="w-full h-full">
    <div id="map" class="z-10"></div>
  </div>
</div>
</template>

<style scoped>
/* Ensure wrapper has no filter */
#map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  filter: none;
}

/* Ensure the map itself fills the space */
#map {
  height: 100%;
  width: 100%;
}

/* Prevent black background flickering */
.leaflet-container {
  background: #000 !important;
}

/* Dark Mode - Applied Dynamically */
#map-wrapper.dark-mode ::v-deep(.leaflet-tile-pane) {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}

/* Prevent markers, popups, and UI from inverting */
#map-wrapper.dark-mode ::v-deep(.leaflet-marker-icon),
#map-wrapper.dark-mode ::v-deep(.leaflet-popup),
#map-wrapper.dark-mode ::v-deep(.leaflet-control),
#map-wrapper.dark-mode ::v-deep(.leaflet-bar a) {
  filter: none !important;
}

/* Tailwind-compatible custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(100, 116, 139, 0.6);
  border-radius: 3px;
}
</style>
