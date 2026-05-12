const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const communityRoutes = require('./routes/community');
const preferenceRoutes = require('./routes/preferences');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Recipe App API',
      version: '1.0.0',
      description: 'API for Vietnamese Recipe App with Auth and Scraping',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/preferences', preferenceRoutes);

// Database Sync & Server Start
sequelize.sync().then(() => {
  console.log('Database connected and synced');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
