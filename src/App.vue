<template>
  <div id="map" />

  <!-- To-do: Components -->
  <div v-if="story" class="overlay" :class="{ active: index === null }">
    <template v-if="index === null">
      <div class="overlay-start">
        <!-- To-do: Menu class -->
        <div class="overlay-menu">
          <!-- To-do: Icon button component -->
          <div class="menu-button" @click="exit">
            <FeatherIcon icon="x" />
          </div>

          <div class="menu-button" @click="setIndex(0)">
            <FeatherIcon icon="refresh-ccw" />
          </div>
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
              class="itinerary-step"
              v-for="(filteredStep, filteredIndex) in filteredSteps"
              :key="filteredIndex"
              @click="setIndex(filteredIndex)"
            >
              <div class="step-icon">
                <FeatherIcon :icon="getLocationIcon(filteredIndex)" />
              </div>

              <div class="step-location">
                <p class="location-title">{{ filteredStep.location.title }}</p>
                <p class="location-city">{{ filteredStep.location.city }}</p>
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
    </template>

    <template v-else>
      <div class="overlay-start">
        <div class="overlay-menu">
          <div class="menu-button" @click="exit">
            <FeatherIcon icon="x" />
          </div>

          <div class="menu-button" @click="skip">
            <FeatherIcon icon="fast-forward" />
          </div>
        </div>
      </div>

      <div class="overlay-end">
        <div class="overlay-step">
          <div class="step-progress">
            <div
              class="progress-bar"
              ref="progressBar"
              @animationend="skipNext"
            />
          </div>

          <div class="step-menu">
            <div class="menu-location">
              <p class="location-title">{{ step.location.title }}</p>
              <p class="location-city">{{ step.location.city }}</p>
            </div>

            <div
              class="menu-button"
              @click="skipPrevious"
              :class="{ disabled: index === 0 }"
            >
              <FeatherIcon icon="skip-back" />
            </div>

            <div class="menu-button" @click="togglePaused">
              <FeatherIcon :icon="togglePausedIcon" />
            </div>

            <div
              class="menu-button"
              @click="skipNext"
              :class="{ disabled: index === steps.length - 1 }"
            >
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
            <p
              class="lyrics-line"
              v-for="(line, number) in step.lyrics"
              :key="number"
            >
              {{ line }}
            </p>
          </div>
        </div>

        <!-- To-do: Media component -->
        <div v-if="step.media" class="overlay-media">
          <div v-if="step.media.video" class="media-video">
            <video :src="step.media.video" autoplay muted playsinline loop />
          </div>

          <div v-if="step.media.images" class="media-gallery">
            <div
              class="gallery-image"
              v-for="image in step.media.images"
              :key="image"
            >
              <img :src="image" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- To-do: Loading component -->
  <div v-else-if="loading" class="loading-wrapper">
    <div class="loading">
      <div class="loading-spinner" />

      <div class="loading-text">
        <p class="text-title">Loading...</p>
        <p class="text-description">Please wait.</p>
      </div>
    </div>
  </div>

  <!-- To-do: Start ("splash") component -->
</template>

<script lang="ts">
import FeatherIcon from "@/components/FeatherIcon";

import locations from "./locations";

