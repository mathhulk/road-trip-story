import { createApp } from "vue";

import "mapbox-gl/dist/mapbox-gl.css";
import "./assets/reset.css";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/900.css";

import { createRouter, createWebHistory } from "vue-router";
import Location from "./views/LocationView.vue";
import Locations from "./views/LocationsView.vue";
import Home from "./views/HomeView.vue";
import locations from "./locations";
import App2 from "./App2.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/locations:/:locationIndex",
      component: Location,
    },
    {
      path: "/locations",
      component: Locations,
    },
    {
      path: "/",
      component: Home,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

router.beforeEach((to) => {
  const { locationIndex } = to.params;
  if (!locationIndex) return;

  const index = Number(locationIndex);

  const invalid = isNaN(index) || index < 0 || index >= locations.length;
  if (!invalid) return;

  return "/";
});

createApp(App2).use(router).mount("#app");
