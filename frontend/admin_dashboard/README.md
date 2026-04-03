# SWACHH-AI / Admin Dashboard

## Purpose
A web-based portal built with Next.js 14 for Municipal Administrators. Provides a real-time map of all smart bins, alerts for critical issues, analytics on waste collection, and AI-powered route optimization (A* algorithm) for waste truck dispatch.

## Prerequisites
- Node.js (v18+)

## Setup Steps
1. Navigate to the project directory: `cd admin_dashboard`
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and add your Google Maps API key and Firebase config.

## Run Command
- `npm run dev` (Starts development server on http://localhost:3000)

## Troubleshooting
1. **Map is blank/grey**: You have not provided a valid `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`.
2. **Missing dependencies**: You didn't run `npm install`.
3. **MQTT connection error**: Verify that Mosquitto is running via `docker compose` and WebSocket port 9001 is exposed.
4. **Firebase errors**: Ensure all `PLACEHOLDER_` references are replaced in `.env.local` and `src/lib/firebase.js`.
5. **No Data**: To run in demo mode without real hardware setup, use `?demo=true` in the URL or set `NEXT_PUBLIC_DEMO_MODE=true` in the env file.
