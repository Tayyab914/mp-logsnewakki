// // const express = require('express');
// // const cors = require('cors');
// // const mongoose = require('mongoose');
// // const morgan = require('morgan');
// // const promClient = require('prom-client');
// // const winston = require('winston');

// // const app = express();
// // const PORT = 5002;

// // // Setup Morgan for HTTP request logging
// // app.use(morgan('combined'));

// // // Initialize Winston for detailed logging
// // const logger = winston.createLogger({
// //   level: 'info',
// //   format: winston.format.combine(
// //     winston.format.colorize(),
// //     winston.format.simple()
// //   ),
// //   transports: [new winston.transports.Console()]
// // });

// // // Middleware setup
// // app.use(cors({ origin: '*' }));
// // app.use(express.json());

// // // MongoDB connection
// // mongoose.connect('mongodb://mongodb:27017/ecommerce', {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// // });

// // mongoose.connection.on('connected', () => logger.info('Connected to MongoDB'));
// // mongoose.connection.on('error', (error) => logger.error('MongoDB connection error:', error));

// // // Prometheus metrics setup
// // const collectDefaultMetrics = promClient.collectDefaultMetrics;
// // collectDefaultMetrics({ timeout: 5000 });

// // const httpRequestCounter = new promClient.Counter({
// //   name: 'http_requests_total',
// //   help: 'Total number of HTTP requests',
// //   labelNames: ['method', 'path', 'statusCode']
// // });

// // app.use((req, res, next) => {
// //   res.on('finish', () => {
// //     httpRequestCounter.inc({ method: req.method, path: req.path, statusCode: res.statusCode });
// //     logger.info(`Request processed: ${req.method} ${req.path} - Status: ${res.statusCode}`);
// //   });
// //   next();
// // });

// // // Order schema
// // const orderSchema = new mongoose.Schema({
// //   items: [{ productId: String, quantity: Number }],
// //   createdAt: { type: Date, default: Date.now },
// // });

// // const Order = mongoose.model('Order', orderSchema);

// // // Vulnerability 1: No Authentication (Broken Authentication)
// // app.post('/order', async (req, res) => {
// //   // No authentication check, allowing anyone to place an order
// //   const { items } = req.body;
// //   const order = new Order({ items });
// //   await order.save();
// //   res.send('Order placed successfully');
// //   logger.info('Order placed successfully');
// // });

// // // Vulnerability 2: No Input Validation (Business Logic Flaw)
// // app.post('/order', async (req, res) => {
// //   const { items } = req.body;
// //   // No validation for items array structure, allowing invalid data
// //   if (!items || !Array.isArray(items) || items.length === 0) {
// //     return res.status(400).send('Invalid order data');
// //   }
// //   const order = new Order({ items });
// //   await order.save();
// //   res.send('Order placed successfully');
// //   logger.info('Order placed successfully with unvalidated input');
// // });

// // // Vulnerability 3: No Rate Limiting (Denial of Service)
// // app.post('/order', async (req, res) => {
// //   const { items } = req.body;
// //   const order = new Order({ items });
// //   await order.save();
// //   res.send('Order placed successfully');
// //   logger.info('Order placed successfully without rate limiting');
// // });

// // // Vulnerability 4: No Input Sanitization (MongoDB Injection)
// // app.get('/orders', async (req, res) => {
// //   try {
// //     const { search } = req.query;
// //     let orders;
// //     if (search) {
// //       // Possible injection vulnerability in search query
// //       orders = await Order.find({ 'items.productId': new RegExp(search, 'i') });
// //     } else {
// //       orders = await Order.find();
// //     }
// //     res.json(orders);
// //     logger.info('Orders retrieved');
// //   } catch (error) {
// //     logger.error('Error fetching orders:', error);
// //     res.status(500).send('Error fetching orders');
// //   }
// // });

