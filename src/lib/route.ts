import type { Location } from "@/types";

const METERS_PER_MILE = 1609.34;
const EARTH_RADIUS_METERS = 6371008.8;

/** GeoJSON `[longitude, latitude]` pairs. */
export type Coordinates = [number, number][];

export interface Route {
  /** The line to draw on the map. */
  geometry: Coordinates;
  /** Distance of each leg (from one location to the next) in meters. */
  legs: number[];
  /** `false` when the routing service was unavailable and the line is a straight approximation. */
  found: boolean;
}

export function metersToMiles(meters: number) {
  return (meters / METERS_PER_MILE).toFixed(2);
}

function haversine([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const a =
    Math.sin(toRadians(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(toRadians(lng2 - lng1) / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

interface OsrmResponse {
  code: string;
  routes: { geometry: { coordinates: Coordinates }; legs: { distance: number }[] }[];
}

/**
 * Drive the locations in order using the public OSRM demo server. If it can't
 * be reached, fall back to straight lines so the story still works.
 */
export async function fetchRoute(locations: Location[]): Promise<Route> {
  const waypoints = locations.map(({ center: [lat, lng] }): [number, number] => [lng, lat]);

  try {
    const coordinates = waypoints.map(waypoint => waypoint.join(",")).join(";");
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
    );

    if (!response.ok) throw new Error(`Routing request failed with status ${response.status}`);

    const { code, routes }: OsrmResponse = await response.json();
    const route = routes[0];

    if (code !== "Ok" || !route) throw new Error(`Routing request failed with code ${code}`);

    return {
      geometry: route.geometry.coordinates,
      legs: route.legs.map(leg => leg.distance),
      found: true
    };
  } catch (error) {
    console.error("Could not fetch the route; drawing straight lines instead.", error);

    return {
      geometry: waypoints,
      legs: waypoints.slice(1).map((waypoint, index) => haversine(waypoints[index]!, waypoint)),
      found: false
    };
  }
}
