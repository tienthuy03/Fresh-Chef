const express = require('express');
const { ShoppingItem, User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/shopping-list:
 *   get:
 *     summary: Get user's shopping list
 *     tags: [ShoppingList]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth, async (req, res) => {
  try {
    const items = await ShoppingItem.findAll({ where: { UserId: req.user.id } });
    res.json({ Success: true, Data: items });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/shopping-list:
 *   post:
 *     summary: Add item to shopping list
 *     tags: [ShoppingList]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, quantity } = req.body;
    const item = await ShoppingItem.create({
      name,
      quantity,
      UserId: req.user.id
    });
    res.status(201).json({ Success: true, Data: item });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/shopping-list/{id}:
 *   patch:
 *     summary: Toggle item checked status
 *     tags: [ShoppingList]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', auth, async (req, res) => {
  try {
    const item = await ShoppingItem.findOne({ 
      where: { id: req.params.id, UserId: req.user.id } 
    });
    if (!item) return res.status(404).json({ Success: false, Message: 'Item not found' });

    item.checked = !item.checked;
    await item.save();

    res.json({ Success: true, Data: item });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/shopping-list:
 *   delete:
 *     summary: Clear shopping list
 *     tags: [ShoppingList]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/', auth, async (req, res) => {
  try {
    await ShoppingItem.destroy({ where: { UserId: req.user.id } });
    res.json({ Success: true, Message: 'List cleared' });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

module.exports = router;