// // // Vulnerability 5: Insecure Direct Object References (IDOR)
// // app.delete('/order/:id', async (req, res) => {
// //   // No access control, allowing anyone to delete any order by ID
// //   const { id } = req.params;
// //   const order = await Order.findByIdAndDelete(id);
// //   if (order) {
// //     res.send('Order deleted successfully');
// //     logger.info(`Order deleted: ${id}`);
// //   } else {
// //     res.status(404).send('Order not found');
// //     logger.warn(`Attempted to delete non-existent order: ${id}`);
// //   }
// // });

// // // Vulnerability 6: No Data Sanitization (XSS)
// // app.get('/order/:id', async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const order = await Order.findById(id);
// //     if (order) {
// //       // No sanitization before rendering order data, vulnerable to XSS
// //       res.send(`<h1>Order ID: ${order._id}</h1><p>Items: ${JSON.stringify(order.items)}</p>`);
// //       logger.info(`Order details displayed for: ${id}`);
// //     } else {
// //       res.status(404).send('Order not found');
// //       logger.warn(`Attempted to access non-existent order: ${id}`);
// //     }
// //   } catch (error) {
// //     logger.error('Error fetching order:', error);
// //     res.status(500).send('Error fetching order');
// //   }
// // });

// // // Metrics endpoint for Prometheus
// // app.get('/metrics', async (req, res) => {
// //   try {
// //     res.set('Content-Type', promClient.register.contentType);
// //     res.end(await promClient.register.metrics());
// //     logger.info('Metrics endpoint accessed');
// //   } catch (ex) {
// //     logger.error('Error retrieving metrics:', ex);
// //     res.status(500).end(ex);
// //   }
// // });

// // // Start the server
// // app.listen(PORT, () => {
// //   logger.info(`Order service running on port ${PORT}`);
// // });


const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const promClient = require('prom-client');
const winston = require('winston');

const app = express();
const PORT = 5002;

// Setup Morgan for HTTP request logging
app.use(morgan('combined'));

// Initialize Winston for detailed logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

// Middleware setup
app.use(cors({ origin: '*' }));
app.use(express.json());

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

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, path: req.path, statusCode: res.statusCode });
    logger.info(`Request processed: ${req.method} ${req.path} - Status: ${res.statusCode}`);
  });
  next();
});

// Order schema with a totalAmount field
const orderSchema = new mongoose.Schema({
  items: [{ productId: String, name: String, quantity: Number, price: Number }],
  totalAmount: Number,  // Allows client to specify total amount
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// Vulnerable order endpoint that allows manipulated totalAmount
app.post('/order', async (req, res) => {
  const { items, totalAmount } = req.body;

  // Business logic flaw: Accepts user-provided totalAmount without verification
  const order = new Order({ items, totalAmount });
  await order.save();

  res.json({ message: 'Order placed successfully', order });
  logger.info('Order placed successfully with potentially manipulated total amount');
});

// Fetch all orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
    logger.info('Orders retrieved');
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).send('Error fetching orders');
  }
});

// Delete order by ID (IDOR vulnerability)
app.delete('/order/:id', async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByIdAndDelete(id);
  if (order) {
    res.send('Order deleted successfully');
    logger.info(`Order deleted: ${id}`);
  } else {
    res.status(404).send('Order not found');
    logger.warn(`Attempted to delete non-existent order: ${id}`);
  }
});

// Fetch specific order with potential XSS vulnerability
app.get('/order/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (order) {
      // No sanitization before rendering order data, vulnerable to XSS
      res.send(`<h1>Order ID: ${order._id}</h1><p>Items: ${JSON.stringify(order.items)}</p><p>Total Amount: ${order.totalAmount}</p>`);
      logger.info(`Order details displayed for: ${id}`);
    } else {
      res.status(404).send('Order not found');
      logger.warn(`Attempted to access non-existent order: ${id}`);
    }
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).send('Error fetching order');
  }
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
  logger.info(`Order service running on port ${PORT}`);
});


