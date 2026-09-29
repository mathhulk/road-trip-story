<template>
  <div class="feather-icon" v-html="html" />
</template>

<script setup lang="ts">
import feather, { type FeatherIcon } from "feather-icons";
import { computed } from "vue";

const props = withDefaults(defineProps<{
  icon: string;
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
}>(), {
  width: 16,
  height: 16,
  color: "currentColor",
  fill: "none"
});

const html = computed(() => {
  const icon = (feather.icons as Record<string, FeatherIcon | undefined>)[props.icon];
  if (!icon) throw new Error(`Unknown feather icon: ${props.icon}`);

  return icon.toSvg({ width: props.width, height: props.height, color: props.color, fill: props.fill });
});
</script>
