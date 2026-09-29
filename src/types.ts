export interface Song {
  /** File name in `public/assets/audio`. */
  audio: string;
  title: string;
  artist: string;
  /** File name in `src/assets/images/songs`. */
  image: string;
  /** Second of the track at which playback starts. */
  startTime: number;
}

export interface Media {
  /** File name in `public/assets/videos`. */
  video?: string;
  /** File names in `src/assets/images/notes`. */
  images?: string[];
}

export interface Location {
  title: string;
  city: string;
  /** `[latitude, longitude]` */
  center: [number, number];
  zoom: number;
}

export interface Step {
  /** Seconds the step stays on screen before advancing. */
  duration: number;
  location: Location;
  song?: Song;
  lyrics?: string[];
  media?: Media;
}

/** A step with its file names resolved to URLs the browser can load. */
export interface ResolvedStep extends Omit<Step, "song" | "media"> {
  song?: Omit<Song, "image" | "audio"> & { image: string; audio: string };
  media?: { video?: string; images?: string[] };
}
