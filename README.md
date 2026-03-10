# F1 Season Tracker

A cartoonish, game-style Formula 1 season tracker web app built with React + Vite. Tracks constructor and driver stats across any season (2023 onwards) using live public APIs — no API keys required.

---

## Features

- **Multi-season support** — switch between any season from 2023 to present with a year picker
- **Constructor cards** — each team gets a gradient card with their livery colors, a team-specific SVG F1 car, driver info, and championship points
- **DNF detail modal** — click any card to see a full per-race incident timeline: crashes 💥, mechanical failures 🔧, and other retirements 🏳️ with lap numbers
- **Side-by-side comparison** — use the ⚔️ Compare button on any two cards to get a head-to-head stat panel
- **Live stats** — DNFs, crashes, engine failures, average pit stop time, and reliability score all pulled from real race data
- **Cartoonish UI** — pop-in animations, segmented health bars, tilt-on-hover, and game-style stat badges

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Language | JavaScript (JSX) — no TypeScript |
| Routing | react-router-dom (available, not yet used) |

---

## APIs

The app uses two free, public APIs with no authentication.

### OpenF1 (`api.openf1.org`)

Real-time and historical F1 telemetry data. Used for:

| Endpoint | Used for |
|---|---|
| `GET /v1/sessions?year=&session_type=Race` | List of race sessions for a season |
| `GET /v1/drivers?session_key=` | Drivers in a session (number → team mapping) |
| `GET /v1/pit?session_key=` | Pit stop durations per driver |

**Rate limits (free):** 3 req/s, 30 req/min
**Coverage:** 2023 season onwards
**Docs:** https://openf1.org

### Jolpica / Ergast (`api.jolpi.ca`)

Historical F1 results and standings. Used for:

| Endpoint | Used for |
|---|---|
| `GET /ergast/f1/{year}.json` | Full season schedule |
| `GET /ergast/f1/{year}/{round}/results.json` | Per-race finishing status per driver |
| `GET /ergast/f1/{year}/constructors.json` | Constructor list for a season |
| `GET /ergast/f1/{year}/constructorStandings.json` | Championship points per team |
| `GET /ergast/f1/{year}/driverStandings.json` | Championship points per driver |

**Rate limits:** None documented
**Coverage:** 1950 onwards
**Docs:** https://api.jolpi.ca

> Both APIs are proxied through Vite's dev server to avoid CORS issues (see `vite.config.js`). In production you'll need a server-side proxy or a backend.

---

## Project Structure

```
f1-tracker/
├── public/
├── src/
│   ├── api/
│   │   ├── openf1.js          # Fetch helpers for OpenF1 endpoints
│   │   └── jolpica.js         # Fetch helpers for Jolpica/Ergast endpoints
│   │
│   ├── data/
│   │   ├── teamConfig.js      # Season-agnostic team colors & gradients by constructorId
│   │   └── teams.js           # Legacy static 2026 lineup (no longer imported)
│   │
│   ├── hooks/
│   │   ├── useTeams.js        # Fetches real constructors + drivers for a given year
│   │   ├── useTeamStats.js    # Aggregates DNFs, crashes, pit times, reliability per team
│   │   └── useStandings.js    # Constructor & driver championship points
│   │
│   ├── components/
│   │   ├── Dashboard.jsx      # Main view: year picker, sort, grid, comparison panel
│   │   ├── TeamCard.jsx       # Animated cartoonish card per constructor
│   │   ├── CarIcon.jsx        # Team-specific SVG F1 car (side profile)
│   │   ├── TeamDetailModal.jsx # DNF timeline modal with incident breakdown
│   │   └── TeamComparison.jsx  # Head-to-head stat comparison panel
│   │
│   ├── App.jsx                # Root — renders Dashboard
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind import + custom keyframe animations
│
├── vite.config.js             # Vite config with Tailwind plugin + API proxies
├── package.json
└── index.html
```

---

## Setup

### Prerequisites

- Node.js 18+
- npm 9+ (or pnpm / yarn)

### Install & run

```bash
# Clone the repo
git clone <repo-url>
cd f1-tracker

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open http://localhost:5173 in your browser.

### Other commands

```bash
# Production build (outputs to /dist)
npm run build

