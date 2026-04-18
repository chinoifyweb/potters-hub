# syntax=docker/dockerfile:1.6
#
# Potter's Hub — Next.js 14 production image
# Multi-stage build: deps -> builder -> runner
#
# Build:  docker build -t potters-hub .
# Run:    docker run --rm -p 3000:3000 --env-file .env.local potters-hub
#

# ---------- Stage 1: install dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /app

# libc compat for some npm packages (e.g. prisma, sharp) on alpine
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN npm ci --legacy-peer-deps


# ---------- Stage 2: build the app ----------
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build


# ---------- Stage 3: runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy built artifacts
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next           ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules    ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json    ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma          ./prisma

USER nextjs

EXPOSE 3000

# Start Next.js
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
