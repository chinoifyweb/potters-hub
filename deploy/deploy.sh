#!/usr/bin/env bash
#
# Potter's Hub — deploy script
# Run from the project root on the VPS:
#   cd /var/www/potters-hub && bash deploy/deploy.sh
#
set -euo pipefail

# ---------- colors ----------
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
BOLD=$'\033[1m'
RESET=$'\033[0m'

step()    { echo; echo "${BLUE}${BOLD}==> $*${RESET}"; }
success() { echo "${GREEN}OK: $*${RESET}"; }
warn()    { echo "${YELLOW}WARN: $*${RESET}"; }
err()     { echo "${RED}ERROR: $*${RESET}" >&2; }

trap 'err "Deploy failed at line $LINENO. Check output above."' ERR

# ---------- sanity checks ----------
step "Checking environment"
if [ ! -f "package.json" ]; then
  err "package.json not found. Run this script from the project root."
  exit 1
fi
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
  warn ".env.local / .env not found. The app may fail to start without env vars."
fi
mkdir -p logs
success "environment looks fine"

# ---------- pull latest code ----------
step "Pulling latest code from origin/master"
git fetch origin
git pull origin master
success "code updated"

# ---------- install dependencies ----------
step "Installing dependencies"
if [ -f "package-lock.json" ]; then
  echo "Using npm ci (package-lock.json found)"
  npm ci --legacy-peer-deps
else
  echo "Using npm install (no package-lock.json)"
  npm install --legacy-peer-deps
fi
success "dependencies installed"

# ---------- prisma ----------
step "Generating Prisma client"
npx prisma generate
success "prisma client generated"

# If you want migrations applied automatically on each deploy, uncomment:
# step "Applying Prisma migrations"
# npx prisma migrate deploy
# success "migrations applied"

# ---------- build ----------
step "Building Next.js app (this can take a few minutes)"
npm run build
success "build complete"

# ---------- restart with pm2 ----------
step "Reloading app with PM2"
if pm2 describe potters-hub >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save
success "PM2 reloaded and saved"

# ---------- done ----------
echo
echo "${GREEN}${BOLD}=====================================${RESET}"
echo "${GREEN}${BOLD}  Deployment complete — app is live  ${RESET}"
echo "${GREEN}${BOLD}=====================================${RESET}"
echo
echo "Next steps:"
echo "  - View logs:    pm2 logs potters-hub"
echo "  - Live monitor: pm2 monit"
echo "  - Visit:        https://tphc.org.ng"
echo
