# Server

Express.js API server with CockroachDB backend.

## Quick Start

```bash
node index.js
```

Runs on `http://localhost:3000`

## Environment Setup

Create a `.env` file:

```env
PORT=3000
DATABASE_URL=postgresql://...
```

## API Endpoints

### Habits
- `GET /habits` - Get all habits
- `POST /habits` - Create habit
- `PATCH /habits/:id` - Update habit

### Entries
- `GET /entries` - Get all habit entries
- `POST /entries` - Create/update entry

### Tasks
- `GET /tasks` - Get all tasks
- `GET /tasks/week?start=YYYY-MM-DD&end=YYYY-MM-DD` - Get tasks for date range
- `POST /tasks` - Create task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Diary
- `GET /diary` - Get all diary entries
- `POST /diary` - Create/update diary entry

### Questions
- `GET /questions` - Get all journal questions
- `POST /questions` - Create/update question

### Notes (Next/Ideas)
- `GET /notes` - Get all notes
- `POST /notes` - Create note
- `PATCH /notes/:id` - Update note

### Lists
- `GET /lists` - Get all lists
- `POST /lists` - Create list
- `PATCH /lists/:id` - Update list
- `DELETE /lists/:id` - Delete list

### Vlogs
- `GET /vlogs` - Get all vlogs
- `POST /vlogs` - Create vlog

## Database

Uses **CockroachDB** (PostgreSQL-compatible). All data is stored in the cloud database specified in `DATABASE_URL`.

## Logging

Server logs all requests with:
- Method, path, status code
- Response time
- Errors (if any)
