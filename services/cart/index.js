// const express = require('express');
// const cors = require('cors');
// const morgan = require('morgan');
// const promClient = require('prom-client');
// const winston = require('winston');

// const app = express();
// const PORT = 5003;

// // Setup Morgan for HTTP request logging
// app.use(morgan('combined'));

// // Initialize Winston for detailed logging
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.combine(
//     winston.format.colorize(),
//     winston.format.simple()
//   ),
//   transports: [
//     new winston.transports.Console({
//       level: 'info', // Ensure info level logging is enabled
//     })
//   ]
// });

// // Middleware setup
// app.use(cors({ origin: '*' }));
// app.use(express.json());

// // In-memory cart array
// let cart = [];

// // Prometheus metrics setup
// const collectDefaultMetrics = promClient.collectDefaultMetrics;
// collectDefaultMetrics({ timeout: 5000 });

// const httpRequestCounter = new promClient.Counter({
//   name: 'http_requests_total',
//   help: 'Total number of HTTP requests',
//   labelNames: ['method', 'path', 'statusCode']
// });

// app.use((req, res, next) => {
//   res.on('finish', () => {
//     httpRequestCounter.inc({ method: req.method, path: req.path, statusCode: res.statusCode });
//     logger.info(`Request processed: ${req.method} ${req.path} - Status: ${res.statusCode}`);
//   });
//   next();
// });

// // Cart routes

// // Vulnerability 1: No Rate Limiting
// app.post('/cart/add', (req, res) => {
//   const { productId, name, quantity } = req.body;
//   const existingItem = cart.find(item => item.productId === productId);

//   if (existingItem) {
//     existingItem.quantity += quantity;
//     logger.info(`Updated quantity of item in cart: ${productId}`);
//   } else {
//     cart.push({ productId, name, quantity });
//     logger.info(`Added new item to cart: ${productId}`);
//   }

//   res.send('Item added to cart');
// });

// // Vulnerability 2: No Stock Check (Business Logic Flaw)
// app.post('/cart/remove', (req, res) => {
//   const { productId } = req.body;
//   const itemIndex = cart.findIndex(item => item.productId === productId);
  
//   if (itemIndex > -1) {
//     cart.splice(itemIndex, 1);
//     logger.info(`Removed item from cart: ${productId}`);
//     res.send('Item removed from cart');
//   } else {
//     logger.warn(`Attempted to remove non-existent item: ${productId}`);
//     res.status(404).send('Item not found in cart');
//   }
// });

// // Vulnerability 3: No Authentication or Session Management
// app.get('/cart', (req, res) => {
//   logger.info('Cart accessed without authentication');
//   res.json(cart); // Exposes cart data to unauthorized users
// });

// // Metrics endpoint for Prometheus
// app.get('/metrics', async (req, res) => {
//   try {
//     res.set('Content-Type', promClient.register.contentType);
//     res.end(await promClient.register.metrics());
//     logger.info('Metrics endpoint accessed');
//   } catch (ex) {
//     logger.error('Error retrieving metrics:', ex);
//     res.status(500).end(ex);
//   }
// });

// // Start the server
// app.listen(PORT, () => {
//   logger.info(`Cart service running on port ${PORT}`);
// });


// const express = require('express');
// const cors = require('cors');
// const morgan = require('morgan');
// const promClient = require('prom-client');
// const winston = require('winston');

// const app = express();
// const PORT = 5003;

// // Setup Morgan for HTTP request logging
// app.use(morgan('combined'));

// // Initialize Winston for detailed logging
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.combine(
//     winston.format.colorize(),
//     winston.format.simple()
//   ),
//   transports: [new winston.transports.Console({ level: 'info' })]
// });

// // Middleware setup
// app.use(cors({ origin: '*' }));
// app.use(express.json());

// // In-memory cart array
// let cart = [];

// // Prometheus metrics setup
// const collectDefaultMetrics = promClient.collectDefaultMetrics;
// collectDefaultMetrics({ timeout: 5000 });

// const httpRequestCounter = new promClient.Counter({
//   name: 'http_requests_total',
//   help: 'Total number of HTTP requests',
//   labelNames: ['method', 'path', 'statusCode']
// });

// app.use((req, res, next) => {
//   res.on('finish', () => {
//     httpRequestCounter.inc({ method: req.method, path: req.path, statusCode: res.statusCode });
//     logger.info(`Request processed: ${req.method} ${req.path} - Status: ${res.statusCode}`);
//   });
//   next();
// });

// // Cart routes

// // Add item to cart
// app.post('/cart/add', (req, res) => {
//   const { productId, name, quantity, price } = req.body;
//   const existingItem = cart.find(item => item.productId === productId);

//   if (existingItem) {
//     existingItem.quantity += quantity;
//     logger.info(`Updated quantity of item in cart: ${productId}`);
//   } else {
//     cart.push({ productId, name, quantity, price });
//     logger.info(`Added new item to cart: ${productId}`);
//   }

//   res.send('Item added to cart');
// });

// // Remove item from cart
// app.post('/cart/remove', (req, res) => {
//   const { productId } = req.body;
//   const itemIndex = cart.findIndex(item => item.productId === productId);

//   if (itemIndex > -1) {
//     cart.splice(itemIndex, 1);
//     logger.info(`Removed item from cart: ${productId}`);
//     res.send('Item removed from cart');
//   } else {
//     logger.warn(`Attempted to remove non-existent item: ${productId}`);
//     res.status(404).send('Item not found in cart');
//   }
// });

// // Fetch cart items (No authentication or authorization)
// app.get('/cart', (req, res) => {
//   logger.info('Cart accessed without authentication');
//   res.json(cart); // Exposes cart data to unauthorized users
// });

// // Metrics endpoint for Prometheus
// app.get('/metrics', async (req, res) => {
//   try {
//     res.set('Content-Type', promClient.register.contentType);
//     res.end(await promClient.register.metrics());
//     logger.info('Metrics endpoint accessed');
//   } catch (ex) {
//     logger.error('Error retrieving metrics:', ex);
//     res.status(500).end(ex);
//   }
// });

// // Start the server
// app.listen(PORT, () => {
//   logger.info(`Cart service running on port ${PORT}`);
// });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const promClient = require('prom-client');
const winston = require('winston');

const app = express();
const PORT = 5003;

// Setup Morgan for HTTP request logging
app.use(morgan('combined'));

// Initialize Winston for detailed logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console({ level: 'info' })]
});

