# F1 Tracker — Claude Instructions

## Stack
- **React 19** + **Vite 7** + **Tailwind CSS v4** (`@tailwindcss/vite` plugin)
- **react-router-dom** for routing
- **No TypeScript** — plain JS/JSX throughout
- **Vitest** + `@testing-library/react` + `jsdom` for unit tests

## Commands
```bash
npm run dev          # start dev server (with API proxy)
npm run build        # production build → dist/
npm run test         # run all tests once
npm run test:watch   # watch mode
npm run test:coverage  # run with v8 coverage report (thresholds: 90%)
npm run lint         # ESLint
```

## APIs
Both APIs are proxied to avoid CORS — always use relative paths:

| Prefix | Target | Purpose |
|--------|--------|---------|
| `/openf1/v1/...` | `api.openf1.org/v1` | Real-time telemetry (sessions, pit stops, laps) |
| `/jolpica/ergast/f1/...` | `api.jolpi.ca/ergast/f1` | Historical results, standings, schedule |

- Dev proxy: `vite.config.js` → `server.proxy`
- Production proxy: `vercel.json` → `rewrites`
- Never hardcode absolute API URLs in source code

## Key Files
```
src/
  api/
    openf1.js         # getSessions, getDrivers, getLaps, getPitStops, getRaceControl, getStints, getPosition
    jolpica.js        # getConstructorStandings, getDriverStandings, getFullSchedule, getRaceSchedule,
                      # getConstructors, getDriversByConstructor, getRaceResults
  data/
    teamConfig.js     # TEAM_CONFIG, FALLBACK_CONFIG, getTeamTheme(constructorId)
  hooks/
    useTeams.js       # fetches live constructors + drivers per year from Jolpica
    useTeamStats.js   # aggregates DNFs/crashes/engine failures/pit times/reliability
    useStandings.js   # constructor + driver championship points
  components/
    Dashboard.jsx     # main view: year selector, sort, team grid, comparison panel
    TeamCard.jsx      # cartoonish gradient card per team
    TeamDetailModal.jsx  # bottom sheet (mobile) / center modal (desktop) with DNF timeline
    TeamComparison.jsx   # side-by-side bar chart comparison
    CarIcon.jsx       # SVG F1 car with per-team liveries
  test/
    setup.js          # imports @testing-library/jest-dom
```

## Architecture
- Team IDs = Jolpica `constructorId` strings (e.g. `ferrari`, `red_bull`, `mclaren`)
- `useTeams(year)` → fetches live constructors + drivers, merges with `teamConfig` for colors
- `useTeamStats(year, teams)` → sessions → race results → pit stops → aggregated stats per team
- `classifyStatus(status)` → pure function exported from `useTeamStats.js`, maps status strings to `finished | dns | crash | engine | dnf`
- DNF counts: crashes and engine failures are subsets of dnfs (i.e. `dnfs` includes both)
- Pit stops > 120s are filtered out (retirements in pit lane)
- Reliability score = `(starts - dnfs) / starts * 100`, defaults to 100 when no races

## Tailwind Setup
- v4 via `@tailwindcss/vite` plugin — no `tailwind.config.js`
- `@import "tailwindcss"` in `src/index.css`
- Dark theme base: `bg-gray-950`
- CSS keyframe animations defined in `index.css`: `pop-in`, `health-fill`, `badge-pop`, `slide-up`
- Modal animation switches via `@media (min-width: 640px)` between `slide-up` (mobile sheet) and `pop-in` (desktop modal)

## Testing Conventions
- Test files live next to source files (`foo.js` → `foo.test.js`, `Foo.jsx` → `Foo.test.jsx`)
- Mock API modules with `vi.mock('../api/...')` at the top of hook tests
- Mock hooks with `vi.mock('../hooks/...')` in component tests (Dashboard pattern)
- Use `renderHook` + `waitFor` for async hooks
- Coverage thresholds: **90%** for lines, branches, functions, statements
- Do not lower the coverage thresholds

## Multi-Season Support
- `CURRENT_YEAR = new Date().getFullYear()` — auto-expands each year
- `FIRST_YEAR = 2023` (first year OpenF1 has data)
- `teamConfig.js` covers historic team IDs: `alphatauri`, `alfa`, `kick_sauber`, `audi`, `cadillac`
- Never hardcode a specific year in logic; always derive from the `year` prop/state

## Deployment
- **Platform**: Vercel
- **Build**: `npm run build` → `dist/`
- **API proxying in production**: handled by `vercel.json` rewrites (not Vite proxy)
- Do not add `src/main.jsx` or `src/test/**` to coverage includes

## GITHUB

add meaningful commit description always
