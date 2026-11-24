FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/leads.db
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start -- --hostname 0.0.0.0"]
