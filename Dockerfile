# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY nx.json tsconfig.base.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY apps ./apps

RUN npx prisma generate
RUN npx nx build cleanmindapi

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --omit=dev \
    && npx prisma generate \
    && npm cache clean --force

COPY --from=build --chown=node:node /app/dist/apps/cleanmindapi ./dist

USER node
EXPOSE 8080

CMD ["node", "dist/main.js"]
