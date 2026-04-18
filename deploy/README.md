# Deploying Potter's Hub to Your Own VPS

This guide walks you through moving Potter's Hub off Vercel and hosting it on your own VPS (virtual private server). It is written for someone who can SSH into a server and edit files, but is not a professional developer.

Domain: `tphc.org.ng`
Repo: `https://github.com/chinoifyweb/potters-hub`

---

## TL;DR — the fastest path

```
1. SSH into VPS:        ssh root@YOUR_VPS_IP
2. Run setup:           curl -sL https://raw.githubusercontent.com/chinoifyweb/potters-hub/master/deploy/setup.sh | bash
3. Edit env vars:       nano /var/www/potters-hub/.env.local
4. Deploy:              cd /var/www/potters-hub && bash deploy/deploy.sh
5. Point DNS:           A record  tphc.org.ng  ->  YOUR_VPS_IP
                        CNAME     www          ->  tphc.org.ng
6. Get SSL (if setup skipped it):
                        sudo certbot --nginx -d tphc.org.ng -d www.tphc.org.ng
```

That's it. The rest of this file explains every step and how to handle common issues.

---

## 1. Prerequisites

- A VPS running **Ubuntu 22.04 or 24.04** (providers: Hetzner, DigitalOcean, Contabo, Linode, etc.)
- **Minimum 2 GB RAM** (4 GB recommended — Next.js builds need memory)
- **At least 20 GB disk**
- **SSH access** to the server as `root` or a user with `sudo`
- **DNS control** for your domain `tphc.org.ng` (so you can change A records)
- The server has a public IP address

---

## 2. Detailed setup walkthrough

### Step 1 — SSH into your server

From your own computer (Windows PowerShell, macOS Terminal, or Linux terminal):

```
ssh root@YOUR_VPS_IP
```

If your VPS provider gave you a different username (e.g. `ubuntu`), use that instead.

### Step 2 — Run the one-shot setup script

Once logged in, run:

```
curl -sL https://raw.githubusercontent.com/chinoifyweb/potters-hub/master/deploy/setup.sh | bash
```

This installs:

