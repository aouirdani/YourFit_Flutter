# ---------- builder ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# 1) Dépendances pour builder (sans scripts pour éviter un postinstall précoce)
COPY package*.json ./
RUN npm ci --ignore-scripts

# 2) Prisma schema + OpenSSL + generate (client côté build)
COPY prisma ./prisma/
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npx prisma generate

# 3) Sources + build TS -> dist
COPY . .
RUN npm run build

# ---------- runner (prod) ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# 4) Installer **uniquement** les deps prod
COPY package*.json ./
RUN npm ci --omit=dev

# 5) Prisma schema + OpenSSL + generate (lié aux deps prod)
COPY prisma ./prisma/
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npx prisma generate

# 6) Artefacts
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
