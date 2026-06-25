FROM node:22-alpine

RUN apk add --no-cache openssl

# Set the working directory inside the container
WORKDIR /app

# Copy the package files first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

COPY prisma ./prisma/

RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose the port NGINX is looking for
EXPOSE 5000

# Run the dev script for hot-reloading (nodemon src/server.js)
CMD ["npm", "run", "dev"]