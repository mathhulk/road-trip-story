<template>
  <div class="start-wrapper">
    <div class="start">
      <div class="start-icon">
        <FeatherIcon icon="heart" fill="currentColor" :width="16" :height="16" />
      </div>

      <p class="start-heading"><span class="important">California coast</span> with love</p>

      <p class="start-description">Annika, I hope you enjoy this interactive story I've put together to memorialize our trip up the coast and in preparation for our next trip to France! <span class="important">With love, Matthew</span>.</p>

      <!-- To-do: Button component -->
      <RouterLink class="start-button" :to="{ name: 'step', params: { step: 1 } }">
        <div class="button-icon">
          <FeatherIcon icon="play" />
        </div>

        <p class="button-text">Enter</p>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

import FeatherIcon from "@/components/FeatherIcon.vue";
</script>
