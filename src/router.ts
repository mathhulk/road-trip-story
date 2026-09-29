import { createRouter, createWebHistory } from "vue-router";

import { resolvedSteps as steps } from "@/lib/assets";
import OverviewView from "@/views/OverviewView.vue";
import StartView from "@/views/StartView.vue";
import StepView from "@/views/StepView.vue";

const TITLE = "road-trip-story";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: "/",
      name: "start",
      component: StartView
    },
    {
      // Steps are numbered from 1 in the URL, e.g. /story/3.
      path: "/story/:step(\\d+)",
      name: "step",
      component: StepView,
      beforeEnter: ({ params }) => {
        const step = Number(params.step);
        if (step < 1 || step > steps.length) return { name: "start" };
      }
    },
    {
      path: "/overview",
      name: "overview",
      component: OverviewView
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "start" }
    }
  ]
});

router.afterEach(({ name, params }) => {
  const step = name === "step" ? steps[Number(params.step) - 1] : undefined;
  document.title = step ? `${step.location.title} · ${TITLE}` : TITLE;
});
