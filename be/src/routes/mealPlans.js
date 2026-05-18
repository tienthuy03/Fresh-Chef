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
