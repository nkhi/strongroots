# ▶️ Start

Start Menu, aka Start, is my personal dashboard for Habit tracking, Todos, Notes, Journal Entries, Lists, and Goals. 

I serve this on my local network and access it across different devices. There's also a work mode with restricted data fetching to keep my personal data off the corporate VPN. I remixed [Daylight](https://github.com/bakkenbaeck/daylight-web) as a screensaver. I resurrected [Nook](https://github.com/micaiah-buttars/nook) to play background music every hour from Animal Crossing. I also integrated [Cap](https://github.com/CapSoftware/Cap) to record weekly vlogs. 

This app exists to make it easy to iterate on *how* I organize myself. Ideally, building a bespoke UX and feature set will encourage consistency in reflection and growth. 

---

## Features

### 📊 **Habits**

<details>
  <summary>Track your daily habits with convenient rollup metrics.</summary>

- **Sunday Reflection**: Record an end-of-week video reflection using the built-in **Loom SDK recorder**
- **Flexible categories**: morning, night, exercise, health, weekdays, etc with icon differentiation and quick filtering
- **Collapsible week views** See weekly progress rolled up over time
- **State tracking**: Customizable states: ✅ Done, ❌ Failed, 🙂 Failed with exception, or 🫤 Succeeded Poorly
</details>

<img src="assets/habits.gif" style="width: 600px"></img>

### ✅ **Todos**
<details>
  <summary>Daily task management, inspired by https://tweek.so/ </summary>
   
- **Drag and drop** - easily move tasks between status accordions, or to the graveyard
- **Easy task punting** - move incomplete tasks to the next day
- **Days punted counter** - display how many days I've procrastinated lol
- **Task Graveyard** - persist tasks without being assigned to a date for later
- **Status sorting** - unfinished tasks always appear first
- **Life/Work**. Tasks are split into two columns: life and work. When `?w` is added to the URL, only work tasks are shown/fetched.
</details>

<img src="assets/todos.png" style="width: 600px"></img>
<img src="assets/todos-week.png" style="width: 600px"></img>


### 💭 **Memos**
[Memos](https://github.com/usememos/memos) `iframe` (which for quick thoughts and notes. Better than a notes app where everything gets lost. Memos has search, hashtags, date-filters, and more.

<img src="assets/memos.png" style="width: 600px"></img>

### 📔 **Journal**
An open journal, plus daily questions to keep records of the day.
[todo screenshot]

### 📝 **Lists**
Lots of stuff is happier as a distinct list - like groceries, furniture ideas, movie watchlists, and any kinds of loose plans.
[todo screenshot]

### 🌱 **Grow**
Google Keep-style tiled cards for larger goals to keep in mind. 
[todo screenshot]

### ☀️ **Daylight** (Bonus/Screensaver)

<details>
  <summary>Sun position screensaver </summary>
  <a href="https://daylight.today/app/">Daylight by bakkenbaeck</a> is a simple, beautiful sun position visualizer powered by `sunCalc`, a React library that returns the sun's location based on your timezone, and I've been using their website for years. <a href="https://github.com/bakkenbaeck/daylight-web">Since it's open source</a>, I decided to fork it to add more colour schemes, more icons, more sayings, and fixed lines to mark the 9-5 and bedtime. I also zoomed in a bit, which is really satisfying. It acts as a nice screensaver that you can leave on all day.
</details>

<img src="assets/todo" style="width: 600px"></img>


### 🎶 **Nook** (Bonus/Background Music)

<details>
  <summary>Animal Crossing music! </summary>
   [Nook by mn6](https://github.com/mn6/nook-desktop) was an app that played Animal Crossing background music, which, like the games, loops cleanly and changes every hour. I remade Nook and put it in the navigation bar.
</details>

<img src="assets/todo" style="width: 600px"></img>



---

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

- **Web Client**: React + TypeScript + Vite
- **API Server**: Express + TypeScript (running on Bun)
- **Runtime/Package Manager**: Bun
- **Database**: CockroachDB (PostgreSQL-compatible)
- **Styling**: CSS Modules with Phosphor Icons

## Privacy

All data is stored in your own CockroachDB instance. Nothing is sent to external servers except what you explicitly configure (like Loom for video reflections).

## Acknowledgments

**Tools:**
- [Phosphor Icons](https://phosphoricons.com/) - For beautiful, consistent icons
- [Loom SDK](https://www.loom.com/sdk) - For seamless video recording
- [Google Calendar API](https://developers.google.com/calendar/overview) - For calendar integration

**Open Source:**
- [Memos](https://github.com/usememos/memos) - For the embedded note-taking experience
- [Daylight](https://daylight.today/app/) - For the sun position screensaver inspiration
- [Cap](https://cap.so/docs/self-hosting) - For the video recording experience

**Inspiration:**
- [Tweek](https://tweek.so/) - Todos
- [BeaverHabits](https://beaverhabits.com/) - Habit tracking
