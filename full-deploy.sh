#!/usr/bin/env bash
set -euo pipefail

# Configuration
SSH_USER="deploy"
SSH_HOST="209.38.82.88"
REMOTE_PATH="/var/www/sydneydpc.com"
BACKUP_ROOT="/var/www/backups"
EXCLUDES=( ".git" "node_modules" "full-deploy.sh" )

timestamp() { date +%Y%m%d%H%M%S; }

### 1. Build Locally
echo "🔨 Building locally..."
npm ci
npm run build

### 2. Create Remote Backup
BACKUP_DATE=$(date +%Y-%m-%d)
BACKUP_PATH="$BACKUP_ROOT/$BACKUP_DATE/sydneydpc.com-$(timestamp)"

echo "📦 Backing up remote site to $BACKUP_PATH..."

ssh "$SSH_USER@$SSH_HOST" bash -s <<EOF
  set -euo pipefail
  mkdir -p "$BACKUP_ROOT/$BACKUP_DATE"
  if [ -d "$REMOTE_PATH" ]; then
    rsync -a "$REMOTE_PATH/" "$BACKUP_PATH/"
    echo "✅ Backup completed to $BACKUP_PATH"
  else
    echo "⚠️  No deploy directory found — skipping backup."
  fi
EOF

### 3. Deploy via rsync with excludes
echo "🚀 Deploying project to $REMOTE_PATH on $SSH_HOST..."

EXCLUDE_FLAGS=()
for pattern in "\${EXCLUDES[@]}"; do
  EXCLUDE_FLAGS+=("--exclude=$pattern")
done

rsync -avz --delete "${EXCLUDE_FLAGS[@]}" ./ "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"

echo "✅ Files deployed via rsync."

### 4. Restart PM2 Process
echo "🔄 Restarting PM2 process 'sydneydpc'..."
if ssh "$SSH_USER@$SSH_HOST" pm2 restart sydneydpc; then
  echo "✅ PM2 process restarted."
else
  echo "❌ PM2 restart failed. Initiating rollback..."
  
  ssh "$SSH_USER@$SSH_HOST" bash -s <<EOF
    set -euo pipefail
    rm -rf "$REMOTE_PATH"
    cp -a "$BACKUP_PATH" "$REMOTE_PATH"
    pm2 restart sydneydpc
    echo "✅ Rollback complete to $BACKUP_PATH"
EOF
  exit 1
fi

echo "🎉 Deployment successful!"