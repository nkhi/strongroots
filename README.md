# ▶️ Start

Start Menu, aka Start, is my personal dashboard for Habit tracking, Todos, Notes, Journal Entries, Lists, and Goals. 

I serve this on my local network and access it across different devices. I remixed [Daylight](https://github.com/bakkenbaeck/daylight-web) as a screensaver. I resurrected [Nook](https://github.com/micaiah-buttars/nook) to play background music every hour from Animal Crossing. I also integrated [Cap](https://github.com/CapSoftware/Cap) to record weekly vlogs. _There's also a work mode with restricted data fetching to keep my personal data off the corporate VPN._

This app exists to make it easy to iterate on *how* I organize myself. Ideally, building a bespoke UX and feature set will encourage consistency in reflection and growth. 

## Design

**Start** is built around a few core principles:

1. **Single source of truth** - One app for all your personal organization
1. **Private** - Self-hosted behind a homelab VPN network, no public internet
2. **Minimal friction** - Quick to open, quick to use
3. **Visual clarity** - Clean design with meaningful colours and icons
4. **Daily focus** - Emphasizes today while tracking long-term progress

## Features

### 📊 **Habits**

<details>
  <summary>Track your daily habits with convenient rollup metrics.</summary>

- **Sunday Reflection**: Record an end-of-week video reflection using the built-in **Loom SDK recorder**
- **Flexible categories**: morning, night, exercise, health, weekdays, etc with icon differentiation and quick filtering
- **Collapsible week views** See weekly progress rolled up over time
- **State tracking**: Customizable states: ✅ Done, ❌ Failed, 🙂 Failed with exception, or 🫤 Succeeded Poorly

<img src="assets/habits.gif" width="600" alt="habits">

</details>

### ✅ **Todos**
<details>
  <summary>Daily task management separated by Life and Work. Inspired by https://tweek.so/ </summary>
   
- **Drag and drop** - easily move tasks between status accordions, or to the graveyard
- **Easy task punting** - move incomplete tasks to the next day
- **Days punted counter** - display how many days I've procrastinated lol
- **Task Graveyard** - persist tasks without being assigned to a date for later
- **Status sorting** - unfinished tasks always appear first
- **Work life balance** - lol. Tasks are split into two columns: life and work. When `?w` is added to the URL, only work tasks are shown/fetched.

<img src="assets/todos.png" width="600" alt="todos">
<img src="assets/todos-week.png" width="600" alt="todos week view">

</details>

### 💭 **Memos**
<details>
  <summary>Integrated Memos as an iFrame for quick thoughts and notes.</summary>

Better than a notes app where everything gets lost. Memos has search, hashtags, date-filters, and more.

<img src="assets/memos.png" width="600" alt="memos">

</details>

### 📔 **Journal**
Daily check-ins with thoughtful prompts worth asking every day.

### 📝 **Lists**
Organize ideas and groups of thoughts that belong together. Looks like Todoist Kanban view. **Perfect for**: Groceries, Furniture ideas, Movie watchlists.

### 🌱 **Grow**
Google Keep-style cards for ideas on what to do next. Mosaic tile layout with variable colors and tile sizes. 

### ☀️ **Daylight** (Bonus/Screensaver)
<details>
  <summary>Sun position visualizer as a screensaver.</summary>

[Daylight by bakkenbaeck](https://daylight.today/app/) is a simple, beautiful sun position visualizer powered by `sunCalc`, a React library that returns the suns location based on your timezone, and I've been using their website for years. [Since it's open source](https://github.com/bakkenbaeck/daylight-web), I decided to fork it to add more color schemes, more icons, more sayings, and fixed lines to mark the 9-5 and bedtime. I also zoomed in a bit, which is really satisfying. It acts as a nice screensaver that you can leave on all day.

<img src="/assets/demo.gif" width="600" alt="daylight demo">

</details>


## Getting Started

### Prerequisites

By the end of this setup, you'll have:
- **Bun** installed on your computer (runtime & package manager)
- **PostgreSQL** running in a Docker container

You'll need:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) - for running PostgreSQL

### Installation Steps

<details>
<summary><strong>Click to expand</strong></summary>

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd start
   ```

2. **Install Bun** (if not already installed)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. **Install dependencies**
   ```bash
   bun install --cwd client
   bun install --cwd server
   ```

4. **Configure environment variables**
   
   Copy the example files and update the password:
   ```bash
   cp .env.example .env && cp server/.env.example server/.env && cp client/.env.example client/.env.local
   ```

   Then edit `.env` and `server/.env` to set your password (use the same password in both):
   - In `.env`: update `POSTGRES_PASSWORD=change-me`
   - In `server/.env`: update the password in `DATABASE_URL=postgres://start:change-me@...`

5. **Configure Google Calendar** (Optional)

   To display Google Calendar events, uncomment and configure in `server/.env`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./google-calendar-key.json
   GOOGLE_CALENDAR_ID=you-can-find-this-in-the-calendar-settings-usually-it-is-your-email-address
   ```
   
   You'll need to:
   - Create a Google Cloud project and enable the Calendar API
   - Create a service account and download its JSON key to `server/`
   - Share your calendar with the service account email
   
   See [Server Documentation](server/README.md#google-calendar-setup-optional) for detailed steps.

6. **Start the app**
   ```bash
   ./go.sh
   ```

   This will:
   - Start Docker Desktop automatically (macOS only)
   - Start the PostgreSQL Docker container
   - Wait for PostgreSQL to be healthy
   - Start the API server on `http://localhost:3000`
   - Start the client on `http://localhost:5173`
   - Open your browser automatically

   > **Note:** Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) to be installed.

   **That's it!** If you're just running this locally on your own machine, you're done. 🎉

</details>

<!-- 7. **Want to access from other devices?** (Optional)

   If you want to access Start from your phone, laptop, or other devices—without exposing it to the public internet—you'll need to set up a VPN tunnel. I use Tailscale with a self-hosted Headscale control server.

   This is completely optional and separate from Start itself. See [🏠 Self-Hosted & Private](#-self-hosted--private) below for details on my homelab setup. -->

## 🏠 Self-Hosted & Private

I want to own my data. Nothing is stored in the cloud—everything lives on my own hardware.

### Tabular Data → PostgreSQL

Habits, todos, journal entries, and all other structured data lives in a **PostgreSQL** database running in Docker on my home server.

### Video & Media → Cap + MinIO

For video recordings (weekly vlogs, screen recordings), I self-host **[Cap](https://cap.so/)**—an open-source screen recorder and video sharing platform. Both Cap and **[MinIO](https://min.io/)** (S3-compatible object storage) run as Docker containers on my home server.

This means:
- **No cloud subscriptions** — Cap works without paying for their hosted storage
- **Videos stay local** — All recordings are stored on a media drive attached to my home server
- **S3-compatible API** — Cap talks to MinIO the same way it would talk to AWS S3

<!-- ### How it works:

The app runs on a **Mac mini** at home (my "homelab server"). It's not exposed to the public internet—it only binds to a private Tailscale IP address. This IP is part of a WireGuard VPN mesh network managed by **[Headscale](https://github.com/juanfont/headscale)**. Only devices I've authenticated and added to the mesh can reach the server.

### Why Headscale?

**Tailscale** creates encrypted WireGuard tunnels between devices, but requires their cloud service (which sees connection metadata).

**Headscale** is an open-source, self-hosted Tailscale control server. Same VPN functionality, but everything stays on my own hardware—no accounts, no metadata shared, no cloud dependency.

### Architecture:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                               HOME SERVER                                  │
│                                                                            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │   Headscale   │  │   Postgres    │  │   Start App   │  │unrelated app │ │
│  │   [Docker]    │  │[Docker/go.sh] │  │ [Bun/go.sh]   │  │   [Docker]   │ │
│  └───────────────┘  └───────────────┘  └───────────────┘  └──────────────┘ │
│         │                                                        │         │
│         └─────────────────── WireGuard VPN ──────────────────────┘         │
│                                    │                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │ encrypted tunnel
                         ┌───────────┴───────────┐
                         │                       │
                    ┌────┴────┐            ┌────┴────┐
                    │  Phone  │            │ Laptop  │
                    └─────────┘            └─────────┘
```

All services on the home server are accessible via the VPN. Headscale handles authentication; WireGuard handles encryption. -->

## Documentation

| Section | Description |
|---------|-------------|
| 📖 [**Client Documentation**](client/README.md) | Frontend setup, project structure, components, and features |
| 🔧 [**Server Documentation**](server/README.md) | API reference, database schema, and backend details |

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, TypeScript, Vite, CSS Modules, [Phosphor Icons](https://phosphoricons.com/) |
| **Backend** | Express, TypeScript, [Bun](https://bun.sh/) |
| **Database** | PostgreSQL (Docker) |
| **Integrations** | Google Calendar API, [Cap](https://cap.so/) + [MinIO](https://min.io/) |

## Private Data

All data is stored in your own PostgreSQL database. Multi-device access uses Headscale/Tailscale for encrypted WireGuard tunnels - no data is exposed to the public internet. Nothing is sent to external servers except what you explicitly configure (like Loom for video reflections).

## Acknowledgments

**Open Source:**
- [Memos](https://github.com/usememos/memos) - For the  note-taking experience (iframe)
- [Daylight](https://daylight.today/app/) - For the sun position screensaver inspiration (remade)
- [Cap](https://cap.so/docs/self-hosting) - For the video recording experience (iframe)
- [MinIO](https://github.com/minio/minio) - todo - For local media storage (infrastructure)
- [Headscale](https://github.com/juanfont/headscale) - Wireguard Control Server so no Tailscale account required

**Libraries:**
- [Phosphor Icons](https://phosphoricons.com/) - For beautiful, consistent icons
- [Loom SDK](https://www.loom.com/sdk) - For seamless video recording
- [Google Calendar API](https://developers.google.com/calendar/overview) - For calendar integration

**Inspiration:**
- [Tweek](https://tweek.so/) - Todos
- [BeaverHabits](https://beaverhabits.com/) - Habit tracking
- [Nook](https://github.com/mn6/nook-desktop) - Animal Crossing background music

