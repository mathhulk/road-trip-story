<template>
  <div class="feather-icon" v-html="html" />
</template>

<script lang="ts">
import feather from "feather-icons";

export default {
  name: "FeatherIcon",

  props: {
    icon: {
      type: String,
      required: true,
    },

    width: {
      type: Number,
      default: 16,
    },

    height: {
      type: Number,
      default: 16,
    },

    color: {
      type: String,
      default: "currentColor",
    },

    fill: {
      type: String,
      default: "none",
    },
  },

  computed: {
    html() {
      if (!feather.icons[this.icon as keyof typeof feather.icons]) {
        throw new Error(`Icon "${this.icon}" not found`);
      }

      return feather.icons[this.icon as keyof typeof feather.icons].toSvg({
        width: this.width,
        height: this.height,
        color: this.color,
        fill: this.fill,
      });
    },
  },
};
</script>
