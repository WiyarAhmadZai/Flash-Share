# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

# Your app binds to port 8080 so you'll use the EXPOSE instruction
EXPOSE 8080

# Define the command to run your app
CMD [ "node", "server.js" ]
