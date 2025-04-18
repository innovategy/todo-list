# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: production
FROM node:22-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
EXPOSE 4000
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/dist ./dist
CMD ["node", "dist/main.js"]