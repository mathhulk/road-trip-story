import steps from "@/steps";
import type { ResolvedStep } from "@/types";

const songImages = import.meta.glob<string>("/src/assets/images/songs/*.jpg", {
  eager: true,
  import: "default"
});

const noteImages = import.meta.glob<string>("/src/assets/images/notes/*.jpg", {
  eager: true,
  import: "default"
});

function lookup(images: Record<string, string>, directory: string, name: string) {
  const url = images[`/src/assets/images/${directory}/${name}`];
  if (!url) throw new Error(`Missing image: ${directory}/${name}`);

  return url;
}

// Audio and video are large, so they are served untouched from `public/`.
function publicUrl(directory: string, name: string) {
  return `${import.meta.env.BASE_URL}assets/${directory}/${encodeURIComponent(name)}`;
}

export const resolvedSteps: ResolvedStep[] = steps.map(({ song, media, ...step }) => {
  const resolved: ResolvedStep = step;

  if (song) {
    resolved.song = {
      ...song,
      image: lookup(songImages, "songs", song.image),
      audio: publicUrl("audio", song.audio)
    };
  }

  if (media) {
    resolved.media = {};

    if (media.video) resolved.media.video = publicUrl("videos", media.video);

    if (media.images) {
      resolved.media.images = media.images.map(image => lookup(noteImages, "notes", image));
    }
  }

  return resolved;
});
