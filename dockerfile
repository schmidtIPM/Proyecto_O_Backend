# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g typescript
RUN tsc

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/Proyect_O.js"]

