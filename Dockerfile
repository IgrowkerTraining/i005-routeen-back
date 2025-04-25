# Etapa 1: Construcción
FROM node:20.4-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

# Etapa 2: Producción
FROM node:20.4-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
RUN npm ci --omit=dev && npm cache clean --force
EXPOSE 8080
CMD ["npm", "run", "start"]