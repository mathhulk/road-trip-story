<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="overlay">
    <div class="overlay-start">
      <!-- To-do: Menu class -->
      <div class="overlay-menu">
        <!-- To-do: Icon button component -->
        <RouterLink to="/">
          <div class="menu-button">
            <FeatherIcon icon="x" />
          </div>
        </RouterLink>

        <RouterLink to="/locations/0">
          <div class="menu-button">
            <FeatherIcon icon="refresh-ccw" />
          </div>
        </RouterLink>
      </div>
    </div>

    <div class="overlay-end">
      <div class="overlay-overview">
        <!-- Card class, itinerary component -->
        <div class="overview-itinerary" :class="{ active: itinerary }">
          <div class="itinerary-menu">
            <div class="menu-description">
              <p class="description-distance">{{ distance }} miles</p>
              <p class="description-steps">
                {{ filteredSteps.length }} locations
              </p>
            </div>

            <div class="menu-button" @click="toggleItinerary">
              <FeatherIcon :icon="toggleItineraryIcon" />
            </div>
          </div>

          <div
            v-for="(filteredStep, filteredIndex) in filteredSteps"
            :key="filteredIndex"
            class="itinerary-step"
            @click="setIndex(filteredIndex)"
          >
            <div class="step-icon">
              <FeatherIcon :icon="getLocationIcon(filteredIndex)" />
            </div>

            <div class="step-location">
              <p class="location-title">
                {{ filteredStep.location.title }}
              </p>
              <p class="location-city">
                {{ filteredStep.location.city }}
              </p>
            </div>

            <p v-if="filteredIndex > 0" class="step-distance">
              {{ filteredStep.distance }} mi.
            </p>
          </div>
        </div>

        <!-- To-do: Preview class, playlist component -->
        <a
          target="_blank"
          href="https://open.spotify.com/playlist/5MliYoExKI6hQ7qmDVFiop?si=b661449ff5534e90"
        >
          <div class="overview-playlist">
            <img
              class="playlist-image"
              :src="filteredSteps[3].media.images[0]"
            />

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
