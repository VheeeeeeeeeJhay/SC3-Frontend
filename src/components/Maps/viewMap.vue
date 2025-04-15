<script setup>
import { ref, onMounted, watch } from "vue";
import axiosClient from "../../axios";
import leaflet from "leaflet";
import "leaflet.heat";
import { useGeolocation } from "@vueuse/core";
import { useMapStore } from "../../stores/mapStore";

// **Props**
const props = defineProps({
  viewID: Number,
  reportLat: Number,
  reportLong: Number,
});

console.log("📦 Props:", props.reportLat);
const viewId = ref(props.viewID);
const barangay_name = ref("");
const barangay_lat = ref(props.reportLat || 0);
const barangay_long = ref(props.reportLong || 0);
const marker = ref(null);
const data = ref({ name: "", longitude: 0, latitude: 0 });

// ✅ Fetch Barangay Data
const fetchData = () => {
  if (!viewId.value) return;
  axiosClient
    .get(`/api/911/barangay-edit/${viewId.value}`, {
      headers: { "x-api-key": import.meta.env.VITE_API_KEY },
    })
    .then((res) => {
      data.value = { ...res.data };
      barangay_lat.value = data.value.latitude;
      barangay_long.value = data.value.longitude;
      barangay_name.value = data.value.name;

      fetchReports();
      addGeoJSONLayer();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

// **Import GeoJSON Data**
import mapData from "../../assets/updated-map.json";

const { coords } = useGeolocation();
const reports = ref([]);
const heatmapLayer = ref(null);
const geojsonLayer = ref(null);
const maskLayer = ref(null);
let map = null;
const heatmapPoints = ref([]);
const mapStore = useMapStore();
let persistentPopup = null; // ✅ Store reference for persistent popups

// ✅ **Fetch Reports (Filtered by Barangay)**
const fetchReports = () => {
  axiosClient
    .get("/api/911/report-display", {
      headers: { "x-api-key": import.meta.env.VITE_API_KEY },
    })
    .then((res) => {
      const allReports = res.data[0] || [];

      // ✅ Filter reports by barangay name
      reports.value = allReports.filter(
        (report) => report.barangay?.name === barangay_name.value
      );

      console.log(`Filtered Reports for '${barangay_name.value}':`, reports.value); //2 

      updateHeatmap();
    })
    .catch((error) => console.error("Error fetching reports:", error));
};

// ✅ **Initialize Map**
onMounted(() => {
  fetchData();

  map = leaflet
    .map("map")
    .setView([16.404, 120.599], 13) // Default view
    .addLayer(
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
    );
    const bounds = leaflet.latLngBounds(
    [16.350, 120.520], // Southwest (bottom-left)
    [16.480, 120.660]  // Northeast (top-right) 
  );
  map.setMaxBounds(bounds);
  map.setMinZoom(12);


//for marker in reports
    if (barangay_lat.value !== 0 && barangay_long.value !== 0) {
      console.log("📍 Initial marker:", barangay_lat.value, barangay_long.value);
      map.setView([barangay_lat.value, barangay_long.value], 16);

      // ✅ Only add a marker if there is NO `viewID`
      if (!viewId.value) {
        console.log("📍 Adding marker...", viewId);
        addMarker(barangay_lat.value, barangay_long.value);
      }
    }

  watch([barangay_lat, barangay_long], ([lat, lng]) => {
  if (lat !== 0 && lng !== 0) {
    console.log("📌 Updating marker position:", lat, lng);
    map.setView([lat, lng], 16);
    if (!viewId.value) {
        console.log("📍 Adding marker...", viewId);
        addMarker(barangay_lat.value, barangay_long.value);
      }
  }
});

  if (mapData && mapData.center && mapData.zoom) {
    map.setView(mapData.center, mapData.zoom);
  }
  // ✅ **Heatmap Layer**
  heatmapLayer.value = leaflet.heatLayer([], {
    radius: 15,
    blur: 20,
    maxZoom: 12,
    minOpacity: 0.5,
    gradient: { 0.2: "blue", 0.4: "green", 0.6: "yellow", 0.8: "orange", 1.0: "red" },
  }).addTo(map);

  // ✅ Add Click Event for Heatmap Popups
  map.on("click", (event) => {
    const { lat, lng } = event.latlng;

    let closestPoint = null;
    let minDistance = Infinity;

    // ✅ Find the closest heatmap point
    heatmapPoints.value.forEach((point) => {
      const distance = map.distance([lat, lng], [point[0], point[1]]);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = { lat: point[0], lng: point[1] };
      }
    });

    // ✅ If a close point is found within 50 meters, show popup
    if (closestPoint && minDistance < 50) {
      const matchingReport = reports.value.find(
        (report) =>
          report.latitude === closestPoint.lat &&
          report.longitude === closestPoint.lng
      );

      let popupContent = "<strong>Reported Case</strong><br>";

      if (matchingReport) {
        popupContent += `<strong>Type:</strong> ${matchingReport.incident?.type || "Unknown"} <br>`;
        popupContent += `<strong>Landmark:</strong> ${matchingReport.landmark || "N/A"} <br>`;
        popupContent += `<strong>Reported By:</strong> ${matchingReport.name || "Anonymous"} <br>`;
        popupContent += `<strong>Date:</strong> ${matchingReport.date_received || "Unknown"} <br>`;
      } else {
        popupContent += "No details available.";
      }

      // ✅ Close the previous persistent popup
      if (persistentPopup) {
        map.closePopup(persistentPopup);
      }

      // ✅ Create new persistent popup
      persistentPopup = leaflet
        .popup()
        .setLatLng([closestPoint.lat, closestPoint.lng])
        .setContent(popupContent)
        .openOn(map);
    }
  });
});

const addMarker = (lat, lng) => {
  if (!map) return; // Ensure the map is initialized

  // Remove existing marker if it exists
  if (marker.value) {
    map.removeLayer(marker.value);
  }

  // Create a new marker
  marker.value = leaflet.marker([lat, lng])
    .addTo(map)
    .bindPopup(`📍 Reported Location: (${lat}, ${lng})`)
    .openPopup();
};


// ✅ **Update Heatmap with Data**
const updateHeatmap = () => {
  if (!map || !heatmapLayer.value) return;

  heatmapPoints.value = reports.value
    .filter((r) => r.latitude && r.longitude)
    .map((r) => [r.latitude, r.longitude, 1]);

  if (heatmapPoints.value.length === 0) {
    console.warn("❌ No valid report locations found!");
  } else {
    console.log("✅ Updating heatmap with points:", heatmapPoints.value);
  }

  heatmapLayer.value.setLatLngs(heatmapPoints.value);
};

// ✅ **Function to Add Barangay Border + Dark Outside Effect**
const addGeoJSONLayer = () => {
  if (!map || !mapData.features || !barangay_name.value) return;

  const filteredFeatures = mapData.features.filter(
    (feature) => feature.properties.name === barangay_name.value
  );

  console.log(`Filtered GeoJSON for '${barangay_name.value}':`, filteredFeatures);

  if (geojsonLayer.value) map.removeLayer(geojsonLayer.value);
  if (maskLayer.value) map.removeLayer(maskLayer.value);

  if (filteredFeatures.length > 0) {
    geojsonLayer.value = leaflet.geoJSON(
      { type: "FeatureCollection", features: filteredFeatures },
      {
        style: {
          weight: mapStore.showGeoJSONBorders ? 2 : 0,
          color: "#007FFF",
          fillOpacity: 0,
        },
      }
    ).addTo(map);

    const outer = [
  [180, 90], [180, -90], [-180, -90], [-180, 90], [180, 90]
];

const innerRings = filteredFeatures
  .map((feature) => {
    const coords = feature.geometry.coordinates;
    if (feature.geometry.type === "LineString") {
      const flatCoords = coords.map(coord => [coord[0], coord[1]]);
      // Ensure the ring is closed
      if (
        flatCoords.length > 2 &&
        (flatCoords[0][0] !== flatCoords[flatCoords.length - 1][0] ||
         flatCoords[0][1] !== flatCoords[flatCoords.length - 1][1])
      ) {
        flatCoords.push(flatCoords[0]);
      }
      return flatCoords;
    }
    return null;
  })
  .filter(ring => ring); // remove nulls

const maskPolygon = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [outer, ...innerRings],
      },
    },
  ],
};


    maskLayer.value = leaflet.geoJSON(maskPolygon, {
      style: {
        color: "black",
        weight: 0,
        fillColor: "black",
        fillOpacity: 0.6,
      },
    }).addTo(map);
  }
};

watch(barangay_name, () => {
  fetchReports();
  addGeoJSONLayer();
});
</script>

<template>
  <!-- <div class="min-h-screen"> -->
    <div id="map" class="z-10 rounded-lg"></div>
  <!-- </div> -->
</template>

<style scoped>
#map {
  height: 50vh;
  width: 100%;
}
</style>
