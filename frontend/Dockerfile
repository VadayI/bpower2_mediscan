# Etap 1: budowa frontendu
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etap 2: serwowanie statycznego frontendu
FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build
EXPOSE 8320
CMD ["serve", "-s", "build", "-l", "8320"]