export default {
  name: "RoadTripStory",

  components: {
    FeatherIcon,
  },

  data() {
    return {
      steps: null,
      index: null,

      paused: false,
      audio: null,

      story: false,
      loading: true,

      itinerary: false,
      distance: null,

      map: null,
    };
  },

  mounted() {
    this.$nextTick(this.initialize);
  },

  computed: {
    togglePausedIcon() {
      return this.paused ? "play" : "pause";
    },

    toggleItineraryIcon() {
      return this.itinerary ? "chevron-up" : "chevron-down";
    },

    step() {
      if (this.index === null) return;

      return this.steps?.[this.index];
    },

    filteredSteps() {
      return this.steps.filter((step) => {
        if (step.duration === undefined) return false;
        return true;
      });
    },
  },

  methods: {
    offsetCenter(center, zoom) {
      // To-do: Resizing
      const { innerWidth } = window;

      if (innerWidth <= 992) return center;

      let offset = [432, 0];

      /* To-do: Offset does not work on iOS.
      if (innerWidth <= 992) offset = [ 0, 66 ];
      else if (innerWidth <= 1400) offset = [ 224, 0 ];*/

      if (innerWidth <= 1400) offset = [224, 0];

      const point = this.map.project(center, zoom).add(offset);
      return this.map.unproject(point, zoom);
    },

    offsetBounds(bounds) {
      // To-do: Resizing
      const { innerWidth } = window;

      if (innerWidth <= 992) return bounds;

      const center = bounds.getSouthEast();
      const zoom = this.map.getBoundsZoom(bounds);

      let offset = [448, 0];

      /* To-do: Offset does not work on iOS
      if (innerWidth <= 992) offset = [ 0, -66 ];*/

      const point = this.map.project(center, zoom).add(offset);
      const offsetPoint = this.map.unproject(point, zoom);
      return bounds.extend(offsetPoint);
    },

    getLocationIcon(filteredIndex) {
      if (filteredIndex === 0) return "navigation";
      else if (filteredIndex === this.filteredSteps.length - 1) return "flag";
      return "map-pin";
    },

    // To-do: Clean up
    initialize() {
      this.steps = locations.map((step) => {
        const [lat, long] = step.location.center;
        step.location.center = window.L.latLng(lat, long);

        if (step.song) {
          step.song.image = require("@/assets/images/songs/" + step.song.image);
          step.song.audio = "./assets/audio/" + step.song.audio;
        }

        if (step.media) {
          if (step.media.video)
            step.media.video = "./assets/videos/" + step.media.video;

          if (step.media.images) {
            step.media.images = step.media.images.map((image) => {
              return require("@/assets/images/notes/" + image);
            });
          }
        }

        return step;
      });

      const { center, zoom } = this.steps[0].location;

      this.map = window.L.map("map", {
        attributionControl: false,
        zoomControl: false,
        center,
        zoom,
      });

      window.L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          maxZoom: 18,
          id: "mathhulk/cl0ovzd7j000u14mlcv35f827",
          tileSize: 512,
          zoomOffset: -1,
          accessToken:
            "pk.eyJ1IjoibWF0aGh1bGsiLCJhIjoiY2t6bTFhcDU2M2prOTJwa3VwcTJ2d2dpMiJ9.WEJWEP_qrKGXkYOgbIsaGg",
        }
      ).addTo(this.map);

      const waypoints = locations.map((step) => {
        const { center, title } = step.location;

        if (title) return { latLng: center, name: title };
        return { latLng: center };
      });

      window.L.Routing.control({
        waypoints,
        show: false,
        fitSelectedRoutes: false,
        addWaypoints: false,
        draggableWaypoints: false,
        lineOptions: {
          styles: [{ color: "blue", opacity: 0.5, weight: 3 }],
          missingRouteStyles: [{ color: "blue", opacity: 0.25, weight: 3 }],
        },
        createMarker: (i, waypoint) => {
          if (waypoint.name) {
            return window.L.marker(waypoint.latLng).on("click", () => {
              this.setIndex(i);
            });
          }

          return false;
        },
      })
        .on("routesfound", (event) => {
          const { summary, instructions } = event.routes[0];

          // To-do: Meters to miles conversion function
          this.distance = (summary.totalDistance / 1609.34)
            .toFixed(2)
            .toLocaleString();

          let distance = 0;
          let index = 1;

          for (const instruction of instructions) {
            distance += instruction.distance;

            if (
              instruction.type &&
              ["WaypointReached", "DestinationReached"].includes(
                instruction.type
              )
            ) {
              if (this.steps[index].duration === undefined) continue;

              // To-do: Unit based on distance
              this.steps[index].distance = (distance / 1609.34)
                .toFixed(2)
                .toLocaleString();

              distance = 0;
              index++;
            }
          }

          this.loading = false;
        })
        .addTo(this.map);
    },

    enter() {
      this.story = true;

      this.index = 0;
    },

    skip() {
      this.audio.pause();

      this.index = null;

      let topLatitude, bottomLatitude, topLongitude, bottomLongitude;

      for (const step of this.steps) {
        const { lat, lng } = step.location.center;

        if (topLatitude === undefined) {
          topLatitude = lat;
          bottomLatitude = lat;
          topLongitude = lng;
          bottomLongitude = lng;

          continue;
        }

        if (lat > topLatitude) topLatitude = lat;
        if (lat < bottomLatitude) bottomLatitude = lat;
        if (lng > topLongitude) topLongitude = lng;
        if (lng < bottomLongitude) bottomLongitude = lng;
      }

      const topCorner = window.L.latLng(topLatitude, topLongitude);
      const bottomCorner = window.L.latLng(bottomLatitude, bottomLongitude);
      const bounds = window.L.latLngBounds(topCorner, bottomCorner);

      /* To-do: Padding does not work...
      let paddingTopLeft = window.L.point(32, 128);
      let paddingBottomRight = window.L.point(864, 32);

      const { innerWidth } = window;

      if (innerWidth <= 992) {
        paddingTopLeft = window.L.point(24, 112);
        paddingBottomRight = window.L.point(24, 164);
      } else if (innerWidth <= 1400) {
        paddingBottomRight = window.L.point(448, 32);
      }
      
      this.map.flyToBounds(bounds, { paddingTopLeft, paddingBottomRight });*/

      const offsetBounds = this.offsetBounds(bounds);
      this.map.flyToBounds(offsetBounds);
    },

    exit() {
      this.audio.pause();

      this.audio = null;
      this.index = null;
      this.paused = false;
      this.story = false;
    },

    togglePaused() {
      const { progressBar } = this.$refs;
      progressBar.style.animationPlayState = this.paused ? "running" : "paused";

      if (this.paused) this.audio.play();
      else this.audio.pause();

      this.paused = !this.paused;
    },

    toggleItinerary() {
      this.itinerary = !this.itinerary;
    },

    skipNext() {
      if (this.index === this.steps.length - 1) {
        this.skip();

        return;
      }

      this.index++;
    },

    // To-do: Resize route during zoom
    setIndex(index) {
      this.index = index;
    },

    skipPrevious() {
      this.index = Math.max(this.index - 1, 0);
    },

    handleTimeUpdate() {
      if (this.index === null) return;

      const { duration, song } = this.step;
      const { currentTime } = this.audio;

      const relativeCurrentTime = currentTime - song.startTime;

      if (relativeCurrentTime <= 5) {
        this.audio.volume = relativeCurrentTime / 5;
      } else if (relativeCurrentTime >= duration - 5) {
        // To-do: Prevent updates after an animation has finished
        this.audio.volume = Math.min(1, (duration - relativeCurrentTime) / 5);
      }
    },
  },

  watch: {
    index: function (index, previousIndex) {
      if (index === null) return;

      const step = this.steps[index];

      if (this.audio) this.audio.pause();

      const { center, zoom } = step.location;

      /* To-do: Padding does not work...
      const bounds = window.L.latLngBounds(center, center);

      let paddingTopLeft = window.L.point(32, 128);
      let paddingBottomRight = window.L.point(864, 32);

      const { innerWidth } = window;

      if (innerWidth <= 992) {
        paddingTopLeft = window.L.point(24, 112);
        paddingBottomRight = window.L.point(24, 164);
      } else if (innerWidth <= 1400) {
        paddingBottomRight = window.L.point(448, 32);
      }

      this.map.flyToBounds(bounds, { paddingBottomRight, paddingTopLeft, maxZoom: zoom });*/

      this.map.flyTo(this.offsetCenter(center, zoom), zoom);

      const { audio, startTime } = step.song;

      // To-do: Buffering indicator
      this.audio = new Audio(audio);
      this.audio.currentTime = startTime;
      this.audio.addEventListener("timeupdate", this.handleTimeUpdate);
      this.audio.play();

      this.$nextTick(() => {
        const { progressBar } = this.$refs;

        // Note: Trigger reflow
        progressBar.classList.remove("animate");
        void progressBar.offsetWidth;
        progressBar.classList.add("animate");

        progressBar.style.animationDuration = step.duration + "s";
        progressBar.style.animationPlayState = "running";

        this.paused = false;
      });
    },
  },
};
</script>

