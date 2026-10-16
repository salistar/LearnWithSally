FROM node:22-bookworm-slim AS web
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=$EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
RUN npx expo export --platform web --max-workers 2

FROM node:22-bookworm-slim AS runtime-deps
WORKDIR /runtime
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM python:3.12-slim-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 libstdc++6 ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/astral-sh/uv:0.13.1 /uv /usr/local/bin/uv
COPY --from=web /usr/local/bin/node /usr/local/bin/node
WORKDIR /app/vision-agent
COPY vision-agent/pyproject.toml vision-agent/uv.lock ./
RUN uv sync --locked --no-dev
COPY vision-agent/main.py ./
WORKDIR /app
COPY --from=runtime-deps /runtime/node_modules ./node_modules
COPY --from=web /app/dist ./dist
COPY server ./server
COPY scripts/production-config.cjs ./scripts/production-config.cjs
ENV NODE_ENV=production PORT=10000
EXPOSE 10000
CMD ["node", "server/start.mjs"]
