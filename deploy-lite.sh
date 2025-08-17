#!/usr/bin/env bash
set -euo pipefail

# — your SSH key (already set up locally)
SSH_KEY="$HOME/.ssh/id_rsa"

# — update these if anything changes
REMOTE_USER="deployuser"
REMOTE_HOST="209.38.82.88"
REMOTE_DIR="/var/www/html/sdpc"

# — for tiny edits, deploy only build output
LOCAL_DIR="/c/Users/s4lin/Desktop/added-ABN 2x project-bolt-sb1-4ycnuox1/project/dist"

echo "→ Wiping remote folder…"
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "rm -rf $REMOTE_DIR/*"

echo "→ Copying build output…"
scp -i "$SSH_KEY" -r "$LOCAL_DIR/." \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"

echo "✅ Deploy complete. Reload your site."