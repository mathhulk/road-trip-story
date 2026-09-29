import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { resolvedSteps as steps } from "@/lib/assets";
import type { Coordinates, Route } from "@/lib/route";

const DEFAULT_STYLE = "mapbox://styles/mathhulk/cl0ovzd7j000u14mlcv35f827";

// The story's zoom levels were authored for Leaflet, whose zoom 0 is a single
// 256px tile. Mapbox GL renders 512px tiles, so its zoom is one lower for the same view.
const LEAFLET_ZOOM_OFFSET = 1;

const ROUTE_SOURCE = "route";
const ROUTE_LAYER = "route";

let map: mapboxgl.Map | null = null;
let styleReady = false;
let route: Route | null = null;

function toLngLat([lat, lng]: [number, number]): [number, number] {
  return [lng, lat];
}

/** Pixels the map is shifted so a location isn't hidden behind the side panel. */
function panelOffset() {
  const { innerWidth } = window;

  if (innerWidth <= 992) return 0;
  if (innerWidth <= 1400) return 224;
  return 432;
}

function syncRoute() {
  if (!map || !styleReady || !route) return;

  const data = {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates: route.geometry }
  };

  const source = map.getSource<mapboxgl.GeoJSONSource>(ROUTE_SOURCE);

  if (source) {
    source.setData(data);
    return;
  }

  map.addSource(ROUTE_SOURCE, { type: "geojson", data });

  map.addLayer({
    id: ROUTE_LAYER,
    type: "line",
    source: ROUTE_SOURCE,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "blue",
      "line-opacity": route.found ? 0.5 : 0.25,
      "line-width": 3
    }
  });
}

export function createMap(container: string, onSelectStep: (index: number) => void) {
  const { location } = steps[0]!;

  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Mapbox GL stops rendering entirely (including the route) when its token is
  // missing or rejected, so say why instead of leaving a blank map.
  if (!accessToken) {
    console.error("[map] VITE_MAPBOX_ACCESS_TOKEN is not set, so the map can't be drawn. See .env.example.");
  }

  map = new mapboxgl.Map({
    accessToken: accessToken ?? "",
    container,
    style: import.meta.env.VITE_MAPBOX_STYLE || DEFAULT_STYLE,
    center: toLngLat(location.center),
    zoom: location.zoom - LEAFLET_ZOOM_OFFSET,
    maxZoom: 18 - LEAFLET_ZOOM_OFFSET,
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false
  });

  map.touchZoomRotate.disableRotation();

  map.on("style.load", () => {
    styleReady = true;
    syncRoute();
  });

  map.on("error", ({ error }) => console.error("[map]", error));

  steps.forEach(({ location: { center } }, index) => {
    const element = document.createElement("div");
    element.className = "map-marker";

    element.addEventListener("click", event => {
      event.stopPropagation();
      onSelectStep(index);
    });

    // The marker icon is 25px wide and anchored 12px from its left edge.
    new mapboxgl.Marker({ element, anchor: "bottom", offset: [0.5, 0] })
      .setLngLat(toLngLat(center))
      .addTo(map!);
  });
}

export function setRoute(value: Route) {
  route = value;
  syncRoute();
}

/** Move the camera to a step's location. `animate: false` jumps instead of flying. */
export function showStep(index: number, animate = true) {
  const step = steps[index];
  if (!map || !step) return;

  const { center, zoom } = step.location;

  const options = {
    center: toLngLat(center),
    zoom: zoom - LEAFLET_ZOOM_OFFSET,
    offset: [-panelOffset(), 0] as [number, number],
    essential: true
  };

  if (animate) map.flyTo(options);
  else map.easeTo({ ...options, duration: 0 });
}

function bounds(coordinates: Coordinates) {
  return coordinates.reduce(
    (result, coordinate) => result.extend(coordinate),
    new mapboxgl.LngLatBounds(coordinates[0]!, coordinates[0]!)
  );
}

/** Zoom out so the whole trip is visible beside the side panel. */
export function showOverview(animate = true) {
  if (!map) return;

  const { innerWidth } = window;

  map.fitBounds(bounds(steps.map(({ location }) => toLngLat(location.center))), {
    padding: { top: 64, bottom: 32, left: 0, right: innerWidth <= 992 ? 0 : 448 },
    ...(animate ? {} : { duration: 0 }),
    essential: true
  });
}