// Middleware setup
app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory cart array
let cart = [];

// Prometheus metrics setup
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'statusCode']
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, path: req.path, statusCode: res.statusCode });
    logger.info(`Request processed: ${req.method} ${req.path} - Status: ${res.statusCode}`);
  });
  next();
});

// Cart routes

// Add item to cart
app.post('/cart/add', (req, res) => {
  const { productId, name, quantity, price } = req.body;
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
    logger.info(`Updated quantity of item in cart: ${productId}`);
  } else {
    cart.push({ productId, name, quantity, price });
    logger.info(`Added new item to cart: ${productId}`);
  }

  res.send('Item added to cart');
});

// Remove item from cart
app.post('/cart/remove', (req, res) => {
  const { productId } = req.body;
  const itemIndex = cart.findIndex(item => item.productId === productId);

  if (itemIndex > -1) {
    cart.splice(itemIndex, 1);
    logger.info(`Removed item from cart: ${productId}`);
    res.send('Item removed from cart');
  } else {
    logger.warn(`Attempted to remove non-existent item: ${productId}`);
    res.status(404).send('Item not found in cart');
  }
});

// Fetch all items in the cart
app.get('/cart/items', (req, res) => {
  logger.info('Fetching all items in the cart');
  res.json(cart);
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
    logger.info('Metrics endpoint accessed');
  } catch (ex) {
    logger.error('Error retrieving metrics:', ex);
    res.status(500).end(ex);
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Cart service running on port ${PORT}`);
});
