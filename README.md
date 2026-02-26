<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/14ldDXbIpEQ-Mxq-FrQXNPgvci67KJAxU

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Protected Streaming (Dev)

To hide raw movie source URLs from the frontend and use short-lived signed playback links:

1. Start secure stream server:
   `npm run dev:stream`
2. In another terminal, start frontend:
   `npm run dev`

Or start both together:

`npm run dev:secure`

## Local Video Source (No YouTube Integration)

This project is configured to play movies from local files (site-native player):

- stream catalog: `server/secureCatalog.mjs`
- file location: `public/videos/<movieId>.mp4`

Example: movie id `115` -> `public/videos/115.mp4`

Optional env vars for stream server:

- `STREAM_SERVER_PORT` (default: `8787`)
- `STREAM_SIGNING_SECRET` (set a long random secret in production)
- `STREAM_TOKEN_TTL_SECONDS` (default: `45`)
- `STREAM_ALLOWED_ORIGIN` (default: `http://localhost:3000`)
- `STREAM_SESSION_IDLE_SECONDS` (default: `120`)
- `STREAM_TOKEN_RATE_LIMIT_PER_MINUTE` (default: `12`)

## DRM Migration (Next Step)

Current setup is "secure signed streaming". For stronger anti-distribution:

1. Package source videos as DASH/HLS encrypted streams.
2. Add license server endpoints (Widevine/FairPlay/PlayReady).
3. Register DRM streams in `server/secureCatalog.mjs` (`kind: "drm"`).
4. Move playback to DRM-capable player flow in frontend.
