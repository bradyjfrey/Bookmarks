# Multi-stage build for Bookmarks (Next.js standalone + better-sqlite3).
#   deps    — install deps + compile/fetch the native sqlite binary
#   builder — `pnpm build` produces .next/standalone
#   runner  — slim, non-root; standalone bundle + the native module + schema
#
# Sanity-check locally before pushing:
#   docker build -t bookmarks .
#   docker run --rm -p 3000:3000 --env-file .env -e DATABASE_PATH=/data/bookmarks.db -v "$PWD/data:/data" bookmarks
ARG NODE_VERSION=24

############# Stage 1: deps + native build ####################################
FROM node:${NODE_VERSION}-trixie-slim AS deps
WORKDIR /app
# better-sqlite3 falls back to compiling if no prebuilt binary matches.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

############# Stage 2: build ##################################################
FROM node:${NODE_VERSION}-trixie-slim AS builder
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_PATH=/tmp/build.db
RUN pnpm build
# Dereference the pnpm symlinks for the native module + its two deps so the
# runner can resolve `require("better-sqlite3")` from a flat node_modules.
RUN set -e; mkdir -p /native; \
    cp -rL node_modules/better-sqlite3 /native/better-sqlite3; \
    cp -rL node_modules/.pnpm/bindings@*/node_modules/bindings /native/bindings; \
    cp -rL node_modules/.pnpm/file-uri-to-path@*/node_modules/file-uri-to-path /native/file-uri-to-path

############# Stage 3: runner #################################################
FROM node:${NODE_VERSION}-trixie-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs \
 && mkdir -p /data && chown nextjs:nodejs /data
VOLUME /data

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Schema DDL is read at runtime via fs (not bundled).
COPY --from=builder --chown=nextjs:nodejs /app/src/db/schema.sql ./src/db/schema.sql
# The standalone bundle leaves broken pnpm symlinks for these; replace them
# with the real, dereferenced native module + its deps.
RUN rm -rf node_modules/better-sqlite3 node_modules/bindings node_modules/file-uri-to-path
COPY --from=builder --chown=nextjs:nodejs /native ./node_modules

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
