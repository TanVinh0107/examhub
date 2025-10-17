# ---------- STAGE 1: BUILD ------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- STAGE 2: RUN -------------
FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000

# ⚙️ Wait-for script để chờ DB sẵn sàng trước khi migrate
RUN npm install -g wait-port

CMD ["sh", "-c", "wait-port examhub-db:5432 && npx prisma migrate deploy && node dist/main.js"]
