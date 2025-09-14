#!/bin/bash

# Script to bump version numbers
# Usage: ./bump-version.sh [major|minor|patch] [--auto-commit]

TYPE=${1:-patch}
AUTO_COMMIT=${2:-""}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Bumping $TYPE version...${NC}"

# Get current version before bump
cd emisjon-frontend
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: v$CURRENT_VERSION${NC}"
cd ..

# Bump frontend version
cd emisjon-frontend
npm version $TYPE --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")
cd ..

# Sync backend version with frontend
cd emisjon-backend
npm version $NEW_VERSION --no-git-tag-version --allow-same-version
cd ..

echo -e "${GREEN}✅ Frontend: v$NEW_VERSION${NC}"
echo -e "${GREEN}✅ Backend: v$NEW_VERSION${NC}"

# Auto-commit if flag is provided
if [ "$AUTO_COMMIT" == "--auto-commit" ]; then
    echo -e "${BLUE}📝 Creating commit...${NC}"
    git add emisjon-frontend/package.json emisjon-frontend/package-lock.json emisjon-backend/package.json emisjon-backend/package-lock.json 2>/dev/null
    git commit -m "chore: bump version to v$NEW_VERSION

- Previous version: v$CURRENT_VERSION
- New version: v$NEW_VERSION
- Bump type: $TYPE"
    
    echo -e "${GREEN}✅ Changes committed!${NC}"
    echo -e "${YELLOW}Ready to push to production: git push origin main${NC}"
else
    echo ""
    echo -e "${YELLOW}📝 To commit these changes, run:${NC}"
    echo "git add -A && git commit -m 'chore: bump version to v$NEW_VERSION'"
    echo ""
    echo -e "${YELLOW}Or run with auto-commit:${NC}"
    echo "./bump-version.sh $TYPE --auto-commit"
fi

# Show version change summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Version bump complete: v$CURRENT_VERSION → v$NEW_VERSION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"