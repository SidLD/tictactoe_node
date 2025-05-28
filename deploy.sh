#!/bin/bash

# Pull the latest code from the repository
cd /app
git pull origin main

# Install the dependencies
npm install

# Restart the server
pm2 restart app

# Print a success message
echo "Deployment successful!"
