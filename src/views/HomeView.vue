<script setup lang="ts">
import { RouterLink } from "vue-router";
import FeatherIcon from "../components/FeatherIcon.vue";
</script>

<template>
  <div class="start-wrapper">
    <div class="start">
      <div class="start-icon">
        <FeatherIcon
          icon="heart"
          fill="currentColor"
          :width="16"
          :height="16"
        />
      </div>

      <p class="start-heading">
        <span class="important">California coast</span> with love
      </p>

      <p class="start-description">
        Annika, I hope you enjoy this interactive story I've put together to
        memorialize our trip up the coast and in preparation for our next trip
        to France! <span class="important">With love, Matthew</span>.
      </p>

      <!-- To-do: Button component -->
      <RouterLink to="/locations/0">
        <div class="start-button">
          <div class="button-icon">
            <FeatherIcon icon="play" />
          </div>
          <p class="button-text">Enter</p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
.start-wrapper {
  position: fixed;

  z-index: 400;

  height: 100%;
  width: 100%;

  left: 0;
  top: 0;

  background: #ece1cb;

  @media (max-width: 992px) {
    padding-right: 24px;
    padding-left: 24px;
  }
}

.start-wrapper {
  display: grid;
  place-items: center;

  .start {
    position: relative;

    @media (min-width: 992px) {
      max-width: 50%;
    }

    .start-icon {
      position: absolute;

      color: #ef4444;

      left: -12px;
      top: -12px;

      transform: rotate(-22.5deg);
    }

    .start-button {
      display: flex;
      align-items: center;

      cursor: pointer;

      &:hover .button-icon {
        color: white;
      }

      .button-icon {
        height: 32px;
        width: 32px;

        border-radius: 4px;

        background-color: black;

        transition: all 150ms ease;

        color: #8d8d8d;

        display: grid;
        place-items: center;

        margin-right: 16px;
      }

      .button-text {
        font-size: 16px;
        font-weight: 500;
        color: black;
      }
    }

    p.start-heading {
      font-size: 48px;
      font-weight: 900;
      color: #ef4444;

      line-height: 1;

      margin-bottom: 32px;

      .important {
        background-image: url("../assets/images/coast.jpg");
        background-size: cover;
        background-position: center;
        background-clip: text;

        color: transparent;
      }
    }

    p.start-description {
      font-size: 16px;
      color: rgba(black, 0.5);

      margin-bottom: 32px;

      .important {
        color: black;
        font-weight: 500;

        border-bottom: 2px solid rgba(black, 0.1);
      }
    }
  }
}
</style>
