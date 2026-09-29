# road-trip-story

An interactive story of a trip up the California coast: a map, a route, and a
song, some lyrics, and photos or video for every stop.

Built with [Bun](https://bun.sh), [Vite](https://vite.dev), [Vue](https://vuejs.org),
[Vue Router](https://router.vuejs.org), TypeScript and [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/).

## Pages

Every view has its own URL, so any of them can be linked to directly:

| Path            | View                                                     |
| --------------- | -------------------------------------------------------- |
| `/`             | Welcome screen                                           |
| `/story/:step`  | A stop on the trip, numbered from 1 (e.g. `/story/3`)    |
| `/overview`     | The whole route and the itinerary                        |

Opening a stop directly starts paused, because browsers won't play audio until
the page has been interacted with; press play to start the song.

## Development

```sh
bun install
cp .env.example .env.local   # then add your Mapbox access token
bun run dev
```

The map needs a public [Mapbox access token](https://account.mapbox.com/access-tokens/)
(`pk.…`), provided as `VITE_MAPBOX_ACCESS_TOKEN`. Without a valid one Mapbox GL
refuses to draw anything, and the browser console says so. To use a different
map style, set `VITE_MAPBOX_STYLE` (see `.env.example`).

| Command             | Does                                        |
| ------------------- | ------------------------------------------- |
| `bun run dev`       | Start the dev server                        |
| `bun run typecheck` | Type check the TypeScript and Vue files     |
| `bun run build`     | Type check, then build the site to `dist/`  |
| `bun run preview`   | Serve the built site                        |

## Editing the story

The stops (location, song, lyrics, photos and video) live in [`src/steps.ts`](src/steps.ts).
Photos and album art go in `src/assets/images/`, audio and video in `public/assets/`.

## Deployment

Pushes to `master` are built and deployed to GitHub Pages by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml); pull requests only
check that the site builds. One-time setup in the repository settings:

1. **Settings → Pages → Build and deployment → Source:** *GitHub Actions*.
2. **Settings → Secrets and variables → Actions:** add a `MAPBOX_ACCESS_TOKEN`
   secret containing the public Mapbox token.

The site is served from `/road-trip-story/`. Set `BASE_PATH` when building to change
that (e.g. `BASE_PATH=/` for a custom domain). Because Pages can't route
`/story/3` itself, the build also writes `404.html` as a copy of `index.html`, which
lets the router take over for direct links.
