FROM node:18

# Set the working directory
WORKDIR /app

# Install required packages directly
RUN npm install express body-parser jsonwebtoken mongoose cors express-prom-bundle cookie-parser morgan bcrypt winston winston-mongodb

# Copy the rest of the application code
COPY . .

# Expose port 5001
EXPOSE 5001

# Command to run the application
CMD ["node", "index.js"]
