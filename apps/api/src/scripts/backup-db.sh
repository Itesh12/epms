#!/bin/bash

# Configuration
DB_NAME="epms"
BACKUP_PATH="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${DB_NAME}_${TIMESTAMP}"

# Create backup directory if not exists
mkdir -p $BACKUP_PATH

echo "🚀 Starting automated backup for $DB_NAME..."

# Run mongodump
# If using a URI, use: mongodump --uri=$MONGODB_URI --out=$BACKUP_PATH/$BACKUP_NAME
mongodump --db=$DB_NAME --out=$BACKUP_PATH/$BACKUP_NAME

if [ $? -eq 0 ]; then
  echo "✅ Backup successfully created at $BACKUP_PATH/$BACKUP_NAME"
  
  # Compress the backup
  tar -czf "$BACKUP_PATH/${BACKUP_NAME}.tar.gz" -C "$BACKUP_PATH" "$BACKUP_NAME"
  
  # Remove raw directory
  rm -rf "$BACKUP_PATH/$BACKUP_NAME"
  
  echo "📦 Compressed to $BACKUP_PATH/${BACKUP_NAME}.tar.gz"
  
  # Optional: Keep only last 7 days of backups
  find $BACKUP_PATH -type f -name "*.tar.gz" -mtime +7 -delete
  echo "🧹 Old backups rotated."
else
  echo "❌ Backup failed!"
  exit 1
fi
