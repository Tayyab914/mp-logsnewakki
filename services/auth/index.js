// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');
// const cookieParser = require('cookie-parser');
// const morgan = require('morgan');
// const promClient = require('prom-client');
// const winston = require('winston');

// const app = express();
// const PORT = 5004;
// const JWT_SECRET = '123'; // Replace with a secure key in production
// const MAX_PASSWORD_LENGTH = 100;

// // Enhanced Winston logger with additional security-specific formatting
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json(),
//     winston.format.colorize(),
//     winston.format.printf(({ timestamp, level, message }) => {
//       return `${timestamp} ${level}: ${message}`;
//     })
//   ),
//   transports: [
//     new winston.transports.Console(),
//     // Add file transport for security events
//     new winston.transports.File({ 
//       filename: 'security-events.log',
//       level: 'warn'
//     })
//   ]
// });

// // Add security metrics
// const securityViolationsCounter = new promClient.Counter({
//   name: 'security_violations_total',
//   help: 'Total number of security violations',
//   labelNames: ['type', 'severity']
// });

// // Middleware setup
// app.use(cors({ origin: '*' }));
// app.use(bodyParser.json({
//   verify: (req, res, buf) => {
//     // Add early payload size check
//     const payloadSize = buf.length;
//     if (payloadSize > 1024 * 100) { // 100KB limit
//       throw new Error('Payload too large');
//     }
//   }
// }));
// app.use(cookieParser());
// app.use(morgan('combined'));

// // Graceful shutdown function
// const gracefulShutdown = async (reason) => {
//   logger.warn(`Initiating graceful shutdown: ${reason}`);
  
//   try {
//     // Close MongoDB connection
//     await mongoose.connection.close();
//     logger.info('MongoDB connection closed');

//     // Record metric
//     securityViolationsCounter.inc({ type: 'password_length_violation', severity: 'critical' });

//     // Wait for pending requests to complete (5 second timeout)
//     setTimeout(() => {
//       logger.info('Shutting down server');
//       process.exit(0);
//     }, 5000);
//   } catch (error) {
//     logger.error('Error during shutdown:', error);
//     process.exit(1);
//   }
// };

// // MongoDB connection
// mongoose.connect('mongodb://mongodb:27017/ecommerce', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// mongoose.connection.on('connected', () => logger.info('Connected to MongoDB'));
// mongoose.connection.on('error', (error) => logger.error('MongoDB connection error:', error));

// // Prometheus metrics setup (keeping existing setup)
// const collectDefaultMetrics = promClient.collectDefaultMetrics;
// collectDefaultMetrics({ timeout: 5000 });

// const httpRequestCounter = new promClient.Counter({
//   name: 'http_requests_total',
//   help: 'Total number of HTTP requests',
//   labelNames: ['method', 'path', 'statusCode']
// });

// // User schema (unchanged)
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   password: { type: String, required: true },
// });

// const User = mongoose.model('User', userSchema);

// // Enhanced login route with better security handling
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   // Security check for password length
//   if (password && password.length > MAX_PASSWORD_LENGTH) {
//     logger.error({
//       message: 'Security violation: Password length exceeds limit',
//       details: {
//         usernameProvided: !!username,
//         passwordLength: password.length,
//         timestamp: new Date().toISOString(),
//         ip: req.ip
//       }
//     });

//     // Send response before shutdown
//     res.status(403).json({
//       error: 'Security violation detected',
//       message: 'Service is shutting down due to security policy violation'
//     });

//     // Trigger graceful shutdown
//     gracefulShutdown('Password length security violation');
//     return;
//   }

//   try {
//     const user = await User.findOne({ username });
//     if (!user) {
//       logger.warn(`Login failed: User not found with username: ${username}`);
//       return res.status(401).send('Invalid credentials');
//     }

//     if (password !== user.password) {
//       logger.warn(`Login failed: Incorrect password for username: ${username}`);
//       return res.status(401).send('Invalid credentials');
//     }

//     const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
//     res.cookie('session', token, {
//       secure: process.env.NODE_ENV === 'production',
//       httpOnly: true,
//       maxAge: 3600000,
//     });
    
//     logger.info(`User logged in successfully: ${username}`);
//     res.json({ message: 'Login successful', token });
//   } catch (error) {
//     logger.error('Error during login:', error);
//     res.status(500).send('An error occurred during login');
//   }
// });

