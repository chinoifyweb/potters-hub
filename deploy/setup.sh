#!/usr/bin/env bash
#
# Potter's Hub — first-time VPS setup
# For a fresh Ubuntu 22.04 / 24.04 VPS.
# Run as root (or with sudo):
#   curl -sL https://raw.githubusercontent.com/chinoifyweb/potters-hub/master/deploy/setup.sh | bash
#
# After this finishes:
#   1. Edit /var/www/potters-hub/.env.local with real values
#   2. Run: cd /var/www/potters-hub && bash deploy/deploy.sh
#   3. Point DNS (A record tphc.org.ng -> this VPS IP)
#   4. Re-run certbot if SSL step was skipped
#
set -euo pipefail

# ---------- colors ----------
GREEN=$'\033[0;32m'
BLUE=$'\033[0;34m'
YELLOW=$'\033[1;33m'
RED=$'\033[0;31m'
BOLD=$'\033[1m'
RESET=$'\033[0m'

section() { echo; echo "${BLUE}${BOLD}########## $* ##########${RESET}"; echo; }
ok()      { echo "${GREEN}OK: $*${RESET}"; }
warn()    { echo "${YELLOW}WARN: $*${RESET}"; }
err()     { echo "${RED}ERROR: $*${RESET}" >&2; }

# ---------- config ----------
REPO_URL="https://github.com/chinoifyweb/potters-hub.git"
APP_DIR="/var/www/potters-hub"
DOMAIN="tphc.org.ng"
WWW_DOMAIN="www.tphc.org.ng"
ADMIN_EMAIL="admin@tphc.org.ng"

# Use sudo when not running as root
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    err "This script must be run as root, or with sudo installed."
    exit 1
  fi
fi

RUN_USER="${SUDO_USER:-$USER}"

# =====================================================================
section "1/8  Updating apt package index"
# =====================================================================
$SUDO apt-get update -y
$SUDO apt-get install -y curl git build-essential ca-certificates gnupg
ok "system packages updated"

# =====================================================================
section "2/8  Installing Node.js 20 (NodeSource)"
# =====================================================================
if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q "^v20"; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
  $SUDO apt-get install -y nodejs
else
  ok "Node.js 20 already installed: $(node -v)"
fi
ok "node: $(node -v)   npm: $(npm -v)"

# =====================================================================
section "3/8  Installing PM2 globally"
# =====================================================================
if ! command -v pm2 >/dev/null 2>&1; then
  $SUDO npm install -g pm2
else
  ok "pm2 already installed: $(pm2 -v)"
fi

# =====================================================================
section "4/8  Installing Nginx + Certbot"
# =====================================================================
$SUDO apt-get install -y nginx certbot python3-certbot-nginx
$SUDO systemctl enable nginx
$SUDO systemctl start nginx
ok "nginx running"

# =====================================================================
section "5/8  Cloning repository to $APP_DIR"
# =====================================================================
$SUDO mkdir -p "$APP_DIR"
$SUDO chown -R "$RUN_USER":"$RUN_USER" "$(dirname "$APP_DIR")"

if [ -d "$APP_DIR/.git" ]; then
  ok "Repo already present — pulling latest"
  cd "$APP_DIR"
  git pull origin master || warn "git pull failed; continuing"
else
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
mkdir -p logs

# =====================================================================
section "6/8  Environment variables"
# =====================================================================
if [ ! -f "$APP_DIR/.env.local" ]; then
  cat > "$APP_DIR/.env.local" <<'EOF'
# Fill these in — then re-run deploy/deploy.sh

# Database (Supabase Postgres)
DATABASE_URL=
DIRECT_URL=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://tphc.org.ng

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Paystack
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# Email (Resend)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://tphc.org.ng

# SMS (Termii)
TERMII_API_KEY=
TERMII_SENDER_ID=
EOF
  warn "Created $APP_DIR/.env.local — EDIT IT before first deploy."
else
  ok ".env.local already exists — leaving it alone."
fi

# =====================================================================
section "7/8  Installing Nginx site config"
# =====================================================================
if [ -f "$APP_DIR/deploy/nginx.conf" ]; then
  $SUDO cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/"$DOMAIN"
  $SUDO ln -sf /etc/nginx/sites-available/"$DOMAIN" /etc/nginx/sites-enabled/"$DOMAIN"
  # Remove default site if present
  $SUDO rm -f /etc/nginx/sites-enabled/default
  $SUDO nginx -t
  $SUDO systemctl reload nginx
  ok "nginx configured for $DOMAIN"
else
  warn "deploy/nginx.conf missing — skipping nginx config"
fi

# =====================================================================
section "8/8  First deploy + PM2 startup + SSL"
# =====================================================================

# Only run first deploy if env vars look filled in
if grep -q "^DATABASE_URL=$" "$APP_DIR/.env.local" 2>/dev/null; then
  warn "Skipping first deploy — DATABASE_URL is empty in .env.local"
  warn "Fill in env vars, then run: cd $APP_DIR && bash deploy/deploy.sh"
else
  cd "$APP_DIR"
  bash deploy/deploy.sh || warn "deploy.sh failed — check output and retry"
fi

# PM2 startup so the app comes back after reboot
pm2 startup systemd -u "$RUN_USER" --hp "/home/$RUN_USER" | tail -n 1 | grep -E "^sudo " | bash || true
pm2 save || true
ok "PM2 configured to start on boot"

# SSL — only attempt if DNS is pointed here
echo
echo "${YELLOW}Attempting to obtain SSL certificate for $DOMAIN${RESET}"
echo "${YELLOW}(DNS must already point to this server — otherwise this will fail and can be retried later)${RESET}"
$SUDO certbot --nginx \
  -d "$DOMAIN" -d "$WWW_DOMAIN" \
  --non-interactive --agree-tos \
  -m "$ADMIN_EMAIL" \
  --redirect || warn "certbot failed — run it manually after DNS is ready:
    sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN"

# =====================================================================
echo
echo "${GREEN}${BOLD}======================================================${RESET}"
echo "${GREEN}${BOLD}  Potter's Hub VPS setup complete                     ${RESET}"
echo "${GREEN}${BOLD}======================================================${RESET}"
echo
echo "Next steps:"
echo "  1. Edit env vars:  nano $APP_DIR/.env.local"
echo "  2. Deploy:         cd $APP_DIR && bash deploy/deploy.sh"
echo "  3. DNS:            A record  $DOMAIN  -> this server's IP"
echo "                     CNAME     www      -> $DOMAIN"
echo "  4. If SSL failed:  sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN"
echo "  5. Visit:          https://$DOMAIN"
echo
echo "Useful commands:"
echo "  pm2 logs potters-hub       — live logs"
echo "  pm2 monit                  — resource monitor"
echo "  pm2 restart potters-hub    — restart app"
echo "  sudo systemctl reload nginx  — reload web server"
echo
