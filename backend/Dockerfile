FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY src/ src/
RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY src/prisma/schema.prisma ./src/prisma/
RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN mkdir -p uploads
EXPOSE 4000
CMD ["node", "dist/index.js"]
