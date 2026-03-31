# The Daily Task

A lightweight, fully local todo & recurring events tracker. All data stays on your machine in plain JSON files — no accounts, no cloud sync, no third-party dependencies.

[中文说明 →](README.zh.md)

## Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | Python + FastAPI + uvicorn, plain JSON file persistence |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v3 |
| Fonts | Playfair Display (serif headings), Lora (body), JetBrains Mono (monospace) |
| Image export | html-to-image (toPng) |

## Features

**Tasks**
- Add todos with an optional due date (minute-level precision) and tags
- Filter by status (all / pending / done) and by tag
- Due date shown as relative time (Today / 3d / 2w / 1d ago) with full date on the right
- Overdue tasks highlighted in red
- Inline editing; form state is preserved across submits
- Edit/delete buttons appear on hover as an absolute overlay — they don't shift other content

**Recurring Events**
- Three repeat types: yearly, monthly, weekly
- Configurable advance reminder window; upcoming events are highlighted
- List sorted by next occurrence date
- Inline editing

**Calendar**
- Month view: 7-column grid, click a day to expand its items
- Year view: 4×3 mini-calendar grid, click a month to navigate to it
- Monthly receipt export: thermal-receipt-style long image with flex layout for proper right-aligned numbers, exported as PNG via html-to-image

**Global**
- Dark / light mode via CSS custom properties (`html.dark` class swap — all components adapt automatically)
- Shared tag system across tasks and recurring events; TagPicker supports creating new tags inline
- Active tab persisted to localStorage; deletions don't reset navigation
- Favicon: newsprint-style SVG (paper background, ink-colour serif T)

## Requirements

- **Python 3.11+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **uv** (recommended Python package manager) — or plain `pip`

## First-time Setup

### 1. Install backend dependencies

```bash
cd backend
pip install fastapi "uvicorn[standard]"
```

Or with uv:

```bash
cd backend
uv sync
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install root dev dependencies (for `npm start`)

```bash
# in project root
npm install
```

## Running

### Windows — double-click

Double-click **`launch.bat`** in the project root. It will:

1. Start the backend (port 8000) and frontend (port 5173) as hidden background processes
2. Wait a few seconds, then open `http://localhost:5173` in your browser
3. Show a console window — press any key there to stop everything

Logs are written to `logs/backend.log` and `logs/frontend.log`.

### Linux / macOS — terminal

```bash
./start.sh
```

Press `Ctrl+C` to stop both servers.

### Any platform — npm

```bash
# in project root
npm start
```

Then open `http://localhost:5173`.

## Data

Data is stored in `backend/data/` as plain JSON:

| File | Contents |
|------|----------|
| `todos.json` | All tasks (title, due date, tags, done status) |
| `recurring.json` | Recurring events (birthdays, etc.) |

These files are created automatically on first run. Back them up or sync them however you like.

## Project Structure

```
todo/
├── launch.bat              # Windows launcher (double-click)
├── _start_servers.ps1      # Called by launch.bat — starts processes with hidden windows
├── _run_backend.bat        # Called by _start_servers.ps1 — starts uvicorn, pipes to log
├── _run_frontend.bat       # Called by _start_servers.ps1 — starts Vite, pipes to log
├── start.sh                # Linux/macOS launcher
├── package.json            # Root-level npm start (uses concurrently)
├── logs/                   # Runtime logs (gitignored)
│
├── backend/
│   ├── main.py             # FastAPI app — CRUD for /api/todos and /api/recurring
│   ├── pyproject.toml      # Python dependencies
│   └── data/               # JSON data files (gitignored)
│       ├── todos.json
│       └── recurring.json
│
└── frontend/
    ├── public/favicon.svg
    ├── index.html
    └── src/
        ├── App.tsx                     # Root component, data loading, tab routing, dark mode
        ├── api.ts                      # HTTP request wrappers
        ├── types.ts                    # Todo / RecurringEvent type definitions
        ├── index.css                   # CSS variables, global styles, dot-grid background
        ├── utils/dateUtils.ts          # Date formatting and recurring-event utilities
        └── components/
            ├── Header.tsx              # Masthead, tabs, dark mode toggle
            ├── TodoView.tsx            # Task list page with add form and filter bar
            ├── TodoItem.tsx            # Single task row with inline edit
            ├── RecurringView.tsx       # Recurring events list page
            ├── RecurringItem.tsx       # Single recurring event row with inline edit
            ├── CalendarView.tsx        # Month/year calendar, receipt export
            ├── MonthReceipt.tsx        # Thermal-receipt PNG export component
            ├── TagBadge.tsx            # Tag display chip
            └── TagPicker.tsx           # Tag selector with inline new-tag input
```

## Platform-specific trimming

If you only run on one platform, unused files can be deleted:

**Windows only** — delete:
```
start.sh
package.json        (root-level)
package-lock.json   (root-level)
node_modules/       (root-level)
```

**Linux / macOS only** — delete:
```
launch.bat
_start_servers.ps1
_run_backend.bat
_run_frontend.bat
```
