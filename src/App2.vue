<template>
  <div id="map" />

  <div v-if="loading" class="loading-wrapper">
    <div class="loading">
      <div class="loading-spinner" />

      <div class="loading-text">
        <p class="text-title">Loading...</p>
        <p class="text-description">Please wait.</p>
      </div>
    </div>
  </div>

  <router-view v-else :map="map" />
</template>

<script setup lang="ts">
import { onMounted, ref, provide } from "vue";

import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// @ts-expect-error - MapboxDirections does not provide types
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import locations from "./locations";

const TOKEN =
  "pk.eyJ1IjoibWF0aGh1bGsiLCJhIjoiY2t6bTFhcDU2M2prOTJwa3VwcTJ2d2dpMiJ9.WEJWEP_qrKGXkYOgbIsaGg";

mapboxgl.accessToken = TOKEN;

const map = ref<Map>();
const directions = ref<MapboxDirections>();
const loading = ref(true);

// @ts-expect-error - MapboxDirections does not provide types
const handleRoute = ({ route }) => {
  if (!map.value || !directions.value) return;

  console.log(route);

  for (let index = 0; index < route[0].legs.length; index++) {
    const { steps } = route[0].legs[index];

    const start = document.createElement("div");
    start.className = "marker";
    start.textContent = (index + 1).toLocaleString();

    new mapboxgl.Marker({
      color: "blue",
    })
      .setLngLat(steps[0].maneuver.location)
      .addTo(map.value);

    if (index !== route[0].legs.length - 1) continue;

    new mapboxgl.Marker({
      color: "blue",
    })
      .setLngLat(steps[steps.length - 1].maneuver.location)
      .addTo(map.value);
  }

  map.value.jumpTo({ center: [-122.2592173, 37.8721508] });

  // Remove unnecessary layers
  map.value.removeLayer("directions-route-line");
  map.value.removeLayer("directions-waypoint-point-casing");
  map.value.removeLayer("directions-waypoint-point");
  map.value.removeLayer("directions-origin-point");
  map.value.removeLayer("directions-destination-point");
  map.value.removeLayer("directions-origin-label");
  map.value.removeLayer("directions-destination-label");

  loading.value = false;
};

const handleLoad = () => {
  if (!map.value) return;

  directions.value = new MapboxDirections({
    styles: [
      {
        id: "directions-route-line-casing",
        type: "line",
        source: "directions",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 4,
        },
        filter: [
          "all",
          ["in", "$type", "LineString"],
          ["in", "route", "selected"],
        ],
      },
    ],
    accessToken: TOKEN,
    unit: "imperial",
    profile: "mapbox/driving",
    controls: {
      inputs: false,
      instructions: false,
      profileSwitcher: false,
    },
    interactive: false,
    instructions: false,
  });

  map.value.addControl(directions.value);

  directions.value.on("route", handleRoute);

  directions.value.setOrigin(locations[0].location.center);

  directions.value.setDestination(
    locations[locations.length - 1].location.center
  );

  for (let index = 1; index < locations.length - 1; index++) {
    directions.value.addWaypoint(index, locations[index].location.center);
  }
};

const initialize = () => {
  map.value = new Map({
    container: "map",
    style: "mapbox://styles/mathhulk/clbznbvgs000314k8gtwa9q60",
    attributionControl: false,
  });

  map.value.on("load", handleLoad);
};

onMounted(() => initialize());

provide("map", map);
provide("directions", directions);
</script>

<style lang="scss">
#map {
  height: 100vh;
  width: 100vw;
}

a {
  text-decoration: none;
}

// Disable Mapbox attribution
.mapboxgl-ctrl a.mapboxgl-ctrl-logo {
  display: none;
}

body {
  font-family: "Inter", sans-serif;
}

.loading-wrapper {
  position: fixed;

  z-index: 400;

  height: 100%;
  width: 100%;

  left: 0;
  top: 0;

  background: #ece1cb;

  @media (max-width: 992px) {
    padding-right: 24px;
    padding-left: 24px;
  }
}

.loading-wrapper {
  display: flex;
  align-items: center;

  .loading {
    display: flex;

    @media (min-width: 992px) {
      margin-left: 25%;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }

      25% {
        transform: rotate(120deg);
      }

      75% {
        transform: rotate(240deg);
      }

      100% {
        transform: rotate(360deg);
      }
    }

    .loading-text {
      line-height: 1;

      margin-left: 16px;

      .text-title {
        font-size: 16px;
        font-weight: 500;

        margin-bottom: 4px;
      }

      .text-description {
        font-size: 12px;
        color: rgba(black, 0.5);
      }
    }

    .loading-spinner {
      height: 32px;
      width: 32px;

      border-radius: 4px;

      display: grid;
      place-items: center;

      background-color: black;

      &::before {
        content: "";

        height: 16px;
        width: 16px;

        border-radius: 50%;

        border-style: solid;
        border-width: 2px;
        border-color: transparent white white white;

        animation: spin 500ms linear infinite;
      }
    }
  }
}
</style>
