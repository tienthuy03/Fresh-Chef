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
const shoppingListRoutes = require('./routes/shoppingList');
const mealPlanRoutes = require('./routes/mealPlans');
const savedShoppingListRoutes = require('./routes/savedShoppingLists');
const aiAssistantRoutes = require('./routes/aiAssistant');
const nutritionRoutes = require('./routes/nutrition');
const gamificationRoutes = require('./routes/gamification');

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
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/saved-shopping-lists', savedShoppingListRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/gamification', gamificationRoutes);

// Database Sync & Server Start
sequelize.sync().then(async () => {
  console.log('Database connected and synced');
  
  // Seed badges if empty
  const { Badge, Recipe } = require('./models');
  try {
    const badgeCount = await Badge.count();
    if (badgeCount === 0) {
      console.log('Database empty of badges, seeding initial culinary badges...');
      await Badge.bulkCreate([
        // Level Badges
        { name: 'Tập sự Bếp bánh 🍳', description: 'Gia nhập gia đình Fresh Chef', iconUrl: '🍳', requiredXp: 0, conditionType: 'level', conditionValue: 1 },
        { name: 'Tay kéo Vàng ✂️', description: 'Đạt cấp độ 2', iconUrl: '✂️', requiredXp: 200, conditionType: 'level', conditionValue: 2 },
        { name: 'Thợ Vị Giác 🧪', description: 'Đạt cấp độ 3', iconUrl: '🧪', requiredXp: 450, conditionType: 'level', conditionValue: 3 },
        { name: 'Thợ làm bánh ngọt 🎂', description: 'Đạt cấp độ 4', iconUrl: '🎂', requiredXp: 600, conditionType: 'level', conditionValue: 4 },
        { name: 'Vua Sốt Chấm 🍯', description: 'Đạt cấp độ 5', iconUrl: '🍯', requiredXp: 800, conditionType: 'level', conditionValue: 5 },
        { name: 'Thợ săn hương vị 🌿', description: 'Đạt cấp độ 6', iconUrl: '🌿', requiredXp: 1000, conditionType: 'level', conditionValue: 6 },
        { name: 'Chuyên gia Hải sản 🦀', description: 'Đạt cấp độ 8', iconUrl: '🦀', requiredXp: 1500, conditionType: 'level', conditionValue: 8 },
        { name: 'Chiến thần Lửa 🔥', description: 'Đạt cấp độ 10', iconUrl: '🔥', requiredXp: 2050, conditionType: 'level', conditionValue: 10 },
        { name: 'Phù thủy Trái cây 🍉', description: 'Đạt cấp độ 12', iconUrl: '🍉', requiredXp: 2800, conditionType: 'level', conditionValue: 12 },
        { name: 'Bếp trưởng 5 sao 👑', description: 'Đạt cấp độ 15', iconUrl: '👑', requiredXp: 4500, conditionType: 'level', conditionValue: 15 },
        { name: 'Huyền thoại Bếp trưởng 🏆', description: 'Đạt cấp độ 20', iconUrl: '🏆', requiredXp: 8000, conditionType: 'level', conditionValue: 20 },
        { name: 'Thiên tài Ẩm thực 🧠', description: 'Đạt cấp độ 30', iconUrl: '🧠', requiredXp: 18000, conditionType: 'level', conditionValue: 30 },
        { name: 'Thần Bếp 👼', description: 'Đạt cấp độ 50', iconUrl: '👼', requiredXp: 50000, conditionType: 'level', conditionValue: 50 },

        // Review Badges
        { name: 'Lời chào sân 🎤', description: 'Viết đánh giá đầu tiên', iconUrl: '🎤', requiredXp: 0, conditionType: 'reviewsWritten', conditionValue: 1 },
        { name: 'Nhà phê bình Ẩm thực 📝', description: 'Viết 3 đánh giá trên app', iconUrl: '📝', requiredXp: 0, conditionType: 'reviewsWritten', conditionValue: 3 },
        { name: 'Chuyên gia Đánh giá 🌟', description: 'Viết 10 đánh giá', iconUrl: '🌟', requiredXp: 0, conditionType: 'reviewsWritten', conditionValue: 10 },
        { name: 'Nhà báo Ẩm thực 📰', description: 'Viết 25 đánh giá', iconUrl: '📰', requiredXp: 0, conditionType: 'reviewsWritten', conditionValue: 25 },
        { name: 'Siêu Cấp Đánh Giá 🚀', description: 'Viết 50 đánh giá', iconUrl: '🚀', requiredXp: 0, conditionType: 'reviewsWritten', conditionValue: 50 },

        // Recipe Badges
        { name: 'Món ăn Đầu Tay 🥘', description: 'Hoàn thành công thức nấu ăn đầu tiên', iconUrl: '🥘', requiredXp: 0, conditionType: 'recipesCompleted', conditionValue: 1 },
        { name: 'Chiến thần Bếp núc 🔪', description: 'Hoàn thành 3 công thức nấu ăn', iconUrl: '🔪', requiredXp: 0, conditionType: 'recipesCompleted', conditionValue: 3 },
        { name: 'Kẻ Hủy Diệt Cà Rốt 🥕', description: 'Hoàn thành 5 công thức nấu ăn', iconUrl: '🥕', requiredXp: 0, conditionType: 'recipesCompleted', conditionValue: 5 },
        { name: 'Nghệ nhân Nấu nướng 🎨', description: 'Hoàn thành 10 công thức', iconUrl: '🎨', requiredXp: 0, conditionType: 'recipesCompleted', conditionValue: 10 },
        { name: 'Vua Đầu Bếp Gia Đình 🏡', description: 'Hoàn thành 25 công thức', iconUrl: '🏡', requiredXp: 0, conditionType: 'recipesCompleted', conditionValue: 25 },
        { name: 'Siêu Đầu Bếp 🦸', description: 'Hoàn thành 50 công thức', iconUrl: '🦸', requiredXp: 0, conditionType: 'recipesCompleted', conditionValue: 50 },
        { name: 'Vua Đầu Bếp Thế Giới 🌍', description: 'Hoàn thành 100 công thức', iconUrl: '🌍', requiredXp: 0, conditionType: 'recipesCompleted', conditionValue: 100 }
      ]);
      console.log('Culinary badges seeded successfully!');
    }
  } catch (badgeErr) {
    console.error('Failed to seed badges:', badgeErr);
  }

  // Seed data if empty
  const count = await Recipe.count();
  if (count === 0) {
    console.log('Database empty, seeding initial recipes...');
    const { scrapeRecipes } = require('./services/scraper');
    // Scrape background
    ['Món gà', 'Món bò', 'Món cá', 'Salad'].forEach(keyword => scrapeRecipes(keyword));
  }
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
