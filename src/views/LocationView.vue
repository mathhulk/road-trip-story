<script setup lang="ts">
import { LngLat, Map } from "mapbox-gl";
import {
  computed,
  inject,
  onMounted,
  ref,
  useTemplateRef,
  watch,
  type Ref,
} from "vue";
import { useRoute } from "vue-router";
import locations from "../locations";

const route = useRoute();

const location = computed(() => {
  const location = structuredClone(
    locations[parseInt(route.params.locationIndex as string)]
  );

  const [lat, long] = location.location.center;
  const center = new LngLat(lat, long);

  if (location.song) {
    location.song.image = import.meta.resolve(
      "@/assets/images/songs/" + location.song.image
    );

    location.song.audio = "./assets/audio/" + location.song.audio;
  }

  if (location.media) {
    if (location.media.video)
      location.media.video = "./assets/videos/" + location.media.video;

    if (location.media.images) {
      location.media.images = location.media.images.map((image) => {
        return import.meta.resolve("@/assets/images/notes/" + image);
      });
    }
  }

  return {
    ...location,
    location: {
      ...location.location,
      center,
    },
  };
});

let audio: HTMLAudioElement | undefined;

const map = inject<Ref<Map>>("map") as Ref<Map>;

const paused = ref(true);

const progressBar = useTemplateRef<HTMLDivElement>("progress-bar");

const initialize = () => {
  if (!progressBar.value) return;

  audio?.pause();

  const { center, zoom } = location.value.location;

  // TODO: Offset by padding
  map.value.flyTo({ center, zoom });

  // TODO: Buffering indicator
  audio = new Audio(location.value.song.audio);
  audio.currentTime = location.value.song.startTime;
  audio.addEventListener("timeupdate", handleTimeUpdate);
  audio.play();

  // Trigger reflow
  progressBar.value.classList.remove("animate");
  void progressBar.value.offsetWidth;
  progressBar.value.classList.add("animate");

  progressBar.value.style.animationDuration = location.value.duration + "s";
  progressBar.value.style.animationPlayState = "running";

  paused.value = false;
};

onMounted(() => initialize());
watch(location, () => initialize());
</script>

<template></template>
