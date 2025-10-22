# Stage 1: Build
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production-stage
WORKDIR /app

RUN apk add --no-cache netcat-openbsd

# Copy only the build artifacts and essential files from the build stage
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/package*.json ./

# Copy source config and migrations for TypeORM CLI
COPY --from=build-stage /app/src/config ./src/config
COPY --from=build-stage /app/src/migrations ./src/migrations

# Copy TypeScript configuration
COPY --from=build-stage /app/tsconfig.json ./tsconfig.json

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Install only production dependencies
RUN npm install --only=production

# Install ts-node and typescript for running migrations
RUN npm install ts-node typescript @types/node --save-dev

# Expose the application port
EXPOSE 3000

# Define the command to run the app
CMD ["./entrypoint.sh"]