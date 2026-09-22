FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

# Copy root package and service manifests
COPY package.json ./
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma
COPY backend/dist ./backend/dist
COPY frontend/dist ./frontend/dist

# Install production backend dependencies and generate Prisma client
RUN cd backend && npm install --omit=dev && npx prisma generate

EXPOSE 10000

CMD ["node", "backend/dist/server.js"]
