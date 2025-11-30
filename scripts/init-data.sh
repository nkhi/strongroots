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

# ============================================
# JSON Files
# ============================================

# tasks.json
if [ ! -f "$DATA_DIR/tasks.json" ]; then
  echo "📝 Creating tasks.json with schema..."
  cat > "$DATA_DIR/tasks.json" << 'EOF'
{}
EOF
  echo "✅ Created tasks.json"
else
  echo "✓ tasks.json exists"
fi

# diary.json
if [ ! -f "$DATA_DIR/diary.json" ]; then
  echo "📝 Creating diary.json with schema..."
  cat > "$DATA_DIR/diary.json" << 'EOF'
{}
EOF
  echo "✅ Created diary.json"
else
  echo "✓ diary.json exists"
fi

# next.json
if [ ! -f "$DATA_DIR/next.json" ]; then
  echo "📝 Creating next.json with schema..."
  cat > "$DATA_DIR/next.json" << 'EOF'
[]
EOF
  echo "✅ Created next.json"
else
  echo "✓ next.json exists"
fi

# lists.json
if [ ! -f "$DATA_DIR/lists.json" ]; then
  echo "📝 Creating lists.json with schema..."
  cat > "$DATA_DIR/lists.json" << 'EOF'
[]
EOF
  echo "✅ Created lists.json"
else
  echo "✓ lists.json exists"
fi

echo ""
echo "✨ Data initialization complete!"
echo ""
