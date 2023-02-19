# deps
FROM node:18-slim AS deps
WORKDIR /app
COPY prisma ./prisma
COPY patches ./patches
COPY package.json pnpm-lock.yaml ./
RUN yarn global add pnpm && pnpm i

# builder
FROM node:18-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn global add pnpm && SKIP_ENV_VALIDATION=1 pnpm build

# runner
FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD npx prisma migrate deploy && node server.js
