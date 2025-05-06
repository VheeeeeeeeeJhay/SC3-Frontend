<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from "vue";
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
    .get(`/api/911/barangay-fetch/${viewId.value}`, {
      headers: { "x-api-key": import.meta.env.VITE_API_KEY },
    })
    .then((res) => {
      data.value = { ...res.data };
      barangay_lat.value = data.value.latitude;
      barangay_long.value = data.value.longitude;
      barangay_name.value = data.value.name;
      console.log("📍 Barangay marker:", barangay_lat.value, barangay_long.value);

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
      const reportCount = reports.value.length;
      console.log("📦 Reports Count:", reportCount);

      console.log(`Filtered Reports for '${barangay_name.value}':`, reports.value); //2 

      // ✅ Call marker update with lat/lng/name/count
      updateBarangayMarkers(
        barangay_lat.value,
        barangay_long.value,
        barangay_name.value,
        reportCount
      );
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
  if (viewId.value) {
 
    const lat = data.value.latitude;
    const lng = data.value.longitude;
    // const name = barangay.name;
    console.log("📍 Barangay marker:", lat, lng);
}
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
    .bindPopup(`📍 Reported Location: (${lat}, ${lng})`) //view map for view report
    .openPopup();
};


// const barangayMarkers = ref([]);
// const barangayID = ref(props.viewID);

const updateBarangayMarkers = (lat, lng, name, count) => {
  if (!map) return;

  // Remove old marker if it exists
  if (marker.value) {
    map.removeLayer(marker.value);
  }

  // Use a Leaflet circleMarker with fixed blue color
  marker.value = leaflet
    .circleMarker([lat, lng], {
      radius: 12,
      color: '#fff', // white border
      weight: 3,
      fillColor: '#007FFF', // blue fill
      fillOpacity: 0.8,
    })
    .addTo(map)
    .bindPopup(`
      <strong>Barangay:</strong> ${name}<br/>
      <strong>Total Reports:</strong> ${count}
    `);

  // Manually set the popup's anchor point
  marker.value.on('popupopen', () => {
    const popup = marker.value.getPopup();
    const offset = leaflet.point(0, -15); // 15px above marker
    popup.setLatLng(marker.value.getLatLng()).setOffset(offset);
  });

  // Open the popup immediately
  marker.value.openPopup();
};






// ✅ **Function to Add Barangay Border + Dark Outside Effect**
const addGeoJSONLayer = () => {
  if (!map || !mapData.features || !barangay_name.value) return;

  const filteredFeatures = mapData.features.filter(
    (feature) => feature.properties.name.toUpperCase() === barangay_name.value.toUpperCase()
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
