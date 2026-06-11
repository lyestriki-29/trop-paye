# syntax=docker/dockerfile:1
# TropPayé — image de prod pour OVH (Next.js standalone, monorepo pnpm).
# Build : docker build -t troppaye:latest .
# Run   : voir docs/DEPLOY-OVH.md (env requises, reverse proxy, cron).

FROM node:22-alpine AS base
RUN corepack enable

# ---------- Dépendances (filtrées : web + ses packages, PAS packages/video) ----------
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# pnpm a besoin de TOUS les manifests du workspace pour résoudre le graphe…
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/rules-engine/package.json packages/rules-engine/
COPY packages/templates/package.json packages/templates/
COPY packages/video/package.json packages/video/
# …mais n'installe que la cible et ses dépendances (Remotion exclu de l'image).
RUN pnpm install --frozen-lockfile --filter @troppaye/web...

# ---------- Build ----------
FROM base AS build
WORKDIR /app
COPY --from=deps /app ./
COPY . .
ENV NODE_ENV=production
# Variables NEXT_PUBLIC_* nécessaires AU BUILD (inlinées côté client).
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN pnpm --filter @troppaye/web build

# ---------- Image finale (standalone : ~150 Mo, sans pnpm ni sources) ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
# Le tracing standalone reproduit l'arborescence du monorepo.
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
