# Interactive wall calendar

Frontend interview challenge: a responsive **wall-calendar** style UI with a hero image, month grid, **date range selection** (start / in-range / end states), and **notes** persisted in `localStorage` (month memo + per-range notes).

## Stack

- [npm](https://npm.sh) (package manager & scripts)
- React 19 + TypeScript + Vite

## Run locally

```bash
cd calendar-challenge
npm install
npm dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Design choices

- **Layout:** On smaller screens the hero, grid, and notes stack; from ~900px up, the hero stays beside the calendar and notes sit under the grid—clean on desktop, thumb-friendly on mobile.
- **Dates:** All keys use local calendar dates (`YYYY-MM-DD`) to avoid UTC off-by-one bugs.
- **Persistence:** Notes are stored in the browser only (no backend), as requested.
- **Range UX:** First tap sets the start; second tap sets the end (order does not matter). A third tap starts a new range.

