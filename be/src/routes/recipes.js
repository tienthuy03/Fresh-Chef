const express = require('express');
const { Recipe, User, sequelize } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { scrapeRecipes } = require('../services/scraper');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/recipes/search:
 *   get:
 *     summary: Search recipes
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching recipes
 */
router.get('/search', async (req, res) => {
  const { q } = req.query;
  const recipes = await Recipe.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${q}%` } },
        { category: { [Op.like]: `%${q}%` } }
      ]
    }
  });
  res.json({ Success: true, Data: recipes });
});

/**
 * @swagger
 * /api/recipes/categories:
 *   get:
 *     summary: Get all recipe categories
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', async (req, res) => {
  const categories = await Recipe.findAll({
    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category']],
  });
  res.json({ Success: true, Data: categories.map(c => c.category).filter(Boolean) });
});

/**
 * @swagger
 * /api/recipes/trending:
 *   get:
 *     summary: Get trending recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: List of trending recipes
 */
router.get('/trending', async (req, res) => {
  // Mock trending logic: just return 20 recipes
  const recipes = await Recipe.findAll({ 
    limit: 20,
    order: Sequelize.literal('RANDOM()')
  });
  res.json({ Success: true, Data: recipes });
});

/**
 * @swagger
 * /api/recipes/favorites:
 *   get:
 *     summary: Get user's favorite recipes
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite recipes
 */
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const favorites = await user.getFavoriteRecipes();
    res.json({ Success: true, Data: favorites });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: List of recipes
 */
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.findAll({ order: Sequelize.literal('RANDOM()') });
    res.json({
      Success: true,
      Data: recipes.map(r => ({
        ...r.toJSON(),
        ingredients: JSON.parse(r.ingredients),
        steps: JSON.parse(r.steps)
      }))
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe details
 *       404:
 *         description: Recipe not found
 */
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ Success: false, Message: 'Recipe not found' });
    
    res.json({
      Success: true,
      Data: {
        ...recipe.toJSON(),
        ingredients: JSON.parse(recipe.ingredients),
        steps: JSON.parse(recipe.steps)
      }
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/recipes/sync:
 *   post:
 *     summary: Sync recipes from Cookpad (Public)
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keyword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sync started
 */
router.post('/sync', async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) return res.status(400).json({ Success: false, Message: 'Keyword is required' });

  // Run in background
  scrapeRecipes(keyword);

  res.json({ Success: true, Message: `Sync started for keyword: ${keyword}` });
});

/**
 * @swagger
 * /api/recipes/suggest:
 *   post:
 *     summary: Suggest recipes based on ingredients and preferences (Hôm nay ăn gì?)
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxTime:
 *                 type: integer
 *     responses:
 *       200:
 *         description: List of suggested recipes
 */
router.post('/suggest', auth, async (req, res) => {
  try {
    const { ingredients = [], maxTime } = req.body;
    const allRecipes = await Recipe.findAll();
    
    const suggested = allRecipes.map(recipe => {
      const recipeIngredients = JSON.parse(recipe.ingredients);
      let matchCount = 0;
      
      ingredients.forEach(inputIng => {
        const found = recipeIngredients.find(ri => 
          ri.name.toLowerCase().includes(inputIng.toLowerCase())
        );
        if (found) matchCount++;
      });

      const score = ingredients.length > 0 ? matchCount / ingredients.length : 0;
      
      return {
        ...recipe.toJSON(),
        ingredients: recipeIngredients,
        steps: JSON.parse(recipe.steps),
        matchScore: score,
        matchCount: matchCount
      };
    })
    .filter(r => r.matchCount > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      Success: true,
      Data: suggested.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/recipes/{id}/shopping-list:
 *   get:
 *     summary: Get a shopping checklist for a recipe
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Shopping list generated
 */
router.get('/:id/shopping-list', async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const ingredients = JSON.parse(recipe.ingredients);
    
    res.json({
      Success: true,
      Data: {
        RecipeTitle: recipe.title,
        Checklist: ingredients.map(i => ({
          Item: `${i.name}${i.quantity ? ` (${i.quantity})` : ''}`,
          Checked: false
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/recipes/{id}/favorite:
 *   post:
 *     summary: Toggle favorite status for a recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Favorite toggled
 */
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const recipe = await Recipe.findByPk(req.params.id);

    if (!recipe) return res.status(404).json({ Success: false, Message: 'Recipe not found' });

    const hasFavorite = await user.hasFavoriteRecipe(recipe);
    if (hasFavorite) {
      await user.removeFavoriteRecipe(recipe);
      res.json({ Success: true, Message: 'Removed from favorites', Favorited: false });
    } else {
      await user.addFavoriteRecipe(recipe);
      res.json({ Success: true, Message: 'Added to favorites', Favorited: true });
    }
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

module.exports = router;
