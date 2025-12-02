#!/bin/bash

# Data Initialization Script
# This script ensures all required data files exist with proper schema
# before starting the application. It will NOT overwrite existing files.

set -e  # Exit on error

DATA_DIR="$(dirname "$0")/../data"
mkdir -p "$DATA_DIR"

echo "🔍 Checking data files..."

# ============================================
# CSV Files
# ============================================

# habits.csv
if [ ! -f "$DATA_DIR/habits.csv" ]; then
  echo "📝 Creating habits.csv with schema..."
  cat > "$DATA_DIR/habits.csv" << 'EOF'
id,name,order,defaultTime,active,createdDate
EOF
  echo "✅ Created habits.csv"
else
  echo "✓ habits.csv exists"
fi

# entries.csv
if [ ! -f "$DATA_DIR/entries.csv" ]; then
  echo "📝 Creating entries.csv with schema..."
  cat > "$DATA_DIR/entries.csv" << 'EOF'
entryId,date,habitId,state,timestamp
EOF
  echo "✅ Created entries.csv"
else
  echo "✓ entries.csv exists"
fi

# questions.csv
if [ ! -f "$DATA_DIR/questions.csv" ]; then
  echo "📝 Creating questions.csv with schema..."
  cat > "$DATA_DIR/questions.csv" << 'EOF'
id,text,order,active,date
EOF
  echo "✅ Created questions.csv"
else
  echo "✓ questions.csv exists"
fi

# vlogs.csv
if [ ! -f "$DATA_DIR/vlogs.csv" ]; then
  echo "📝 Creating vlogs.csv with schema..."
  cat > "$DATA_DIR/vlogs.csv" << 'EOF'
weekStartDate,videoUrl,embedHtml
EOF
  echo "✅ Created vlogs.csv"
else
  echo "✓ vlogs.csv exists"
fi

# tasks.csv
if [ ! -f "$DATA_DIR/tasks.csv" ]; then
  echo "📝 Creating tasks.csv with schema..."
  cat > "$DATA_DIR/tasks.csv" << 'EOF'
id,text,completed,date,createdAt,category,state
EOF
  echo "✅ Created tasks.csv"
else
  echo "✓ tasks.csv exists"
fi

# next.csv
if [ ! -f "$DATA_DIR/next.csv" ]; then
  echo "📝 Creating next.csv with schema..."
  cat > "$DATA_DIR/next.csv" << 'EOF'
id,title,content,color,size,createdAt,deletedAt,startedAt
EOF
  echo "✅ Created next.csv"
else
  echo "✓ next.csv exists"
fi

# lists.csv
if [ ! -f "$DATA_DIR/lists.csv" ]; then
  echo "📝 Creating lists.csv with schema..."
  cat > "$DATA_DIR/lists.csv" << 'EOF'
id,title,color,createdAt
EOF
  echo "✅ Created lists.csv"
else
  echo "✓ lists.csv exists"
fi

# list_items.csv
if [ ! -f "$DATA_DIR/list_items.csv" ]; then
  echo "📝 Creating list_items.csv with schema..."
  cat > "$DATA_DIR/list_items.csv" << 'EOF'
id,listId,text,completed,createdAt,position
EOF
  echo "✅ Created list_items.csv"
else
  echo "✓ list_items.csv exists"
fi

# diary_entries.csv
if [ ! -f "$DATA_DIR/diary_entries.csv" ]; then
  echo "📝 Creating diary_entries.csv with schema..."
  cat > "$DATA_DIR/diary_entries.csv" << 'EOF'
id,date,questionId,answer,createdAt
EOF
  echo "✅ Created diary_entries.csv"
else
  echo "✓ diary_entries.csv exists"
fi

echo ""
echo "✨ Data initialization complete!"
echo ""
