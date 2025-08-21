# ---------- builder ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# 1) deps pour build
COPY package*.json ./
RUN npm ci

# 2) prisma client (dev)
COPY prisma ./prisma/
RUN npx prisma generate

# 3) sources + build TS
COPY . .
RUN npm run build

# ---------- runner (prod) ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Reprend node_modules du builder, puis enlève les dev-deps (évite un 2e npm ci)
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev

# Prisma client prod
COPY prisma ./prisma/
RUN npx prisma generate

# Artefacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
