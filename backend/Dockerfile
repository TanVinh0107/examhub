# ---------- STAGE 1: BUILD ------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json + lock file
COPY package*.json ./

# Cài dependencies (dev + prod)
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# ✅ Generate Prisma Client trước khi build
RUN npx prisma generate

# ✅ Build NestJS project (ra thư mục dist)
RUN npm run build


# ---------- STAGE 2: RUN -------------
FROM node:20-alpine

WORKDIR /app

# Copy file cần thiết từ stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY package*.json ./

# Cài dependency cho production
RUN npm install --omit=dev

# ✅ Copy schema để prisma client vẫn hoạt động đúng
COPY prisma ./prisma

# Expose port cho NestJS
EXPOSE 4000

# ✅ Chạy migrate trước khi start app (nếu dùng PostgreSQL)
CMD npx prisma migrate deploy && node dist/main.js
