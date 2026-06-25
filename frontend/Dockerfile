FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install the Vite and React dependencies
RUN npm install

# Copy all the frontend files
COPY . .

# Expose port 3000 for NGINX
EXPOSE 3000

# Start the Vite development server
CMD ["npm", "run", "dev"]