// // Metrics endpoint
// app.get('/metrics', async (req, res) => {
//   res.set('Content-Type', promClient.register.contentType);
//   res.send(await promClient.register.metrics());
// });

// // Handle process signals for graceful shutdown
// process.on('SIGTERM', () => gracefulShutdown('SIGTERM received'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT received'));

// // Server start
// app.listen(PORT, () => {
//   logger.info(`Auth service running on port ${PORT}`);
// });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const promClient = require('prom-client');
const winston = require('winston');

const app = express();
const PORT = 5004;
const JWT_SECRET = '123'; // Replace with a secure key in production
const MAX_PASSWORD_LENGTH = 100;

// Enhanced Winston logger with additional security-specific formatting
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'security-events.log', level: 'warn' })
  ]
});

// Add security metrics
const securityViolationsCounter = new promClient.Counter({
  name: 'security_violations_total',
  help: 'Total number of security violations',
  labelNames: ['type', 'severity']
});

// Middleware setup
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    const payloadSize = buf.length;
    if (payloadSize > 1024 * 100) { // 100KB limit
      throw new Error('Payload too large');
    }
  }
}));
app.use(cookieParser());
app.use(morgan('combined'));

// Graceful shutdown function
const gracefulShutdown = async (reason) => {
  logger.warn(`Initiating graceful shutdown: ${reason}`);
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    securityViolationsCounter.inc({ type: 'password_length_violation', severity: 'critical' });
    setTimeout(() => {
      logger.info('Shutting down server');
      process.exit(0);
    }, 5000);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// MongoDB connection
mongoose.connect('mongodb://mongodb:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => logger.info('Connected to MongoDB'));
mongoose.connection.on('error', (error) => logger.error('MongoDB connection error:', error));

// Prometheus metrics setup
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'statusCode']
});

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Enhanced signup route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
  
    // Basic input validation
    if (!username || !password) {
      logger.warn('Signup attempt with missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }
  
    if (password.length > MAX_PASSWORD_LENGTH) {
      logger.error({
        message: 'Security violation: Password length exceeds limit during signup',
        details: { usernameProvided: !!username, passwordLength: password.length, timestamp: new Date().toISOString(), ip: req.ip }
      });
      res.status(403).json({ error: 'Security violation detected', message: 'Password length exceeds the allowed limit' });
      gracefulShutdown('Password length security violation on signup');
      return;
    }
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ error: 'Username already taken' });
      }
  
      // Create new user
      const newUser = new User({ username, password });
      await newUser.save();
      
      // Log the successful signup
      logger.info(`New user registered: ${username}`);
      
      // Issue a JWT token
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
      res.cookie('session', token, { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 3600000 });
      res.status(201).json({ message: 'Signup successful', token });
    } catch (error) {
      logger.error('Error during user signup:', error);
      res.status(500).send('An error occurred during signup');
    }
  });
  

// Enhanced login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (password && password.length > MAX_PASSWORD_LENGTH) {
    logger.error({
      message: 'Security violation: Password length exceeds limit',
      details: { usernameProvided: !!username, passwordLength: password.length, timestamp: new Date().toISOString(), ip: req.ip }
    });
    res.status(403).json({ error: 'Security violation detected', message: 'Service is shutting down due to security policy violation' });
    gracefulShutdown('Password length security violation');
    return;
  }

  try {
    const user = await User.findOne({ username });
    if (!user || password !== user.password) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('session', token, { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 3600000 });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).send('An error occurred during login');
  }
});
// Vulnerable search endpoint allowing potential NoSQL injection
app.get('/users/search', async (req, res) => {
    try {
      const searchQuery = req.query.search;
  
      // Unsafe parsing of search input, leading to NoSQL injection vulnerability
      const parsedQuery = JSON.parse(searchQuery);
  
      // Using the parsed query directly in the MongoDB query
      const users = await User.find(parsedQuery);
  
      res.json(users);
      logger.warn('User search executed with potential NoSQL injection vulnerability');
    } catch (error) {
      logger.error('Error executing search query:', error);
      res.status(500).send('Error executing search query');
    }
  });
  

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.send(await promClient.register.metrics());
});

// Handle process signals for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM received'));
process.on('SIGINT', () => gracefulShutdown('SIGINT received'));

// Server start
app.listen(PORT, () => {
  logger.info(`Auth service running on port ${PORT}`);
});
