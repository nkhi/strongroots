# ▶️ Start

Start Menu, aka Start, is my personal dashboard for Habit tracking, Todos, Notes, Journal Entries, Lists, and Goals. 

I serve this on my local network and access it across different devices. I remixed [Daylight](https://github.com/bakkenbaeck/daylight-web) as a screensaver. I resurrected [Nook](https://github.com/micaiah-buttars/nook) to play background music every hour from Animal Crossing. I also integrated [Cap](https://github.com/CapSoftware/Cap) to record weekly vlogs. _There's also a work mode with restricted data fetching to keep my personal data off the corporate VPN._

This app exists to make it easy to iterate on *how* I organize myself. Ideally, building a bespoke UX and feature set will encourage consistency in reflection and growth. 

---

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Habits** | **Tracking daily habits with convenient rollup metrics.** <br><br>• _Sunday Reflection_: Record an end-of-week video reflection using the built-in _Loom SDK recorder_. <br>• _Category filters_: morning, night, health, etc with icon differentiation and quick filtering. <br>• _Collapsible week views_: See weekly progress rolled up over time. <br>• _State tracking_: Customizable states: ✅ Done, ❌ Failed, 🙂 Failed with exception, or 🫤 Succeeded Poorly. <br>• _Time-sensitive habits_: Set deadlines for habits and get notified when you miss them (once per day, auto-dismiss). |
| ✅ **Todos** | **Daily task management, inspired by [tweek.so](https://tweek.so/).** <br><br>• _Drag and drop_: easily move tasks between status accordions, or to the graveyard. <br>• _Easy task punting_: move incomplete tasks to the next day. <br>• _Days punted counter_: display how many days I've procrastinated lol. <br>• _Task Graveyard_: persist tasks without being assigned to a date for later. <br>• _Status sorting_: unfinished tasks always appear first. <br>• _Life/Work_: Tasks are split into two columns: life and work. When `?w` is added to the URL, only work tasks are shown/fetched. |
| 📅 **Calendar** | Syncs my daily events with Google Calendar API and displays at a glance. Also powers a different status badge in the navigation bar for number of work-related tasks today. |
| 💭 **Memos** | [Memos](https://github.com/usememos/memos) `iframe` for quick thoughts and notes. Better than a notes app where everything gets lost. Memos has search, hashtags, date-filters, and more. Runs on a Docker container.|
| 📔 **Journal** | An open journal, plus daily questions to keep records of the day. |
| 📝 **Lists** | Groceries, furniture ideas, movie watchlists, and any kinds of loose plans. |
| 🌱 **Grow** | Google Keep-style tiled cards for larger goals to keep in mind. |
| 🎯 **Memories** | Dropbox for recording good memories throughout the year for a year-end reflection. |
| 🎞 **Vlogs** | [Cap](https://cap.so/) deployment for weekly recap vlogs and one-off recordings. Runs on a local Docker image. Video is stored on a local [MinIO](https://min.io/) instance saving media on my central server, enabling private and self-owned media storage and transmission. |

<table>
<tr>
<td>

### 📊 **Habits**

<img src="assets/habits.gif" style="width: 600px"></img>

</td>
</tr>
<tr>
<td>

### ✅ **Todos**

<img src="assets/todos.png" style="width: 600px"></img>
<img src="assets/todos-week.png" style="width: 600px"></img>

</td>
</tr>
<tr>
<td>

### 📅 **Calendar**

[todo screenshot]

</td>
</tr>
<tr>
<td>

### 💭 **Memos**

<img src="assets/memos.png" style="width: 600px"></img>

</td>
</tr>
<tr>
<td>

### 📔 **Journal**

[todo screenshot]

</td>
</tr>
<tr>
<td>

### 📝 **Lists**

[todo screenshot]

</td>
</tr>
<tr>
<td>

### 🌱 **Grow**

[todo screenshot]

</td>
</tr>
<tr>
<td>

### 🎯 **Good Moments**

[todo screenshot]

</td>
</tr>
</table>

---

## Extras

| Feature | Description |
|---------|-------------|
| ☀️ **Daylight** | **Sun position screensaver**. <br><br>[Daylight by bakkenbaeck](https://daylight.today/app/) is a simple, beautiful sun position visualizer powered by `sunCalc`, a React library that returns the sun's location based on your timezone, and I've been using their website for years. [Since it's open source](https://github.com/bakkenbaeck/daylight-web), I decided to fork it to add more colour schemes, more icons, more sayings, and fixed lines to mark the 9-5 and bedtime. I also zoomed in a bit, which is really satisfying. It acts as a nice screensaver that you can leave on all day. |
| 🎶 **Nook** | **Animal Crossing background music**! <br><br>[Nook by mn6](https://github.com/mn6/nook-desktop) was an app that played [Animal Crossing background music](https://www.youtube.com/watch?v=9nkoYqYfJkA), which, like the games, loops cleanly and changes every hour. I remade Nook and put it in the navigation bar. |

<table>
<tr>
<td>

### ☀️ **Daylight**

[todo screenshot]

</td>
</tr>
<tr>
<td>

### 🎶 **Nook**

[todo screenshot]

</td>
</tr>
</table>


## Design

**Start** is built around a few core principles:

1. **Single source of truth** - One app for all your personal organization
1. **Private** - Self-hosted behind a homelab VPN network, no public internet
2. **Minimal friction** - Quick to open, quick to use
3. **Visual clarity** - Clean design with meaningful colours and icons
4. **Daily focus** - Emphasizes today while tracking long-term progress

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.0+) - runtime and package manager
- CockroachDB (or any PostgreSQL-compatible database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd habits
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

4. **Configure the database**
   
   Create a `.env` file in the `server/` directory:
   ```bash
   PORT=3000
   DATABASE_URL=<your-cockroachdb-connection-string>
   ```

   Setup a CockroachDB instance. Then run `server/db_utils/table_setup.sql` to create the necessary tables.

5. **Configure Google Calendar** (Optional)

   To display Google Calendar events in the app:
   
   ```env
   # Add to server/.env
   GOOGLE_APPLICATION_CREDENTIALS=./google-calendar-key.json
   GOOGLE_CALENDAR_ID=you-can-find-this-in-the-calendar-settings-usually-it-is-your-email-address
   ```
   
   You'll need to:
   - Create a Google Cloud project and enable the Calendar API
   - Create a service account and download its JSON key to `server/`
   - Share your calendar with the service account email
   
   See [Server Documentation](server/README.md#google-calendar-setup-optional) for detailed steps.

6. **Configure Cap URL** (Optional)

   Create a `.env` file in the `client/` directory:
   ```
   VITE_CAP_URL=your_cap_dashboard
   ```

7. **Start the app**
   ```bash
   ./go.sh
   ```

   This will:
   - Start the API server on `http://localhost:3000`
   - Start the client on `http://localhost:5173`
   - Open your browser automatically

## Documentation

| Section | Description |
|---------|-------------|
| 📖 [**Client Documentation**](client/README.md) | Frontend setup, project structure, components, and features |
| 🔧 [**Server Documentation**](server/README.md) | API reference, database schema, and backend details |

## Tech Stack

- **Web Client**: React, TypeScript, Vite. CSS Modules. Phosphor Icons.
- **API Server**: Express, TypeScript (running on Bun)
- **Runtime/Package Manager**: Bun
- **Database**: CockroachDB (PostgreSQL-compatible)
- **Calendar**: Google Calendar API
- **Video (old)**: Loom SDK (old) + cloud storage.
- **Video (new)**: Cap front-end + local MinIO back-end.

## Private Data

All data is stored in your own CockroachDB instance. Nothing is sent to external servers except what you explicitly configure (like Loom for video reflections).

## Acknowledgments

**Open Source:**
- [Memos](https://github.com/usememos/memos) - For the  note-taking experience (iframe)
- [Daylight](https://daylight.today/app/) - For the sun position screensaver inspiration (remade)
- [Cap](https://cap.so/docs/self-hosting) - For the video recording experience (iframe)
- [MinIO](https://github.com/minio/minio) - For local media storage (infrastructure)

**Libraries:**
- [Phosphor Icons](https://phosphoricons.com/) - For beautiful, consistent icons
- [Loom SDK](https://www.loom.com/sdk) - For seamless video recording
- [Google Calendar API](https://developers.google.com/calendar/overview) - For calendar integration

**Inspirations:**
- [Tweek](https://tweek.so/) - Todos
- [BeaverHabits](https://beaverhabits.com/) - Habit tracking
- [Nook](https://github.com/mn6/nook-desktop) - Animal Crossing background music

