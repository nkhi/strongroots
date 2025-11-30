# Scripts Directory

## Data Initialization

### `init-data.sh`

This script ensures all required data files exist with proper schema before the application starts.

**Purpose:**
- Prevents app crashes when starting with an empty or incomplete `data/` directory
- Creates missing data files with correct CSV headers and JSON structure
- **Never overwrites existing files** - only creates missing ones

**Files Managed:**

#### CSV Files (with headers only):
- `habits.csv` - Habit configurations
- `entries.csv` - Habit entry records
- `questions.csv` - Diary question definitions
- `vlogs.csv` - Video log metadata

#### JSON Files (empty structures):
- `tasks.json` - Task data (empty object: `{}`)
- `diary.json` - Diary entries (empty object: `{}`)
- `next.json` - Next items (empty array: `[]`)
- `lists.json` - List data (empty array: `[]`)

**Usage:**

The script is automatically called by `go.sh` before starting the server and client:

```bash
./go.sh
```

You can also run it manually:

```bash
./scripts/init-data.sh
```

**Output:**

When files exist:
```
🔍 Checking data files...
✓ habits.csv exists
✓ entries.csv exists
...
✨ Data initialization complete!
```

When creating files:
```
🔍 Checking data files...
📝 Creating habits.csv with schema...
✅ Created habits.csv
...
✨ Data initialization complete!
```

**Safety:**

- Uses `set -e` to exit immediately on any error
- Only creates files that don't exist
- Creates `data/` directory if it doesn't exist
- All file schemas match the exact structure expected by the API
