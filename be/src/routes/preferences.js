const express = require('express');
const router = express.Router();
const { User } = require('../models');
const auth = require('../middleware/auth');

// Danh sách các tùy chọn cho khảo sát (Quiz)
router.get('/options', (req, res) => {
  const options = {
    diets: [
      'Vegan', 
      'Keto', 
      'Paleo', 
      'Low-Carb', 
      'Gluten-Free', 
      'Vegetarian', 
      'Dairy-Free',
      'Mediterranean',
      'Whole30'
    ],
    timeLimits: [
      '< 15 mins', 
      '15-30 mins', 
      '30-60 mins', 
      '60+ mins'
    ],
    familySizes: [
      '1 person', 
      '2 people', 
      '4 people', 
      '6+ people'
    ]
  };

  res.json({
    Success: true,
    Data: options
  });
});

// Gửi kết quả khảo sát và lưu vào User
router.post('/submit', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ Success: false, Message: 'User not found' });
    }

    // Cập nhật preferences và đánh dấu đã xong survey
    user.preferences = JSON.stringify(preferences);
    user.hasCompletedSurvey = true;
    await user.save();

    res.json({
      Success: true,
      Message: 'Preferences saved successfully',
      Data: {
        hasCompletedSurvey: user.hasCompletedSurvey
      }
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: err.message });
  }
});

module.exports = router;
