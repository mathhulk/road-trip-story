<template>
  <div class="overlay active">
    <div class="overlay-start">
      <!-- To-do: Menu class -->
      <div class="overlay-menu">
        <!-- To-do: Icon button component -->
        <RouterLink class="menu-button" :to="{ name: 'start' }">
          <FeatherIcon icon="x" />
        </RouterLink>

        <RouterLink class="menu-button" :to="{ name: 'step', params: { step: 1 } }">
          <FeatherIcon icon="refresh-ccw" />
        </RouterLink>
      </div>
    </div>

    <div class="overlay-end">
      <div class="overlay-overview">
        <!-- Card class, itinerary component -->
        <div class="overview-itinerary" :class="{ active: itinerary }">
          <div class="itinerary-menu">
            <div class="menu-description">
              <p class="description-distance">{{ state.distance }} miles</p>
              <p class="description-steps">{{ steps.length }} locations</p>
            </div>

            <div class="menu-button" @click="itinerary = !itinerary">
              <FeatherIcon :icon="itinerary ? 'chevron-up' : 'chevron-down'" />
            </div>
          </div>

          <RouterLink
            class="itinerary-step"
            v-for="(step, index) in steps"
            :key="index"
            :to="{ name: 'step', params: { step: index + 1 } }"
          >
            <div class="step-icon">
              <FeatherIcon :icon="getLocationIcon(index)" />
            </div>

            <div class="step-location">
              <p class="location-title">{{ step.location.title }}</p>
              <p class="location-city">{{ step.location.city }}</p>
            </div>

            <p v-if="index > 0" class="step-distance">{{ state.distances[index] }} mi.</p>
          </RouterLink>
        </div>

        <!-- To-do: Preview class, playlist component -->
        <a target="_blank" href="https://open.spotify.com/playlist/5MliYoExKI6hQ7qmDVFiop?si=b661449ff5534e90">
          <div class="overview-playlist">
            <img class="playlist-image" :src="steps[3]?.media?.images?.[0]" />

            <div class="playlist-overlay">
              <div class="overlay-menu">
                <div class="menu-button">
                  <FeatherIcon icon="play" />
                </div>

                <div class="menu-header">
                  <p class="header-title">Play on Spotify</p>
                  <p class="header-description">18 songs</p>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import FeatherIcon from "@/components/FeatherIcon.vue";
import { resolvedSteps as steps } from "@/lib/assets";
import { focusOverview, state } from "@/state";

const itinerary = ref(false);

function getLocationIcon(index: number) {
  if (index === 0) return "navigation";
  else if (index === steps.length - 1) return "flag";
  return "map-pin";
}

onMounted(focusOverview);
</script>
