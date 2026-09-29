<template>
  <div class="overlay">
    <div class="overlay-start">
      <div class="overlay-menu">
        <RouterLink class="menu-button" :to="{ name: 'start' }">
          <FeatherIcon icon="x" />
        </RouterLink>

        <RouterLink class="menu-button" :to="{ name: 'overview' }">
          <FeatherIcon icon="fast-forward" />
        </RouterLink>
      </div>
    </div>

    <div class="overlay-end">
      <div class="overlay-step">
        <div class="step-progress">
          <div class="progress-bar" ref="progressBar" @animationend="next(true)" />
        </div>

        <div class="step-menu">
          <div class="menu-location">
            <p class="location-title">{{ step.location.title }}</p>
            <p class="location-city">{{ step.location.city }}</p>
          </div>

          <div class="menu-button" @click="previous" :class="{ disabled: index === 0 }">
            <FeatherIcon icon="skip-back" />
          </div>

          <div class="menu-button" @click="togglePaused">
            <FeatherIcon :icon="paused ? 'play' : 'pause'" />
          </div>

          <div class="menu-button" @click="next()" :class="{ disabled: index === steps.length - 1 }">
            <FeatherIcon icon="skip-forward" />
          </div>
        </div>
      </div>

      <div class="overlay-side-bar">
        <!-- To-do: Song component -->
        <div v-if="step.song" class="side-bar-song">
          <img class="song-image" :src="step.song.image" />

          <div class="song-description">
            <p class="description-title">{{ step.song.title }}</p>
            <p class="description-artist">{{ step.song.artist }}</p>
          </div>
        </div>

        <!-- To-do: Lyrics component -->
        <div v-if="step.lyrics" class="side-bar-lyrics">
          <p class="lyrics-line" v-for="(line, number) in step.lyrics" :key="number">{{ line }}</p>
        </div>
      </div>

      <!-- To-do: Media component -->
      <div v-if="step.media" class="overlay-media">
        <div v-if="step.media.video" class="media-video">
          <video :src="step.media.video" autoplay muted playsinline loop />
        </div>

        <div v-if="step.media.images" class="media-gallery">
          <div class="gallery-image" v-for="image in step.media.images" :key="image">
            <img :src="image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

import FeatherIcon from "@/components/FeatherIcon.vue";
import { resolvedSteps as steps } from "@/lib/assets";
import { focusStep } from "@/state";

const FADE_SECONDS = 5;

const route = useRoute();
const router = useRouter();

// The URL numbers steps from 1 (e.g. /story/3).
const index = computed(() => Number(route.params.step) - 1);
const step = computed(() => steps[index.value]!);

const paused = ref(false);
const progressBar = useTemplateRef<HTMLElement>("progressBar");

let audio: HTMLAudioElement | null = null;

function stopAudio() {
  audio?.pause();
  audio = null;
}

function clamp(volume: number) {
  return Math.min(1, Math.max(0, volume));
}

// Fade the song in and out over the first and last few seconds of the step.
function fade(song: HTMLAudioElement, startTime: number, duration: number) {
  const relativeCurrentTime = song.currentTime - startTime;

  if (relativeCurrentTime <= FADE_SECONDS) {
    song.volume = clamp(relativeCurrentTime / FADE_SECONDS);
  } else if (relativeCurrentTime >= duration - FADE_SECONDS) {
    song.volume = clamp((duration - relativeCurrentTime) / FADE_SECONDS);
  }
}

async function start() {
  stopAudio();
  focusStep(index.value);

  const { duration, song } = step.value;
  let playing: Promise<void> | undefined;
  let current: HTMLAudioElement | undefined;

  if (song) {
    const { audio: src, startTime } = song;

    current = new Audio(src);
    current.currentTime = startTime;
    current.addEventListener("timeupdate", () => fade(current!, startTime, duration));

    audio = current;
    playing = current.play();
  }

  await nextTick();

  const bar = progressBar.value;
  if (!bar) return;

  // Note: Trigger reflow to restart the animation
  bar.classList.remove("animate");
  void bar.offsetWidth;
  bar.classList.add("animate");

  bar.style.animationDuration = duration + "s";
  bar.style.animationPlayState = "running";

  paused.value = false;

  try {
    await playing;
  } catch {
    // Browsers block audio until the page has been interacted with, which is the
    // case when a step is opened directly from a link. Wait for the play button.
    if (audio !== current) return;

    paused.value = true;
    bar.style.animationPlayState = "paused";
  }
}

function togglePaused() {
  const bar = progressBar.value;
  if (bar) bar.style.animationPlayState = paused.value ? "running" : "paused";

  if (paused.value) audio?.play().catch(() => {});
  else audio?.pause();

  paused.value = !paused.value;
}

function previous() {
  if (index.value === 0) return;

  router.push({ name: "step", params: { step: index.value } });
}

// Past the last step, the story ends on the overview. When the step's time runs
// out, replace the entry so "back" doesn't have to rewind through every step.
function next(replace = false) {
  const to =
    index.value === steps.length - 1
      ? { name: "overview" }
      : { name: "step", params: { step: index.value + 2 } };

  if (replace) router.replace(to);
  else router.push(to);
}

watch(index, start, { immediate: true });

onBeforeUnmount(stopAudio);
</script>