- Node.js 20
- PM2 (keeps the app running forever, even after reboots)
- Nginx (web server — handles traffic and SSL)
- Certbot (free SSL certificates from Let's Encrypt)
- Git
- Clones the repo to `/var/www/potters-hub`
- Sets up Nginx to forward traffic to the Next.js app
- Tries to get an SSL certificate (will fail if DNS isn't set — that's OK, you can redo it later)

It takes 5–10 minutes.

### Step 3 — Fill in environment variables

The setup script creates an empty `.env.local` file. Open it:

```
nano /var/www/potters-hub/.env.local
```

Fill in every value. **See section 3 below for the full list.** Save with `Ctrl+O`, `Enter`, then exit with `Ctrl+X`.

### Step 4 — First deploy

```
cd /var/www/potters-hub
bash deploy/deploy.sh
```

This pulls the latest code, installs packages, generates the Prisma client, builds the Next.js app, and starts it with PM2. First build takes 3–5 minutes.

### Step 5 — Point DNS

In your domain registrar's DNS dashboard:

| Type  | Name            | Value                     |
|-------|-----------------|---------------------------|
| A     | `tphc.org.ng` (or `@`) | `YOUR_VPS_IP`      |
| CNAME | `www`           | `tphc.org.ng`             |

DNS changes can take 5 minutes to a few hours to propagate. You can test with `ping tphc.org.ng` — when it returns your VPS IP, DNS is ready.

### Step 6 — Get the SSL certificate (if setup skipped it)

Once DNS is pointing to the server:

```
sudo certbot --nginx -d tphc.org.ng -d www.tphc.org.ng
```

Certbot sets up HTTPS automatically and configures Nginx to redirect HTTP to HTTPS. It also sets up auto-renewal (certificates renew every 60 days by themselves).

Visit `https://tphc.org.ng` — your site should load.

---

## 3. Environment variables you need

Open `/var/www/potters-hub/.env.local` and fill in every value below. Do NOT leave quotes around values unless shown.

```
# Database (from Supabase → Project Settings → Database → Connection string)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=generate-a-long-random-string
NEXTAUTH_URL=https://tphc.org.ng

# Supabase (from Supabase → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Paystack (from Paystack Dashboard → Settings → API Keys)
PAYSTACK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx

# Email (from Resend dashboard → API Keys)
RESEND_API_KEY=re_xxxxx

# App
NEXT_PUBLIC_APP_URL=https://tphc.org.ng

# SMS (from Termii dashboard)
TERMII_API_KEY=xxxxx
TERMII_SENDER_ID=TPHC
```

Tips:

- `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` **must be `https://tphc.org.ng`** in production (not localhost, not a Vercel URL).
- Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32` (any long random string works).
- Use Paystack **live** keys (`sk_live_`, `pk_live_`) for real payments. Test keys (`sk_test_`) only take fake money.

After editing env vars, run `bash deploy/deploy.sh` again to apply them.

---

## 4. DNS configuration

Log into your domain registrar (Namecheap, GoDaddy, whoever sold you `tphc.org.ng`).

Delete any old A or CNAME records pointing to Vercel, then add:

```
Type: A        Host: @      Value: YOUR_VPS_IP   TTL: 300
Type: CNAME    Host: www    Value: tphc.org.ng   TTL: 300
```

Wait for propagation (usually under an hour). Test:

```
dig tphc.org.ng +short
```

should return your VPS IP.

---

## 5. How to deploy updates

Whenever you push new code to `master` on GitHub, deploy with:

```
ssh root@YOUR_VPS_IP
cd /var/www/potters-hub
bash deploy/deploy.sh
```

The script pulls the latest code, rebuilds, and reloads the app with zero or near-zero downtime.

---

## 6. How to view logs

```
pm2 logs potters-hub          # live log stream
pm2 logs potters-hub --lines 200   # last 200 lines
pm2 monit                     # full-screen monitor
```

Press `Ctrl+C` to exit.

Nginx logs:

```
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 7. How to restart

```
pm2 restart potters-hub       # just restart the app
pm2 reload potters-hub        # zero-downtime reload
sudo systemctl reload nginx   # reload web server (after nginx config changes)
```

To see what's running:

```
pm2 list
```

---

## 8. Troubleshooting

### 502 Bad Gateway

The Next.js app isn't responding. Check PM2:

```
pm2 list
pm2 logs potters-hub --lines 100
```

If the app is `errored` or `stopped`, something broke during startup — usually a missing env var or a database connection issue. Fix the issue and run `pm2 restart potters-hub`.

### "Cannot find module" or "ERR_MODULE_NOT_FOUND"

Something is out of sync. From the project root:

```
cd /var/www/potters-hub
rm -rf node_modules .next
npm ci --legacy-peer-deps
npx prisma generate
npm run build
pm2 restart potters-hub
```

### "Unexpected token '<', <!DOCTYPE..." in the browser console

The browser received HTML where it expected JSON — usually means the app crashed and Nginx is showing an error page. Check `pm2 logs potters-hub`.

### SSL certificate issues / "certificate expired"

Let's Encrypt renews automatically, but if it's broken:

```
sudo certbot renew
sudo systemctl reload nginx
```

To force a fresh certificate:

```
sudo certbot --nginx -d tphc.org.ng -d www.tphc.org.ng --force-renewal
```

### Database connection errors

Check `DATABASE_URL` in `.env.local`. Supabase has two URLs — use the **pooled** one for `DATABASE_URL` and the **direct** one for `DIRECT_URL`. After fixing, run `bash deploy/deploy.sh` (or just `pm2 restart potters-hub` if you only changed env vars).

### Out of memory during `npm run build`

Common on 2 GB VPS. Temporarily enable swap:

```
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Then rerun `bash deploy/deploy.sh`.

### App won't start after reboot

PM2 should auto-start. If it didn't:

```
pm2 resurrect
```

If that doesn't work, re-run:

```
pm2 startup systemd -u $USER --hp /home/$USER
# Copy-paste the command it prints, then:
cd /var/www/potters-hub
pm2 start ecosystem.config.js
pm2 save
```

---

## 9. Removing Vercel

Once `https://tphc.org.ng` is working on your VPS and you've confirmed everything looks good for a couple of days, you can clean up Vercel:

1. Log in at `https://vercel.com`.
2. Open your Potter's Hub project.
3. Go to **Settings → Domains**. Remove `tphc.org.ng` and `www.tphc.org.ng`. (If you don't, Vercel keeps trying to serve them.)
4. Go to **Settings → Git**. Disconnect the GitHub integration so new pushes don't redeploy to Vercel.
5. (Optional, after you're fully confident) Go to **Settings → General**, scroll to the bottom, and click **Delete Project**.

Also delete `vercel.json` from the repo root — it's no longer needed. On the VPS:

```
cd /var/www/potters-hub
rm -f vercel.json
git add -A
git commit -m "Remove vercel config"
git push origin master
```

(Or do it locally from your laptop and push.)

---

## 10. Where things live on the server

```
/var/www/potters-hub                  # the app
/var/www/potters-hub/.env.local       # secrets (never commit this)
/var/www/potters-hub/logs/            # PM2 logs
/etc/nginx/sites-available/tphc.org.ng  # nginx config
/etc/letsencrypt/live/tphc.org.ng/    # SSL certificates
~/.pm2/                               # PM2 state
```

---

That's everything. If anything breaks, check `pm2 logs potters-hub` first — 90% of issues show up there.
