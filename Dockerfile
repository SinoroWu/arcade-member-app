FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm install
RUN cd backend && npm install && npx prisma generate

# Copy source files
COPY frontend ./frontend
COPY backend ./backend

# Build frontend and backend
RUN cd frontend && npm run build
RUN cd backend && npm run build

# Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json ./
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 8080

CMD ["node", "backend/dist/server.js"]
