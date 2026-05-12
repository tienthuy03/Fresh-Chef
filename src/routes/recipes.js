const express = require('express');
const Recipe = require('../models/Recipe');
const { scrapeRecipes } = require('../services/scraper');
const auth = require('../middleware/auth');

const router = express.Router();

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
    const recipes = await Recipe.findAll();
    res.json(recipes.map(r => ({
      ...r.toJSON(),
      ingredients: JSON.parse(r.ingredients),
      steps: JSON.parse(r.steps)
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
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
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    
    res.json({
      ...recipe.toJSON(),
      ingredients: JSON.parse(recipe.ingredients),
      steps: JSON.parse(recipe.steps)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/recipes/sync:
 *   post:
 *     summary: Sync recipes from Cookpad (Auth required)
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
 *               keyword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sync started
 */
router.post('/sync', auth, async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) return res.status(400).json({ message: 'Keyword is required' });

  // Run in background
  scrapeRecipes(keyword);

  res.json({ message: `Sync started for keyword: ${keyword}` });
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
    
    // Simple matching algorithm
    const suggested = allRecipes.map(recipe => {
      const recipeIngredients = JSON.parse(recipe.ingredients);
      let matchCount = 0;
      
      // Check how many input ingredients are in the recipe
      ingredients.forEach(inputIng => {
        const found = recipeIngredients.find(ri => 
          ri.name.toLowerCase().includes(inputIng.toLowerCase())
        );
        if (found) matchCount++;
      });

      // Calculate score (0 to 1)
      const score = ingredients.length > 0 ? matchCount / ingredients.length : 0;
      
      return {
        ...recipe.toJSON(),
        ingredients: recipeIngredients,
        steps: JSON.parse(recipe.steps),
        matchScore: score,
        matchCount: matchCount
      };
    })
    .filter(r => r.matchCount > 0) // Only return recipes with at least one match
    .sort((a, b) => b.matchScore - a.matchScore); // Rank by score

    res.json({
      Success: true,
      Data: suggested.slice(0, 10) // Return top 10
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

module.exports = router;
