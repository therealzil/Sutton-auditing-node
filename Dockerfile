# Stage 1: Build Environment
FROM node:22-slim AS builder

# Set working directory
WORKDIR /app

# Copy package management files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for TS/Vite build)
RUN npm ci

# Copy the remaining source code
COPY . .

# Compile the TypeScript backend and bundle the React frontend
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-slim AS runtime

# Enforce production environment
ENV NODE_ENV=production
ENV PORT=3000

# Create a dedicated directory for the app and set ownership to the node user
WORKDIR /app
RUN chown node:node /app

# Copy package management files for production install
COPY package.json package-lock.json* ./

# Install only production dependencies to minimize attack surface
RUN npm ci --only=production && npm cache clean --force

# Copy compiled frontend and backend assets from the builder stage
COPY --from=builder --chown=node:node /app/dist ./dist

# Create the persistent directory for the Cryptographic Ledger
# Ensures the non-root user has write access to seal blocks
RUN mkdir -p /app/data && chown node:node /app/data

# Drop root privileges immediately for security compliance
USER node

# Expose the API and UI port
EXPOSE 3000

# Execute the Sovereign Node backend daemon and server
CMD ["node", "dist/server.js"]
