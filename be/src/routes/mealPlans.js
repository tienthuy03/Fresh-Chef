const express = require('express');
const { Op } = require('sequelize');
const { MealPlan, Recipe } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/meal-plans:
 *   get:
 *     summary: Get user's meal plans
 *     tags: [MealPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of meal plans
 */
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = { userId: req.user.id };
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const mealPlans = await MealPlan.findAll({
      where: whereClause,
      include: [{ model: Recipe }],
      order: [['date', 'ASC']]
    });

    res.json({ Success: true, Data: mealPlans });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Lỗi kết nối máy chủ', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/meal-plans/shopping-list:
 *   get:
 *     summary: Get consolidated shopping list from meal plans
 *     tags: [MealPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Consolidated list of ingredients
 */
router.get('/shopping-list', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = { userId: req.user.id };
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const mealPlans = await MealPlan.findAll({
      where: whereClause,
      include: [{ model: Recipe }],
      order: [['date', 'ASC']]
    });

    const ingredientsMap = {};

    mealPlans.forEach(plan => {
      if (!plan.Recipe) return;
      
      let recipeIngredients = [];
      try {
        recipeIngredients = typeof plan.Recipe.ingredients === 'string' 
          ? JSON.parse(plan.Recipe.ingredients) 
          : plan.Recipe.ingredients || [];
      } catch (e) {
        console.error('Failed to parse recipe ingredients', e);
      }

      recipeIngredients.forEach(ing => {
        if (!ing || !ing.name) return;
        
        let rawName = ing.name.trim();
        let normName = rawName.toLowerCase()
          .replace(/^(củ|trái|quả|sợi|khóm|nhánh|tép|miếng|bịch)\s+/, '')
          .trim();

        if (!ingredientsMap[normName]) {
          ingredientsMap[normName] = {
            name: rawName,
            normalizedName: normName,
            quantities: [],
            recipes: new Set()
          };
        }

        if (ing.quantity) {
          ingredientsMap[normName].quantities.push(ing.quantity);
        }
        ingredientsMap[normName].recipes.add(plan.Recipe.title);
      });
    });

    const mergeQuantities = (quantityList) => {
      const unitGroups = {};
      const unparsed = [];

      quantityList.forEach(q => {
        if (!q) return;
        const str = q.toString().trim();
        const match = str.match(/^([\d\/\.\,\s-]+)\s*(.*)$/);
        if (match) {
          let numStr = match[1].trim();
          let unit = match[2].trim().toLowerCase();
          
          let value = 0;
          try {
            if (numStr.includes('/')) {
              const parts = numStr.split('/');
              if (parts.length === 2) {
                value = parseFloat(parts[0]) / parseFloat(parts[1]);
              } else {
                value = parseFloat(numStr);
              }
            } else {
              value = parseFloat(numStr.replace(',', '.'));
            }
          } catch (e) {
            value = NaN;
          }

          if (!isNaN(value) && value > 0) {
            if (!unit) unit = '';
            unitGroups[unit] = (unitGroups[unit] || 0) + value;
          } else {
            unparsed.push(str);
          }
        } else {
          unparsed.push(str);
        }
      });

      const results = [];
      for (const [unit, val] of Object.entries(unitGroups)) {
        const formattedVal = Math.round(val * 100) / 100;
        results.push(`${formattedVal} ${unit}`.trim());
      }
      results.push(...unparsed);

      return results.join(' + ') || '1 ít';
    };

    const consolidatedList = Object.values(ingredientsMap).map(item => ({
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      normalizedName: item.normalizedName,
      quantity: mergeQuantities(item.quantities),
      recipes: Array.from(item.recipes)
    }));

    res.json({ Success: true, Data: consolidatedList });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Lỗi kết nối máy chủ', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/meal-plans:
 *   post:
 *     summary: Add a recipe to meal plan
 *     tags: [MealPlans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipeId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               mealType:
 *                 type: string
 *                 enum: [Breakfast, Lunch, Dinner, Snack]
 *     responses:
 *       201:
 *         description: Meal plan created
 */
router.post('/', auth, async (req, res) => {
  try {
    const { recipeId, date, mealType } = req.body;
    
    const mealPlan = await MealPlan.create({
      userId: req.user.id,
      recipeId,
      date,
      mealType
    });

    const fullMealPlan = await MealPlan.findByPk(mealPlan.id, {
      include: [{ model: Recipe }]
    });

    res.status(201).json({ Success: true, Data: fullMealPlan });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Lỗi kết nối máy chủ', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/meal-plans/{id}:
 *   delete:
 *     summary: Delete a meal plan entry
 *     tags: [MealPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Meal plan deleted
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!mealPlan) {
      return res.status(404).json({ Success: false, Message: 'Không tìm thấy mục này' });
    }

    await mealPlan.destroy();
    res.json({ Success: true, Message: 'Đã xoá' });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Lỗi kết nối máy chủ', Errors: [err.message] });
  }
});

module.exports = router;
