// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const morgan = require('morgan');
// const promClient = require('prom-client');
// const winston = require('winston');

// const app = express();
// const PORT = 5001;

// // Setup Morgan for HTTP request logging
// app.use(morgan('combined'));

// // Initialize Winston for detailed logging
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.combine(
//     winston.format.colorize(),
//     winston.format.simple()
//   ),
//   transports: [new winston.transports.Console()]
// });

// // Middleware setup
// app.use(cors({ origin: '*' }));
// app.use(express.json());

// // MongoDB connection
// mongoose.connect('mongodb://mongodb:27017/ecommerce', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// mongoose.connection.on('connected', () => logger.info('Connected to MongoDB'));
// mongoose.connection.on('error', (error) => logger.error('MongoDB connection error:', error));

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

// // Product schema
// const productSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   price: Number,
//   stock: Number,
// });

// const Product = mongoose.model('Product', productSchema);

// // Vulnerability 1: No input sanitization, allowing for MongoDB injection
// app.get('/products', async (req, res) => {
//   try {
//     const { search } = req.query;
//     let products;

//     if (search) {
//       products = await Product.find({ name: new RegExp(search, 'i') }); // Potential for MongoDB injection
//     } else {
//       products = await Product.find();
//     }

//     res.json(products);
//     logger.info('Fetched products successfully');
//   } catch (error) {
//     logger.error('Error fetching products:', error);
//     res.status(500).send('Error fetching products');
//   }
// });

// // Vulnerability 2: No authentication required to add a product
// app.post('/product', async (req, res) => {
//   const { name, description, price, stock } = req.body;
//   const product = new Product({ name, description, price, stock });

//   await product.save();
//   res.send('Product added successfully');
//   logger.info(`Product added successfully: ${name}`);
// });

// // Vulnerability 3: No XSS prevention on product description
// app.get('/product/:id', async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (product) {
//       res.send(`<h1>${product.name}</h1><p>${product.description}</p>`); // Vulnerable to XSS
//       logger.info(`Product retrieved: ${product.name}`);
//     } else {
//       res.status(404).send('Product not found');
//       logger.warn('Product not found');
//     }
//   } catch (error) {
//     logger.error('Error fetching product:', error);
//     res.status(500).send('Error fetching product');
//   }
// });

// // Vulnerability 4: No input validation for price and stock fields
// app.post('/product/update', async (req, res) => {
//   const { id, price, stock } = req.body;

//   const product = await Product.findById(id);
//   if (product) {
//     product.price = price;
//     product.stock = stock;
//     await product.save();
//     res.send('Product updated successfully');
//     logger.info(`Product updated successfully: ${product.name}`);
//   } else {
//     res.status(404).send('Product not found');
//     logger.warn('Product not found for update');
//   }
// });

// // Vulnerability 5: No authentication or validation for product deletion
// app.get('/product/delete/:id', async (req, res) => {
//   const product = await Product.findByIdAndDelete(req.params.id);
//   if (product) {
//     res.send('Product deleted successfully');
//     logger.info(`Product deleted successfully: ${product.name}`);
//   } else {
//     res.status(404).send('Product not found');
//     logger.warn('Product not found for deletion');
//   }
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
//   logger.info(`Product service running on port ${PORT}`);
// });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const promClient = require('prom-client');
const winston = require('winston');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 5001;

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
app.use(cookieParser());

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

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
});

const Product = mongoose.model('Product', productSchema);

// Vulnerable /products endpoint with session token exposure
app.get('/products', async (req, res) => {
  try {
    const { search } = req.query;
    let products;

    // Vulnerability simulation: If the search query contains a specific attack payload
    if (search === "<script>alert('attack')</script>") {
      const sessionToken = req.cookies.session;

      if (sessionToken) {
        // Respond with the actual session token in JSON format
        res.json({ sessionToken });
        logger.warn('Security alert: Script injection detected in search field');
        
        // Increment security violation counter
        const securityViolationsCounter = new promClient.Counter({
          name: 'security_violations_total',
          help: 'Total number of security violations',
          labelNames: ['type', 'severity']
        });
        securityViolationsCounter.inc({ type: 'script_injection', severity: 'high' });
      } else {
        res.status(403).json({ error: 'No session token found' });
      }

      return;
    }

    // Default search handling without injection simulation
    if (search) {
      products = await Product.find({ name: new RegExp(search, 'i') }); // Potential for MongoDB injection
    } else {
      products = await Product.find();
    }

    res.json(products);
    logger.info('Fetched products successfully');
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
});

// Add product endpoint (unauthenticated)
app.post('/product', async (req, res) => {
  const { name, description, price, stock } = req.body;
  const product = new Product({ name, description, price, stock });

  await product.save();
  res.send('Product added successfully');
  logger.info(`Product added successfully: ${name}`);
});

// Product detail endpoint (vulnerable to XSS)
app.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.send(`<h1>${product.name}</h1><p>${product.description}</p>`); // Vulnerable to XSS
      logger.info(`Product retrieved: ${product.name}`);
    } else {
      res.status(404).send('Product not found');
      logger.warn('Product not found');
    }
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).send('Error fetching product');
  }
});

// Update product endpoint (no validation)
app.post('/product/update', async (req, res) => {
  const { id, price, stock } = req.body;

  const product = await Product.findById(id);
  if (product) {
    product.price = price;
    product.stock = stock;
    await product.save();
    res.send('Product updated successfully');
    logger.info(`Product updated successfully: ${product.name}`);
  } else {
    res.status(404).send('Product not found');
    logger.warn('Product not found for update');
  }
});

// Delete product endpoint (unauthenticated)
app.get('/product/delete/:id', async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (product) {
    res.send('Product deleted successfully');
    logger.info(`Product deleted successfully: ${product.name}`);
  } else {
    res.status(404).send('Product not found');
    logger.warn('Product not found for deletion');
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
  logger.info(`Product service running on port ${PORT}`);
});