<style lang="scss">
@import "./assets/reset.css";

body,
#app,
#map {
  height: 100%;
}

::-webkit-scrollbar {
  display: none;
}

body {
  font-family: "Inter", sans-serif;

  user-select: none;

  overflow: hidden;
}

.leaflet-routing-container.leaflet-bar.leaflet-routing-container-hide.leaflet-control {
  display: none;
}

// To-do: Breakpoint max. vs. min.
.overlay {
  position: fixed;

  z-index: 400;

  height: 100%;
  width: 100%;

  top: 0;
  left: 0;

  // To-do: Fix scrolling on mobile
  &.active {
    @media (min-width: 992px) {
      pointer-events: none;
    }
  }

  // To-do: Different gradient for 992px - 1400px..?
  @media (min-width: 992px) {
    background: linear-gradient(
      to left,
      #ece1cb 448px,
      rgba(#ece1cb, 0.5),
      transparent 864px
    );

    overflow: hidden;

    display: flex;
  }

  @media (max-width: 992px) {
    overflow: auto;
  }

  .overlay-start {
    display: flex;

    @media (min-width: 992px) {
      flex-grow: 1;

      padding-left: 32px;
      padding-top: 32px;
    }

    @media (max-width: 992px) {
      height: calc(100% - 164px);

      padding-left: 24px;
    }

    .overlay-menu {
      @media (max-width: 992px) {
        position: sticky;

        top: 24px;
      }
    }
  }

  .overlay-end {
    pointer-events: auto;

    position: relative;

    @media (min-width: 1400px) {
      display: flex;
      flex-direction: row-reverse;
    }

    @media (min-width: 992px) and (max-width: 1400px) {
      overflow: auto;

      width: 448px;

      padding: 32px;
    }

    @media (max-width: 992px) {
      background: linear-gradient(
        to bottom,
        transparent,
        rgba(#ece1cb, 0.5),
        #ece1cb 132px
      );

      padding: 24px;
    }

    .overlay-overview {
      @media (min-width: 1400px) {
        width: 448px;
        height: 100%;

        overflow: auto;

        padding: 32px;
      }

      .overview-playlist {
        @media (min-width: 992px) {
          margin-top: 32px;
        }

        @media (max-width: 992px) {
          margin-top: 24px;
        }
      }
    }

    .overlay-step {
      @media (min-width: 1400px) {
        position: absolute;

        width: 384px;

        top: 32px;
        right: 32px;
      }

      @media (max-width: 1400px) {
        flex-shrink: 0;

        position: sticky;

        z-index: 401;
      }

      @media (min-width: 992px) and (max-width: 1400px) {
        top: 0;

        margin-bottom: 32px;
      }

      @media (max-width: 992px) {
        top: 32px;

        margin-bottom: 24px;
      }
    }

    .overlay-side-bar {
      @media (min-width: 992px) and (max-width: 1400px) {
        height: calc(100vh - 164px);
      }

      @media (min-width: 1400px) {
        width: 416px;

        padding-right: 32px;
        padding-top: 132px;
      }

      .side-bar-lyrics {
        @media (max-width: 992px) {
          margin-top: 24px;
        }

        @media (min-width: 992px) {
          margin-top: 32px;
        }
      }
    }

    .overlay-media {
      @media (min-width: 1400px) {
        padding: 32px;

        width: 448px;

        overflow: auto;
      }

      @media (max-width: 1400px) and (min-width: 992px) {
        margin-top: 32px;
      }

      @media (max-width: 992px) {
        margin-top: 24px;
      }

      .media-gallery {
        @media (min-width: 1400px) {
          direction: rtl;
        }
      }
    }
  }

  .overlay-step {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;

    height: 68px;
    width: 100%;

    background-color: black;

    display: flex;
    flex-direction: column;

    .step-menu {
      flex-grow: 1;

      display: flex;
      align-items: center;

      padding-left: 16px;
      padding-right: 16px;

      .menu-location {
        margin-right: 16px;

        flex-grow: 1;

        overflow: hidden;

        height: 100%;

        display: flex;
        flex-direction: column;
        justify-content: center;

        p.location-title {
          font-size: 16px;
          font-weight: 500;
          color: white;
          line-height: 1.25;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

          margin-bottom: 2px;
          margin-top: -2px;
        }

        p.location-city {
          font-size: 12px;
          color: rgba(white, 0.5);
          line-height: 1;
        }
      }

      .menu-button {
        flex-shrink: 0;

        height: 32px;
        width: 32px;

        display: grid;
        place-items: center;

        color: #8d8d8d;

        background-color: rgba(white, 0.1);

        border-radius: 4px;

        transition: all 150ms ease;

        &:not(:last-child) {
          margin-right: 8px;
        }

        &:not(.disabled):hover {
          color: white;

          cursor: pointer;
        }

        &.disabled {
          background-color: rgba(white, 0.05);

          color: rgba(white, 0.1);
        }
      }
    }

    .step-progress {
      flex-shrink: 0;

      background-color: rgba(white, 0.1);

      @keyframes time {
        0% {
          width: 0%;
        }

        100% {
          width: 100%;
        }
      }

      .progress-bar {
        height: 4px;

        background-color: white;

        &.animate {
          animation: time;
          animation-iteration-count: 1;
          animation-timing-function: linear;
        }
      }
    }
  }

  .overlay-overview {
    .overview-playlist {
      aspect-ratio: 1;

      position: relative;

      overflow: hidden;

      border-radius: 8px;

      &:hover img.playlist-image {
        transform: scale(1.1);
      }

      img.playlist-image {
        object-fit: cover;

        height: 100%;
        width: 100%;

        transition: all 300ms ease;

        z-index: 1;
      }

      .playlist-overlay {
        height: 100%;
        width: 100%;

        background: linear-gradient(to top, rgba(black, 0.85), transparent);

        position: absolute;

        top: 0;
        left: 0;

        padding: 16px;

        display: flex;
        flex-direction: column;
        justify-content: flex-end;

        line-height: 1;

        .overlay-menu {
          display: flex;

          .menu-button {
            margin-right: 16px;

            height: 32px;
            width: 32px;

            border-radius: 4px;

            background-color: rgba(#22c55e, 0.1);

            color: #22c55e;

            display: grid;
            place-items: center;
          }

          .menu-header {
            p.header-title {
              font-weight: 500;
              color: white;
              font-size: 16px;

              margin-bottom: 4px;
            }

            p.header-description {
              color: rgba(white, 0.5);
              font-size: 12px;
            }
          }
        }
      }
    }

    .overview-itinerary {
      background-color: black;

      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;

      border-top: 4px solid #22c55e;

      padding: 8px;

      color: white;

      &:not(.active) {
        aspect-ratio: 1;

        overflow: hidden;

        position: relative;

        &::after {
          content: "";

          position: absolute;

          height: calc(100% - 56px);
          width: 100%;

          bottom: 0;
          left: 0;

          background: linear-gradient(to top, black, transparent);
        }
      }

      .itinerary-step {
        display: flex;
        align-items: center;

        cursor: pointer;

        padding-left: 8px;
        padding-right: 128px;

        position: relative;

        &:hover .step-icon {
          color: white;
        }

        &::after {
          content: "";

          position: absolute;

          height: 8px;
          width: 8px;

          border-radius: 50%;

          background-color: #22c55e;

          right: 20px;
          top: 20px;
        }

        .step-distance {
          position: absolute;

          height: 24px;

          display: flex;
          align-items: center;

          padding-right: 8px;
          padding-left: 8px;

          border-radius: 4px;

          background-color: rgba(white, 0.1);

          color: white;
          font-size: 12px;

          right: 8px;
          top: -12px;

          &::before {
            top: -8px;
          }

          &::after {
            bottom: -8px;
          }

          &::before,
          &::after {
            height: 8px;
            width: 2px;

            background-color: rgba(white, 0.1);

            position: absolute;

            right: 15px;

            content: "";
          }
        }

        .step-icon {
          height: 32px;
          width: 32px;

          flex-shrink: 0;

          transition: all 150ms ease;

          border-radius: 4px;

          display: grid;
          place-items: center;

          color: #8d8d8d;

          background-color: rgba(white, 0.1);

          margin-right: 16px;
        }

        .step-location {
          line-height: 1;

          padding-top: 8px;
          padding-bottom: 8px;

          overflow: hidden;

          p.location-title {
            font-weight: 500;
            color: white;
            font-size: 16px;
            line-height: 1.25;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

            margin-bottom: 2px;
            margin-top: -2px;
          }

          p.location-city {
            color: rgba(white, 0.5);
            font-size: 12px;
          }
        }
      }

      .itinerary-menu {
        display: flex;

        padding: 8px;

        .menu-description {
          line-height: 1;

          margin-right: auto;

          p.description-distance {
            font-weight: 500;
            color: #22c55e;
            font-size: 16px;

            margin-bottom: 4px;
          }

          p.description-steps {
            color: rgba(white, 0.5);
            font-size: 12px;
          }
        }

        .menu-button {
          height: 32px;
          width: 32px;

          background-color: rgba(white, 0.1);

          color: #8d8d8d;

          cursor: pointer;

          border-radius: 4px;

          display: grid;
          place-items: center;

          transition: all 150ms ease;

          &:hover {
            color: white;
          }
        }
      }
    }
  }

  .overlay-start .overlay-menu {
    height: 64px;

    background-color: black;

    display: flex;

    padding: 16px;

    border-radius: 8px;

    pointer-events: auto;

    .menu-button {
      height: 32px;
      width: 32px;

      background-color: rgba(white, 0.1);

      color: #8d8d8d;

      display: grid;
      place-items: center;

      transition: all 150ms ease;

      border-radius: 4px;

      cursor: pointer;

      &:not(:first-child) {
        margin-left: 8px;
      }

      &:hover {
        color: white;
      }
    }
  }

  .overlay-media {
    .media-video {
      margin-bottom: 16px;

      video {
        width: 100%;

        border-radius: 8px;
      }
    }

    .media-gallery {
      display: grid;
      grid-gap: 16px;
      grid-template-columns: 1fr 1fr;

      .gallery-image {
        height: 100%;

        aspect-ratio: 3 / 4;

        img {
          height: 100%;
          width: 100%;

          object-fit: cover;

          border-radius: 8px;
        }
      }
    }
  }

  .overlay-side-bar {
    display: flex;
    flex-direction: column;

    .side-bar-lyrics {
      flex-grow: 1;

      padding-left: 16px;
      padding-right: 16px;

      background: linear-gradient(to bottom, rgba(black, 0.75), transparent);
      background-clip: text;

      overflow: hidden;

      p.lyrics-line {
        font-size: 24px;
        font-weight: 900;
        line-height: 1.5;

        color: transparent;

        &:first-child {
          color: black;
        }

        &:not(:last-child) {
          margin-bottom: 8px;
        }
      }
    }

    .side-bar-song {
      width: 100%;

      aspect-ratio: 1;

      flex-shrink: 0;

      position: relative;

      img.song-image {
        object-fit: cover;

        height: 100%;
        width: 100%;

        border-radius: 8px;

        z-index: 1;
      }

      .song-description {
        height: 100%;
        width: 100%;

        background: linear-gradient(to top, rgba(black, 0.85), transparent);

        border-radius: 8px;

        position: absolute;

        top: 0;
        left: 0;

        padding: 16px;

        display: flex;
        flex-direction: column;
        justify-content: flex-end;

        line-height: 1;

        p.description-title {
          font-weight: 500;
          color: white;
          font-size: 16px;

          margin-bottom: 4px;
        }

        p.description-artist {
          color: rgba(white, 0.5);
          font-size: 12px;
        }
      }
    }
  }
}
</style>
