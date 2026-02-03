/**
 * VLR.GG API - Node.js Implementation
 * Modified by: itznan
 * Original Creator: axsddlr (https://github.com/axsddlr)
 * An Unofficial REST API for vlr.gg Valorant Esports coverage
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const vlrRouter = require('./routers/vlrRouter');

const app = express();

// Security middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 600, // Limit each IP to 600 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'vlrggapi',
      version: '1.0.0',
      description: 'An Unofficial REST API for [vlr.gg](https://www.vlr.gg/), a site for Valorant Esports match and news coverage. Made by [axsddlr](https://github.com/axsddlr)',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routers/*.js'], // Path to the API docs
};

// API documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/', vlrRouter);

// Redirect root to API docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/`);
});

module.exports = app;
