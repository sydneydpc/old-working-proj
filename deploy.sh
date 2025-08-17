#!/bin/bash

# ============================================
# SAFE DEPLOYMENT SCRIPT WITH BACKUP & ROLLBACK
# ============================================
# This script always creates a backup before deploying
# and can rollback if something goes wrong

# Configuration
SERVER_USER="deploy"
SERVER_IP="209.38.82.88"
REMOTE_PATH="/var/www/sydneydpc.com"
LOCAL_BUILD_DIR="dist"
BACKUP_DIR="/home/deploy/backups"
MAX_BACKUPS=10  # Keep only last 10 backups to save space

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🚀 Safe Deployment Script Starting${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to rollback on error
rollback() {
    echo -e "${RED}❌ Deployment failed! Starting rollback...${NC}"
    ssh $SERVER_USER@$SERVER_IP << ENDSSH
        # Find the latest backup
        LATEST_BACKUP=\$(ls -t $BACKUP_DIR/backup_*.tar.gz 2>/dev/null | head -1)
        
        if [ -z "\$LATEST_BACKUP" ]; then
            echo "❌ No backup found to rollback!"
            exit 1
        fi
        
        echo "🔄 Rolling back to: \$LATEST_BACKUP"
        
        # Clear current files and restore backup
        cd $REMOTE_PATH
        sudo rm -rf *
        sudo tar -xzf "\$LATEST_BACKUP"
        
        # Fix permissions
        sudo chown -R www-data:www-data .
        sudo chmod -R 755 .
        
        # Restart Apache
        sudo systemctl restart apache2
        
        echo "✅ Rollback completed!"
ENDSSH
    exit 1
}

# Step 1: Build the project locally
echo -e "${YELLOW}📦 Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Aborting deployment.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Step 2: Check if dist folder has content
if [ ! -d "$LOCAL_BUILD_DIR" ] || [ -z "$(ls -A $LOCAL_BUILD_DIR)" ]; then
    echo -e "${RED}❌ Build directory is empty! Aborting.${NC}"
    exit 1
fi

# Step 3: Create backup on server BEFORE deploying
echo -e "${YELLOW}💾 Creating backup on server...${NC}"

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    # Create backup directory if it doesn't exist
    mkdir -p /home/deploy/backups
    
    # Create timestamp for backup
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="/home/deploy/backups/backup_$TIMESTAMP.tar.gz"
    
    # Check if site directory has files to backup
    if [ "$(ls -A /var/www/sydneydpc.com 2>/dev/null)" ]; then
        echo "Creating backup: $BACKUP_FILE"
        cd /var/www/sydneydpc.com
        sudo tar -czf "$BACKUP_FILE" .
        sudo chown deploy:deploy "$BACKUP_FILE"
        echo "✅ Backup created successfully"
        
        # Clean up old backups (keep only last 10)
        cd /home/deploy/backups
        ls -t backup_*.tar.gz | tail -n +11 | xargs -r rm -f
        echo "🧹 Old backups cleaned"
    else
        echo "⚠️  No files to backup (directory empty)"
    fi
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backup creation failed! Aborting deployment.${NC}"
    exit 1
fi

# Step 4: Upload new files
echo -e "${YELLOW}📤 Uploading files to server...${NC}"

# Create a tar archive for cleaner upload
tar -czf deploy_temp.tar.gz -C $LOCAL_BUILD_DIR .

# Upload the archive
scp deploy_temp.tar.gz $SERVER_USER@$SERVER_IP:~/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ File upload failed!${NC}"
    rollback
fi

# Step 5: Deploy on server
echo -e "${YELLOW}🔧 Deploying on server...${NC}"

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    set -e  # Exit on any error
    
    # Clear the current directory (we have backup now)
    cd /var/www/sydneydpc.com
    sudo rm -rf * .[^.]*  2>/dev/null || true
    
    # Extract new files
    sudo tar -xzf ~/deploy_temp.tar.gz
    
    # Clean up temp file
    rm -f ~/deploy_temp.tar.gz
    
    # Fix permissions
    sudo chown -R www-data:www-data .
    sudo chmod -R 755 .
    
    # Restart Apache
    sudo systemctl restart apache2
    
    # Test if site is responding
    sleep 2
    if curl -f -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
        echo "✅ Site is responding correctly!"
    else
        echo "❌ Site is not responding!"
        exit 1
    fi
ENDSSH

DEPLOY_STATUS=$?

# Clean up local temp file
rm -f deploy_temp.tar.gz

# Check deployment status
if [ $DEPLOY_STATUS -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed!${NC}"
    rollback
fi

# Step 6: Final verification
echo -e "${YELLOW}🧪 Verifying deployment...${NC}"

# Test the live site
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://sydneydpc.com)

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Deployment successful! Site is live!${NC}"
    echo -e "${GREEN}🌐 Visit: https://sydneydpc.com${NC}"
    
    # Show backup info
    ssh $SERVER_USER@$SERVER_IP "ls -lh $BACKUP_DIR/backup_*.tar.gz | tail -5" 2>/dev/null || true
    echo -e "${GREEN}💾 Recent backups listed above${NC}"
else
    echo -e "${RED}❌ Site returned HTTP $HTTP_STATUS - Starting rollback...${NC}"
    rollback
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

# Reminder about cache
echo -e "${YELLOW}📝 Note: If you don't see changes:${NC}"
echo "   1. Clear browser cache (Ctrl+Shift+R)"
echo "   2. Try incognito/private mode"
echo "   3. Visit: https://sydneydpc.com/?v=$(date +%s)"

# Optional: Show how to manually rollback if needed
echo ""
echo -e "${YELLOW}🔄 To manually rollback, run:${NC}"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   ./rollback.sh"