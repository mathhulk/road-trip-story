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
import mapboxgl, { Map } from "mapbox-gl";
import { onMounted, ref, provide } from "vue";
import locations from "./locations";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWF0aGh1bGsiLCJhIjoiY2t6bTFhcDU2M2prOTJwa3VwcTJ2d2dpMiJ9.WEJWEP_qrKGXkYOgbIsaGg";

const map = ref<Map>();
const loading = ref(true);

const initialize = () => {
  map.value = new Map({
    container: "map",
    style: "mapbox://styles/mathhulk/clbznbvgs000314k8gtwa9q60",
    attributionControl: false,
  });

  map.value.on("load", () => {
    loading.value = false;

    const directions = new MapboxDirections({
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
        profile: "mapbox/walking",
        controls: {
          inputs: false,
          instructions: false,
          profileSwitcher: false,
        },
        interactive: false,
        instructions: false,
      });

      map.addControl(directions);

      // @ts-expect-error - MapboxDirections does not provide types
      directions.on("route", ({ route }) => {
        console.log(route);

        for (let index = 0; index < route[0].legs.length; index++) {
          const { steps } = route[0].legs[index];

          const start = document.createElement("div");
          start.className = "marker";
          start.textContent = (index + 1).toLocaleString();

          const originMarker = new mapboxgl.Marker(start)
            .setLngLat(steps[0].maneuver.location)
            .addTo(map);

          markersRef.current.push(originMarker);

          if (index !== route[0].legs.length - 1) continue;

          const end = document.createElement("div");
          end.className = "marker";
          end.textContent = (index + 2).toLocaleString();

          const destinationMarker = new mapboxgl.Marker(end)
            .setLngLat(steps[steps.length - 1].maneuver.location)
            .addTo(map);

          markersRef.current.push(destinationMarker);
        }

        map.jumpTo({ center: [-122.2592173, 37.8721508] });

        // Remove unnecessary layers
        map.removeLayer("directions-route-line");
        map.removeLayer("directions-waypoint-point-casing");
        map.removeLayer("directions-waypoint-point");
        map.removeLayer("directions-origin-point");
        map.removeLayer("directions-destination-point");
        map.removeLayer("directions-origin-label");
        map.removeLayer("directions-destination-label");
      });

      map.addSource("campus", {
        type: "geojson",
        data: "/geojson/campus.geojson",
      });

      map.addLayer({
        id: "campus-fill",
        type: "line",
        source: "campus",
        layout: {},
        paint: {
          "line-width": 1,
          "line-color": "#3b82f6",
          "line-opacity": 0.5,
          "line-dasharray": [2, 2],
        },
      });

      map.addLayer({
        id: "campus-line",
        type: "fill",
        source: "campus",
        layout: {},
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.05,
        },
      });

      setDirections(directions);
    });
  });

  window.L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      maxZoom: 18,
      id: "mathhulk/cl0ovzd7j000u14mlcv35f827",
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        "pk.eyJ1IjoibWF0aGh1bGsiLCJhIjoiY2t6bTFhcDU2M2prOTJwa3VwcTJ2d2dpMiJ9.WEJWEP_qrKGXkYOgbIsaGg",
    }
  ).addTo(this.map);

  const waypoints = locations.map((step) => {
    const { center, title } = step.location;

    if (title) return { latLng: center, name: title };
    return { latLng: center };
  });

  window.L.Routing.control({
    waypoints,
    show: false,
    fitSelectedRoutes: false,
    addWaypoints: false,
    draggableWaypoints: false,
    lineOptions: {
      styles: [{ color: "blue", opacity: 0.5, weight: 3 }],
      missingRouteStyles: [{ color: "blue", opacity: 0.25, weight: 3 }],
    },
    createMarker: (i, waypoint) => {
      if (waypoint.name) {
        return window.L.marker(waypoint.latLng).on("click", () => {
          this.setIndex(i);
        });
      }

      return false;
    },
  })
    .on("routesfound", (event) => {
      const { summary, instructions } = event.routes[0];

      // To-do: Meters to miles conversion function
      this.distance = (summary.totalDistance / 1609.34)
        .toFixed(2)
        .toLocaleString();

      let distance = 0;
      let index = 1;

      for (const instruction of instructions) {
        distance += instruction.distance;

        if (
          instruction.type &&
          ["WaypointReached", "DestinationReached"].includes(instruction.type)
        ) {
          if (this.steps[index].duration === undefined) continue;

          // To-do: Unit based on distance
          this.steps[index].distance = (distance / 1609.34)
            .toFixed(2)
            .toLocaleString();

          distance = 0;
          index++;
        }
      }

      this.loading = false;
    })
    .addTo(this.map);
};

onMounted(() => initialize());

provide("map", map);
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
