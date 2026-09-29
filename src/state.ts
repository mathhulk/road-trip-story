import { reactive } from "vue";

import { resolvedSteps as steps } from "@/lib/assets";
import { createMap, setRoute, showOverview, showStep } from "@/lib/map";
import { fetchRoute, metersToMiles } from "@/lib/route";

export const state = reactive({
  loading: true,

  /** Total trip distance in miles. */
  distance: "",

  /** Miles driven to reach each step from the previous one (empty for the first). */
  distances: [] as string[]
});

// The first camera move (e.g. when opening a link straight to a step) jumps
// rather than flying across the state from the start of the trip.
let cameraPlaced = false;

export function focusStep(index: number) {
  showStep(index, cameraPlaced);
  cameraPlaced = true;
}

export function focusOverview() {
  showOverview(cameraPlaced);
  cameraPlaced = true;
}

export async function initialize(onSelectStep: (index: number) => void) {
  createMap("map", onSelectStep);

  const route = await fetchRoute(steps.map(({ location }) => location));
  setRoute(route);

  state.distance = metersToMiles(route.legs.reduce((total, leg) => total + leg, 0));
  state.distances = ["", ...route.legs.map(metersToMiles)];
  state.loading = false;
}
