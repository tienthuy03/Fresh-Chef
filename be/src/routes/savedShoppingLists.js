const express = require('express');
const { SavedShoppingList, ShoppingItem } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/saved-shopping-lists:
 *   get:
 *     summary: Get all saved custom shopping lists of the authenticated user
 *     tags: [SavedShoppingLists]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth, async (req, res) => {
  try {
    const lists = await SavedShoppingList.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    // Parse items JSON for frontend ease
    const formattedLists = lists.map(l => {
      const data = l.toJSON();
      try {
        data.items = JSON.parse(data.items);
      } catch (e) {
        data.items = [];
      }
      return data;
    });

    res.json({ Success: true, Data: formattedLists });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/saved-shopping-lists:
 *   post:
 *     summary: Create/Save a custom named shopping list
 *     tags: [SavedShoppingLists]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, items } = req.body;
    if (!name || !items || !Array.isArray(items)) {
      return res.status(400).json({ Success: false, Message: 'Invalid request body' });
    }

    const savedList = await SavedShoppingList.create({
      name,
      items: JSON.stringify(items),
      UserId: req.user.id
    });

    const data = savedList.toJSON();
    data.items = items;

    res.status(201).json({ Success: true, Data: data });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/saved-shopping-lists/{id}:
 *   delete:
 *     summary: Delete a saved custom shopping list
 *     tags: [SavedShoppingLists]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await SavedShoppingList.findOne({
      where: { id: req.params.id, UserId: req.user.id }
    });
    
    if (!list) {
      return res.status(404).json({ Success: false, Message: 'Saved shopping list not found' });
    }

    await list.destroy();
    res.json({ Success: true, Message: 'Saved shopping list deleted' });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/saved-shopping-lists/{id}/import:
 *   post:
 *     summary: Import all ingredients from a saved list into the active global checklist
 *     tags: [SavedShoppingLists]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/import', auth, async (req, res) => {
  try {
    const list = await SavedShoppingList.findOne({
      where: { id: req.params.id, UserId: req.user.id }
    });

    if (!list) {
      return res.status(404).json({ Success: false, Message: 'Saved shopping list not found' });
    }

    let items = [];
    try {
      items = JSON.parse(list.items);
    } catch (e) {
      items = [];
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ Success: false, Message: 'List template is empty' });
    }

    // Add items to permanent checklist
    const createdItems = [];
    for (const item of items) {
      const created = await ShoppingItem.create({
        name: item.name,
        quantity: item.quantity,
        UserId: req.user.id,
        checked: false
      });
      createdItems.push(created);
    }

    res.json({
      Success: true,
      Message: `Đã nhập thành công ${createdItems.length} nguyên liệu vào giỏ chợ!`,
      Data: createdItems
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

module.exports = router;