# Preview the production build locally
npm run preview

# Lint
npm run lint
```

---

## How Data Flows

```
Year selected
    │
    ├─► useTeams(year)
    │       └─ Jolpica: /constructors + /driverStandings
    │          Builds team list with API-correct IDs and driver rosters
    │
    ├─► useTeamStats(year, teams)
    │       ├─ Jolpica: /schedule → completed rounds
    │       │     └─ for each round: /results → DNFs, crashes, engine failures, timeline
    │       └─ OpenF1: /sessions → /pit → average pit stop times
    │
    └─► useStandings(year)
            └─ Jolpica: /constructorStandings + /driverStandings
               Championship points and positions
```

All three hooks run in parallel where possible. Each is independently error-tolerant — a failure in one doesn't break the others.

---

## DNF Classification

Jolpica's `status` field on each race result is mapped to one of four categories:

| Category | Status values matched | Icon |
|---|---|---|
| `finished` | `"Finished"`, `"Lapped"`, `"+N Lap(s)"` | — |
| `crash` | contains `"Collision"`, `"Accident"`, `"Spun off"`, `"Contact"` | 💥 |
| `engine` | contains `"Engine"`, `"Power Unit"`, `"MGU"`, `"Electrical"` | 🔧 |
| `dnf` | anything else (`"Retired"`, `"Gearbox"`, `"Hydraulics"`, …) | 🏳️ |
| `dns` | `"Did not start"`, `"Did not qualify"` | excluded from counts |

**Reliability score** = `(driver-race starts − DNFs) / driver-race starts × 100`
DNS entries are excluded from starts (never raced, not a reliability failure).

---

## Adding a New Season

Nothing needs changing in code. When a new season starts:

1. Jolpica adds the new year's constructors and schedule automatically
2. The year picker in the header auto-includes it once `new Date().getFullYear()` advances
3. If a new team appears with an unknown `constructorId`, it gets a fallback grey gradient — add an entry to `src/data/teamConfig.js` and `src/components/CarIcon.jsx` to give it proper colors

---

## Extending the App

### Add a new stat to team cards

1. Fetch the data in `src/hooks/useTeamStats.js` and add it to the `aggregated[teamId]` object
2. Display it in `src/components/TeamCard.jsx` as a `<StatBadge>`

### Add a new API endpoint

1. Add a fetch helper in `src/api/openf1.js` or `src/api/jolpica.js`
2. The Vite proxy handles CORS automatically for both domains — no config change needed

### Add a new team theme

In `src/data/teamConfig.js`:
```js
your_constructor_id: {
  shortName: 'Display Name',
  bgGradient: 'from-[color] to-[color]',  // Tailwind gradient classes
  textColor: '#FFFFFF',
},
```

In `src/components/CarIcon.jsx`, add an entry to `LIVERIES`:
```js
your_constructor_id: {
  body: '#hex',
  wing: '#hex',
  cockpit: '#hex',
  accent: '#hex',
  nose: '#hex',
},
```

And to `CAR_LABELS`:
```js
your_constructor_id: 'ABC',
```

### Production deployment

The Vite dev proxy only works locally. For production, you need to proxy API requests server-side. Options:

- **Vercel / Netlify** — add rewrite rules in `vercel.json` / `netlify.toml` pointing `/openf1/*` → `https://api.openf1.org/*` and `/jolpica/*` → `https://api.jolpi.ca/*`
- **Express backend** — add two proxy middleware routes
- **Direct fetch** — if both APIs add permissive CORS headers in future, remove the proxy and restore absolute URLs in `src/api/openf1.js` and `src/api/jolpica.js`

---

## Known Limitations

- **OpenF1 2026 data lag** — new season data can take a few hours after a race to appear
- **Driver rosters early in season** — `useTeams` builds the driver list from standings; drivers with 0 points in race 1 may not appear until they score
- **Pit stop data** — OpenF1 pit durations > 120s are filtered out (retirements that stopped in the pit lane skew the average)
- **No offline/cache layer** — every page load re-fetches all data; adding a service worker or localStorage cache would help
