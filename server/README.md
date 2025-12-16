# Server

Express.js API server with CockroachDB backend.

## Quick Start

```bash
node index.js
```

Runs on `http://localhost:3000` (binds to `0.0.0.0` for local network access).

## Environment

Create a `.env` file:

```env
PORT=3000
DATABASE_URL=<your-cockroachdb-connection-string>
```

## Project Structure

```
server/
├── index.js        # Express app setup, middleware, route mounting
├── db.js           # PostgreSQL connection pool (pg)
├── logger.js       # File logging utility
├── routes/
│   ├── habits.js   # Habit definitions and entries
│   ├── tasks.js    # Todo tasks with batch operations
│   ├── diary.js    # Journal entries and questions
│   ├── lists.js    # Lists with items
│   ├── next.js     # Ideas/notes cards
│   └── vlogs.js    # Weekly video reflections
└── server.log      # Request logs
```

## Database Schema

All data is stored in **CockroachDB**. The following tables are used:

| Table | Purpose |
|-------|---------|
| `habits` | Habit definitions (name, order, default_time, active, comment) |
| `entries` | Habit entries by date (habit_id, date, state, timestamp) |
| `tasks` | Todo items (text, date, category, state, order) |
| `questions` | Journal prompts (text, order, active, date for ad-hoc) |
| `diary_entries` | Journal answers (date, question_id, answer) |
| `lists` | List containers (title, color, order) |
| `list_items` | Items within lists (list_id, text, completed, position) |
| `next_items` | Ideas/notes cards (title, content, color, size, started_at, deleted_at) |
| `vlogs` | Weekly video reflections (week_start_date, video_url, embed_html) |

## API Reference

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/habits` | Get all active habits (ordered) |
| `GET` | `/habit-entries?from=&to=` | Get entries in date range |
| `POST` | `/habit-entry` | Create/update habit entry |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tasks` | Get all tasks |
| `GET` | `/tasks/week?start=&end=` | Get tasks for date range |
| `GET` | `/tasks/work` | Get only work category tasks |
| `GET` | `/tasks/counts?category=` | Get task counts by state per date |
| `GET` | `/tasks/grouped?category=` | Get tasks grouped by state per date |
| `POST` | `/tasks` | Create a task |
| `PATCH` | `/tasks/:id` | Update a task |
| `DELETE` | `/tasks/:id` | Delete a task |
| `POST` | `/tasks/punt` | Punt task to next day (fail + copy) |
| `POST` | `/tasks/batch/punt` | Batch punt multiple tasks |
| `POST` | `/tasks/batch/fail` | Batch fail multiple tasks |
| `PATCH` | `/tasks/:id/reorder` | Update task order |

### Journal (Diary)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/questions` | Get all active questions |
| `POST` | `/questions` | Create a question |
| `GET` | `/diary` | Get all diary entries (grouped by date) |
| `POST` | `/diary-entries` | Create/upsert diary entry |
| `PATCH` | `/diary-entries/:id` | Update diary entry |
| `DELETE` | `/diary-entries/:id` | Delete diary entry |

### Lists

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/lists` | Get all lists with items |
| `POST` | `/lists` | Create a list |
| `PATCH` | `/lists/:id` | Update list (title, color, items) |
| `DELETE` | `/lists/:id` | Delete list and its items |
| `PATCH` | `/lists/:id/reorder` | Update list order |

### Ideas (Next)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/next` | Get all active ideas |
| `POST` | `/next` | Create an idea |
| `PATCH` | `/next/:id` | Update idea (start, archive, edit) |

### Vlogs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/vlogs/:weekStartDate` | Get vlog for a specific week |
| `POST` | `/vlogs` | Create/update vlog |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check (returns `{ status: 'ok' }`) |

## Logging

All requests are logged to console and `server.log` with:
- Timestamp
- HTTP method and path
- Status code with emoji (✅ success, ⚠️ client error, 🔥 server error)
- Response time in ms
- Query parameters
- Error details (for 4xx/5xx responses)

Health check requests (`/health`) are excluded from logs to reduce noise.
