<template>
  <div id="map" />

  <!-- To-do: Loading component -->
  <div v-if="state.loading" class="loading-wrapper">
    <div class="loading">
      <div class="loading-spinner" />

      <div class="loading-text">
        <p class="text-title">Loading...</p>
        <p class="text-description">Please wait.</p>
      </div>
    </div>
  </div>

  <RouterView v-else />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView, useRouter } from "vue-router";

import { initialize, state } from "@/state";

const router = useRouter();

onMounted(() => {
  initialize(index => router.push({ name: "step", params: { step: index + 1 } }));
});
</script>
