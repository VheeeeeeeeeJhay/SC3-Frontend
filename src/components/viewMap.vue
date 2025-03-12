<script setup>
import { ref, onMounted, watch } from "vue";
import axiosClient from "../axios";
import leaflet from "leaflet";
import "leaflet.heat";
import { useGeolocation } from "@vueuse/core";
import { useMapStore } from "../stores/mapStore";

// **Props**
const props = defineProps({
  viewID: Number,
});

const viewId = ref(props.viewID);
const barangay_name = ref("");
const barangay_lat = ref(0);
const barangay_long = ref(0);
const data = ref({ name: "", longitude: "", latitude: "" });

// ✅ Fetch Barangay Data
const fetchData = () => {
  axiosClient
    .get(`/api/911/barangay-edit/${viewId.value}`, {
      headers: { "x-api-key": import.meta.env.VITE_API_KEY },
    })
    .then((res) => {
      data.value = { ...res.data };
      barangay_lat.value = data.value.latitude;
      barangay_long.value = data.value.longitude;
      barangay_name.value = data.value.name;

      console.log("Barangay:", barangay_name.value);
      console.log("Latitude:", barangay_lat.value, "Longitude:", barangay_long.value);

      fetchReports();
      addGeoJSONLayer();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

// **Import GeoJSON Data**
import mapData from "../assets/map.json";

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

      console.log(`Filtered Reports for '${barangay_name.value}':`, reports.value);

      updateHeatmap();
    })
    .catch((error) => console.error("Error fetching reports:", error));
};

// ✅ **Initialize Map**
onMounted(() => {
  fetchData();

  map = leaflet
    .map("map")
    .setView([16.404, 120.599], 13)
    .addLayer(
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
    );

  // ✅ **Heatmap Layer**
  heatmapLayer.value = leaflet.heatLayer([], {
    radius: 15,
    blur: 20,
    maxZoom: 12,
    minOpacity: 0.5,
    gradient: {
      0.2: "blue",
      0.4: "green",
      0.6: "yellow",
      0.8: "orange",
      1.0: "red",
    },
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
        popupContent += `<strong>Date:</strong> ${matchingReport.date || "Unknown"} <br>`;
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
    (feature) => feature.properties.adm4_en === barangay_name.value
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

    const maskPolygon = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [180, 90], [180, -90], [-180, -90], [-180, 90], [180, 90],
              ],
              ...filteredFeatures.flatMap((feature) => feature.geometry.coordinates),
            ],
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
  <div class="min-h-screen">
    <h1 class="text-2xl font-bold dark:text-white">Heatmap of Incidents/Cases</h1>
    <div id="map"></div>
  </div>
</template>

<style scoped>
#map {
  height: 70vh;
  width: 100%;
}
</style>
