FROM node:22-bookworm-slim AS builder
WORKDIR /workspace/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web ./
COPY data /workspace/data
COPY types /workspace/types
COPY lib/teacher.ts /workspace/lib/teacher.ts
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up \
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app \
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/app \
    LWS_API_INTERNAL=http://learnwithsally-api:10000 NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=builder /workspace/web/.next/standalone ./
COPY --from=builder /workspace/web/.next/static ./web/.next/static
COPY --from=builder /workspace/web/public ./web/public
COPY server/next-start.mjs server/load-credentials.mjs ./control/
ENV NODE_ENV=production PORT=3100 NEXT_TELEMETRY_DISABLED=1
EXPOSE 3100
CMD ["node","control/next-start.mjs"]
