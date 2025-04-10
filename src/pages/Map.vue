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
import mapData from "../assets/map.json"; // Adjust the path as needed
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
    reports: "reportsList",
};

const {
    reports,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

// Access Pinia store for GeoJSON border visibility
const mapStore = useMapStore();
const errors = ref("");

// const fetchData = async () => {
//   try {
//     const response = await axiosClient.get("/api/911/report-display", {
//       headers: {
//         "x-api-key": import.meta.env.VITE_API_KEY,
//       },
//     });
//     reports.value = response.data[0] || []; // Ensure reports is an array even if empty
//     console.log("Fetched Reports:", reports.value);

//     // Check if reports have latitude/longitude
//     reports.value.forEach((report) => {
//       if (!report.barangay.latitude || !report.barangay.longitude) {
//         console.warn(`Report missing lat/long: ${JSON.stringify(report)}`);
//       }
//     });

//     // updateHeatmap();
//   } catch (error) {
//     console.error("Error fetching reports:", error);
//     errors.value = error.response.data.error;
//   }
// };

// onMounted(() => {
//   fetchData();
// });

const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const endDate = ref(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
console.log("Start Date:", startDate.value);
console.log("End Date:", endDate.value);
const updateDateRange = ({ start, end }) => {
  startDate.value = start;
  endDate.value = end;
  console.log("📅 Date range updated:", start, "to", end);

  addBarangayMarkers(); // Refresh markers based on the new date range
};

watch([startDate, endDate], () => {
  addBarangayMarkers();
  console.log("nacall naman date range");
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

  // ✅ Custom Control for Dropdown with Dark Mode and Borders Toggle
const dropdownControl = leaflet.control({ position: "topleft" });

dropdownControl.onAdd = function () {
  const div = leaflet.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");

  // Create the dropdown container
  div.innerHTML = `
    <div class="dropdown">
      <button class="dropbtn">⚙️</button>
      <div class="dropdown-content">
        <button id="darkModeToggleBtn" class="dark-mode-toggle">🌙 Dark Mode</button>
        <button id="toggleBordersBtn" class="border-toggle-btn">🥷Borders</button>
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

  return div;
};

dropdownControl.addTo(map);

  /// ✅ Check the dark mode state on page load
  const checkDarkMode = () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    // If dark mode is enabled, apply it
    if (isDarkMode) {
      document.querySelector("#map-wrapper").classList.add("dark-mode");
      document.getElementById("darkModeToggleBtn").innerHTML = "☀️ Light Mode";
    } else {
      document.querySelector("#map-wrapper").classList.remove("dark-mode");
      document.getElementById("darkModeToggleBtn").innerHTML = "🌙 Dark Mode";
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
    const toggleDarkMode = () => {
      const mapContainer = document.querySelector("#map-wrapper");
      const isDarkMode = mapContainer.classList.toggle("dark-mode");

      // Save dark mode state to localStorage
      localStorage.setItem('darkMode', isDarkMode);
      // Change button text dynamically
      const button = document.getElementById("darkModeToggleBtn");
      button.innerHTML = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
    };

  
      // // ✅ Add Custom Control for Toggle Button
      // const toggleControl = leaflet.control({ position: "topleft" });

      // toggleControl.onAdd = function () {
      //   const div = leaflet.DomUtil.create(
      //     "div",
      //     "leaflet-bar leaflet-control leaflet-control-custom leaflet-left"
      //   );
      //   div.innerHTML = `<button id="toggleBordersBtn" class="border-toggle-btn">Borders</button>`;

      //   div.onclick = () => {
      //     mapStore.showGeoJSONBorders = !mapStore.showGeoJSONBorders; // Toggle the state
      //   };

      //   return div;
      // };

      // toggleControl.addTo(map);

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
  const legendControl = leaflet.control({ position: "bottomleft" });

  legendControl.onAdd = function () {
    const div = leaflet.DomUtil.create("div", "legend leaflet-control");
    const reportsArray = groupedReportsByBarangay.value
      .map((b) => b.totalReports)
      .filter((r) => !isNaN(r) && r !== undefined); // Ensure only valid numbers

    const minReports = reportsArray.length ? Math.min(...reportsArray) : 1;
    const maxReports = reportsArray.length ? Math.max(...reportsArray) : 10;

    // Define legend steps (Low, Medium, High)
    const legendSteps = [
      { label: "Low", reports: minReports },
      { label: "Medium", reports: Math.round((minReports + maxReports) / 2) },
      { label: "High", reports: maxReports },
    ];

    // Generate legend dynamically based on marker size & color logic
    let legendHTML = `<h4>Incident Reports</h4>`;

    legendSteps.forEach((step) => {
      const normalized =
        (step.reports - minReports) / (maxReports - minReports);
      const markerSize = 10 + normalized * 20; // Match marker size logic
      const hue = normalized <= 0.5 
        ? 120 - normalized * 120 // Green to orange (120 to 60)
        : 60 - (normalized - 0.5) * 120; // Orange to red (60 to 0)
      const markerColor = `hsl(${hue}, 100%, 50%)`;

      legendHTML += `
      <div class="legend-item">
        <span class="legend-circle" style="background: ${markerColor}; width: ${markerSize}px; height: ${markerSize}px;"></span>
        <span>${step.label}</span>
      </div>
    `;
    });

    div.innerHTML = legendHTML;
    return div;
  };

  legendControl.addTo(map);

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
      margin: 5px 0;
    }

    .legend-circle {
      border-radius: 50%;
      margin-right: 8px;
      display: inline-block;
      border: 1px solid #666;
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

//For the markers of each barangay setting the color and sizes
let markers = []; // Store markers for clearing later

const addBarangayMarkers = () => {
  console.log("🟢 Running addBarangayMarkers...");
  
  if (!map || groupedReportsByBarangay.value.length === 0) {
    console.warn("⚠️ No grouped reports available for markers.");
    return;
  }

  console.log("📊 Total Barangays to Process:", groupedReportsByBarangay.value.length);

  // Remove old markers
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  const reportsArray = groupedReportsByBarangay.value.map((b) => b.totalReports);
  const minReports = Math.min(...reportsArray);
  const maxReports = Math.max(...reportsArray);

  groupedReportsByBarangay.value.forEach((barangay) => {
    console.log(
      `📍 Processing Barangay: ${barangay.name}, Lat: ${barangay.latitude}, Lng: ${barangay.longitude}`
    );

    if (!barangay.latitude || !barangay.longitude) {
      console.warn(`⚠️ Skipping ${barangay.name}: Missing coordinates`);
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

  console.log("✅ Markers added successfully.");
};


// onMounted(() => {
//   fetchData().then(() => {
//     addBarangayMarkers(); // ✅ Add markers after fetching data
//   });
// });
// 🏁 Run when component is mounted
onMounted(() => {
  databaseStore.fetchData().then(() => {
    console.log("🔄 Data fetched, adding markers...");
    addBarangayMarkers();
  });
});
// 🔄 Refresh markers when grouped reports change
watch(groupedReportsByBarangay, () => {
  console.log("🟡 Detected change in barangay reports, refreshing markers...");
  addBarangayMarkers();
}, { deep: true });

// watchEffect(() => {
//   if (reports.value.length > 0) {
//     addBarangayMarkers(); // ✅ Refresh markers when data changes
//   }
// });

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

import domtoimage from 'dom-to-image';

// Refs
const captureTarget = ref(null);
const exportedImageUrl = ref(null);

// Capture the map area as an image
const exportAsImage = () => {
  if (!captureTarget.value) return;

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const filename = `Map-Capture-${timestamp}.png`;

  domtoimage.toPng(captureTarget.value)
    .then((dataUrl) => {
      // Save the data URL for preview
      exportedImageUrl.value = dataUrl;
    })
    .catch((error) => {
      console.error('Error capturing image!', error);
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
</script>
<template>
  <!-- <div class="h-full w-full">
    <div id="map-wrapper">
      <div id="map" class="z-10"></div>
    </div>
  </div> --><!-- Button to trigger image export -->
  <!-- Button to trigger image capture -->
  <button 
    v-if="!exportedImageUrl" 
    @click="captureImage" 
    class="bg-blue-500 text-white p-4 rounded hover:bg-blue-600 transition duration-300 w-full relative"
  >
    Capture Map
  </button>

  <!-- Button with image preview and close icon inside -->
  <button 
    v-if="exportedImageUrl" 
    @click="captureImage" 
    class="bg-blue-500 text-white p-4 rounded hover:bg-blue-600 transition duration-300 relative"
  >
    <!-- Image preview -->
    <div class="flex items-center justify-center">
      <!-- Image with fixed width and height of 150px -->
      <img 
        :src="exportedImageUrl" 
        alt="Captured Map" 
        class="w-36 h-36 object-cover rounded-md"
      />
      <!-- Close button inside the image -->
      <div 
        class="absolute top-0 right-0 text-white text-3xl cursor-pointer bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-500 transition duration-200"
        @click="removeImage"
      >
        &times;
      </div>
    </div>
  </button>

  <!-- Buttons for download and PDF generation -->
  <div v-if="exportedImageUrl" class="mt-4 text-center">
    <button 
      @click="downloadImage" 
      class="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300 mx-2"
    >
      Download Image
    </button>
    <button 
      @click="generatePdf" 
      class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300 mx-2"
    >
      Generate PDF
    </button> 
  </div>

  <!-- Map wrapper -->
  <div class="h-full w-full mt-6">
    <div id="map-wrapper" ref="captureTarget">
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
</style>
