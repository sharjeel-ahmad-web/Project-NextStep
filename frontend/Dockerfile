# Frontend (React) Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN apk add --no-cache curl \
    && npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Dev server must listen on all interfaces inside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
