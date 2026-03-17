# ⚡ EV Route Planner

> **DAA Capstone Project** — An interactive visualisation of an Electric Vehicle Employee Routing algorithm (CVRP variant), built as a fully client-side Next.js 14 application.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Algorithm](#algorithm)
- [Features](#features)
- [Preset Scenarios](#preset-scenarios)
- [Configuration & Constraints](#configuration--constraints)
- [Component Reference](#component-reference)
- [Type Reference](#type-reference)
- [Design System](#design-system)
---

## Overview

EV Route Planner solves the **Capacitated Vehicle Routing Problem (CVRP)** in the context of electric vehicle employee pickup. Given a fleet of EVs each with a fixed battery range (in km) and a set of employee home locations on a 2D grid, the app:

1. **Assigns** employees to cars using a greedy, farthest-first heuristic
2. **Orders** each car's pickup route using a nearest-neighbour heuristic
3. **Validates** whether each car's battery is sufficient for its assigned route
4. **Visualises** the solution interactively with step-by-step playback on a 2D canvas

All computation runs entirely in the browser — no backend, no API calls, no database.

---

## Live Demo

> Deploy via Vercel with a single click — see [Getting Started](#getting-started).

Preset scenarios are included so you can explore the algorithm immediately without any manual input.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| 2D Canvas | Konva.js (`react-konva`) |
| Charts | Recharts |
| Icons | `lucide-react` |
| Animations | `framer-motion` |
| Font | Inter (Google Fonts) |
| Runtime | Client-side only — no server logic |

---

## Project Structure

```
ev-route-planner/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main single-page layout
│   │   └── layout.tsx            # Font loading, global metadata, favicon
│   │
│   ├── components/
│   │   ├── InputPanel.tsx        # Fleet + employee configuration UI
│   │   ├── Canvas.tsx            # react-konva visualisation canvas
│   │   ├── PlaybackControls.tsx  # Step playback controls + speed slider
│   │   ├── ResultsPanel.tsx      # Status banner, route cards, assignment table
│   │   └── BatteryChart.tsx      # Recharts battery usage comparison chart
│   │
│   ├── lib/
│   │   ├── algorithm.ts          # Core CVRP algorithm (pure TypeScript functions)
│   │   ├── types.ts              # Shared TypeScript interfaces
│   │   └── presets.ts            # 3 built-in test scenarios
│   │
│   └── hooks/
│       └── usePlayback.ts        # Playback state machine (step / play / pause)
│
├── public/
│   └── favicon.ico               # ⚡ electric bolt favicon
│
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ev-route-planner.git
cd ev-route-planner

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npx vercel
```

No environment variables are required — the app is fully static.

---

## Algorithm

All logic lives in `src/lib/algorithm.ts` as pure, side-effect-free TypeScript functions. The implementation is a direct port of the reference Python specification.

### 1. `euclidean(p1, p2)`

Standard Euclidean distance between two 2D points.

```
d = √((x₂ - x₁)² + (y₂ - y₁)²)
```

### 2. `routeDistance(route, origin = [0, 0])`

Computes the total distance traveled along a route starting from `origin`. The car does **not** return to origin — it ends at the last employee's home.

```
total = d(origin → route[0]) + d(route[0] → route[1]) + … + d(route[n-2] → route[n-1])
```

### 3. `nearestNeighborRoute(employeeCoords, origin = [0, 0])`

A greedy nearest-neighbour heuristic for route ordering:

1. Start at `origin`
2. Repeatedly select the closest unvisited employee
3. Return the visit order as a list of employee indices

### 4. `greedyAssign(batteries, employeeCoords)`

Assigns employees to cars using a farthest-first strategy:

1. Sort all employees by their distance from origin in **descending** order (farthest first)
2. For each employee, find the car that:
   - Has **fewer than 4 passengers** already assigned, **and**
   - Would result in the **lowest total route distance** if this employee were added (simulated by running `nearestNeighborRoute` on the current assignment plus this employee)
3. Assign to that car
4. If all cars are at capacity, assign to the **least-full car** as a fallback

### 5. `solveEVRouting(batteries, employeeCoords)`

The top-level solver:

1. Run `greedyAssign` to get car assignments
2. For each car, run `nearestNeighborRoute` on its assigned employees to produce an ordered route
3. Compute `routeDistance` for each car
4. If `distance > battery[car]`, mark that car as **FAILED**
5. Return a `SolveResult` containing assignments, routes, distances, failure flags, and a flat array of `Step` objects for playback

---

## Features

### Input Panel

- **Fleet Configuration** — add up to 8 cars, each with a custom battery range (km)
- **Employee Locations** — add up to 20 employees with `(x, y)` coordinates in the range `[-20, 20]`
- **Preset Scenarios** — three one-click presets to populate inputs instantly
- **Validation** — inline error messages for invalid inputs; a warning banner if total seat capacity is insufficient

### Canvas Visualisation

- **2D grid** from `(-20, -20)` to `(20, 20)` with faint dot pattern background
- **HQ marker** at the origin `(0, 0)` with a glowing white dot
- **Employee dots** coloured by assigned car after solving; gray when unassigned
- **Animated route lines** drawn sequentially per car with directional arrowheads
- **Employee pulse animation** when a car "visits" them during step playback
- **Pan and zoom** via Konva's built-in stage controls
- **Per-car colour legend** below the canvas

### Step-by-Step Playback

- Controls: Reset / Previous / Play-Pause / Next / End
- Speed selector: Slow / Normal / Fast
- Live step counter: `Step N of M`
- Step description card: `"Car 2 picks up Employee 4 at (2, 5) — distance so far: 5.39 km"`
- Each step corresponds to one edge traversal in any car's route

### Results Panel

- **Status banner** — green (`✅ Valid Schedule`) or red (`❌ Not a valid schedule`) with slide-down animation
- **Route cards** — one per car showing battery progress bar, route sequence, and employee chips; red border + badge if battery is insufficient
- **Battery comparison chart** — horizontal Recharts bar chart: battery available vs distance used, per car
- **Assignment table** — sortable table: Employee ID, Home Location, Assigned Car, Visit Order

---

## Preset Scenarios

| Preset | Cars | Employees | Expected Outcome |
|---|---|---|---|
| **Simple Valid** | 2 | 6 | All employees assigned within battery limits |
| **Battery Failure** | 2 | 4 | One or more cars exceed battery range |
| **Large Fleet** | 3 | 10 | Multi-car assignment across a larger grid |

These correspond directly to the test cases from the original Python specification.

---

## Configuration & Constraints

| Parameter | Limit | Notes |
|---|---|---|
| Maximum cars | 8 | Enforced with tooltip |
| Maximum employees | 20 | Enforced in UI |
| Maximum passengers per car | 4 | Hard constraint in `greedyAssign` |
| Battery range | > 0 km | Validated before solving |
| Coordinate range | `[-20, 20]` | Both X and Y axes |
| Minimum to solve | 1 car, 1 employee | Validated before solving |

If total seats (cars × 4) < total employees, a `⚠️ Not enough seats` warning is shown before the user can solve.

---

## Component Reference

### `InputPanel.tsx`

Props: `cars`, `employees`, `onCarsChange`, `onEmployeesChange`, `onSolve`, `solving`

Renders the fleet + employee configuration forms, preset chips, and the Solve button. Handles all input validation and inline error display.

### `Canvas.tsx`

Props: `employees`, `carResults`, `currentStep`, `solved`

Renders the `react-konva` stage. Draws the grid, HQ marker, employee nodes, and route lines. Responds to `currentStep` to animate the active edge and pulse the visited employee node.

### `PlaybackControls.tsx`

Props: `steps`, `currentStep`, `playing`, `speed`, `onStep`, `onPlay`, `onPause`, `onReset`, `onSpeedChange`

Renders the playback button bar, speed slider, step counter, and step description card.

### `ResultsPanel.tsx`

Props: `result`, `employees`, `cars`

Renders the status banner, per-car route cards, assignment table, and hosts the `BatteryChart`.

### `BatteryChart.tsx`

Props: `carResults`, `cars`

Renders a Recharts grouped horizontal bar chart comparing battery available vs distance used per car. Bars are coloured green (within limit) or red (over limit).

### `usePlayback.ts`

```ts
const { currentStep, playing, speed, play, pause, next, prev, reset, goToEnd, setSpeed }
  = usePlayback(steps: Step[])
```

A state machine hook managing step index, play/pause timer, and speed multiplier.

---

## Type Reference

Defined in `src/lib/types.ts`:

```ts
interface Employee {
  id: number;
  x: number;
  y: number;
}

interface Car {
  id: number;
  battery: number;   // km
}

interface CarResult {
  carId: number;
  assignedEmployees: number[];    // employee IDs in visit order
  route: [number, number][];      // coordinates in visit order
  distanceUsed: number;
  failed: boolean;
}

interface SolveResult {
  valid: boolean;
  carResults: CarResult[];
  failedCarIds: number[];
  steps: Step[];
}

interface Step {
  carId: number;
  from: [number, number];
  to: [number, number];
  employeeId: number | null;      // null for HQ → first employee
  distanceSoFar: number;
  description: string;
}
```

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Background | `#0f1117` | Page background |
| Surface | `#1a1d27` | Card backgrounds |
| Accent | `#22d3a5` | Active routes, success states, CTAs |
| Danger | `#f87171` | Battery failures, error states |
| Text primary | `#f1f5f9` | Headings, labels |
| Text muted | `#64748b` | Secondary labels, placeholders |
| Font | Inter | Google Fonts |

Route lines on the canvas use unique muted pastel colours per car (not neon) so multiple routes are visually distinguishable without clashing with the accent palette.

---

### Algorithm complexity

| Phase | Time Complexity |
|---|---|
| Greedy assignment (`greedyAssign`) | O(E² · C) where E = employees, C = cars |
| Nearest-neighbour route (`nearestNeighborRoute`) | O(E²) per car |
| Overall `solveEVRouting` | O(E² · C) |

### Problem modelled

The **Capacitated Vehicle Routing Problem (CVRP)** is NP-hard in general. This implementation uses two polynomial-time heuristics — farthest-first assignment and nearest-neighbour route ordering — to produce a fast, approximate solution suitable for real-time interactive visualisation.

### How It Works (summary)

1. **Phase 1 — Greedy Assignment:** Employees are sorted farthest-to-nearest from HQ. Each is assigned to the car that minimises the simulated route extension, subject to a 4-passenger capacity cap.
2. **Phase 2 — Nearest Neighbour Routing:** Each car's employee list is reordered using a nearest-neighbour traversal starting from HQ to reduce total travel distance.
3. **Battery Validation:** The computed route distance for each car is compared against its battery capacity. Any car that exceeds its range is flagged as FAILED.
4. **Output:** The schedule is marked valid only if all cars are within their battery limits and all employees are assigned.

---

## License

MIT — free to use for academic and personal projects.

---

*Built with ⚡ Next.js 14 · TypeScript · Tailwind CSS · react-konva · Recharts · framer-motion*