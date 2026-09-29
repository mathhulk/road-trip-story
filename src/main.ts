import { createApp } from "vue";

import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/900.css";

import "./assets/styles/reset.css";
import "./assets/styles/main.scss";

import App from "./App.vue";
import { router } from "./router";

createApp(App).use(router).mount("#app");
