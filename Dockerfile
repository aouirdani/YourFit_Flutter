FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev for Prisma)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy all application files
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]