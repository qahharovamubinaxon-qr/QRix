# QRix production image — multi-stage, standalone Next.js output.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 DOCKER_BUILD=1
# Prisma client is generated only when the deploy installs it (DATABASE_URL flow).
RUN npx prisma generate 2>/dev/null || true
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
RUN addgroup -S qrix && adduser -S qrix -G qrix
COPY --from=build --chown=qrix:qrix /app/.next/standalone ./
COPY --from=build --chown=qrix:qrix /app/.next/static ./.next/static
COPY --from=build --chown=qrix:qrix /app/public ./public
USER qrix
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
