const express = require('express');
const auth = require('../middleware/auth');
const { UserNutrition, Recipe, Sequelize } = require('../models');
const { getRecipeNutrition } = require('../utils/nutritionHelper');

const router = express.Router();

/**
 * Calculate target calories and macronutrients based on Mifflin-St Jeor formula
 */
function calculateNutritionTargets(weight, height, age, gender, activityLevel, goal) {
  // 1. Calculate BMR
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 2. Calculate TDEE based on activity level
  let activityMultiplier = 1.2;
  switch (activityLevel) {
    case 'light':
      activityMultiplier = 1.375;
      break;
    case 'moderate':
      activityMultiplier = 1.55;
      break;
    case 'active':
      activityMultiplier = 1.725;
      break;
    case 'sedentary':
    default:
      activityMultiplier = 1.2;
      break;
  }
  const tdee = Math.round(bmr * activityMultiplier);

  // 3. Adjust calories based on goal
  let targetCalories = tdee;
  if (goal === 'lose_weight') {
    targetCalories = Math.round(tdee - 500);
    if (targetCalories < 1200) targetCalories = 1200; // Safe minimum
  } else if (goal === 'gain_weight') {
    targetCalories = Math.round(tdee + 500);
  }

  // 4. Calculate macros distribution based on goal
  let proteinRatio = 0.20;
  let carbRatio = 0.50;
  let fatRatio = 0.30;

  if (goal === 'lose_weight') {
    // High protein, lower carb
    proteinRatio = 0.30;
    carbRatio = 0.35;
    fatRatio = 0.35;
  } else if (goal === 'gain_weight') {
    // Muscle building: moderately high protein, high carbs
    proteinRatio = 0.25;
    carbRatio = 0.50;
    fatRatio = 0.25;
  }

  const targetProtein = Math.round((targetCalories * proteinRatio) / 4); // 4 kcal per gram
  const targetCarbs = Math.round((targetCalories * carbRatio) / 4);     // 4 kcal per gram
  const targetFat = Math.round((targetCalories * fatRatio) / 9);         // 9 kcal per gram

  return {
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat
  };
}

/**
 * @swagger
 * /api/nutrition/profile:
 *   get:
 *     summary: Get user's current personalized nutrition profile
 *     tags: [Nutrition]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current nutrition profile
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await UserNutrition.findOne({ where: { userId: req.user.id } });
    res.json({ Success: true, Data: profile });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/nutrition/setup:
 *   post:
 *     summary: Set up or update personalized nutrition stats
 *     tags: [Nutrition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [weight, height, age, gender, activityLevel, goal]
 *             properties:
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               activityLevel:
 *                 type: string
 *                 enum: [sedentary, light, moderate, active]
 *               goal:
 *                 type: string
 *                 enum: [lose_weight, maintain, gain_weight]
 */
router.post('/setup', auth, async (req, res) => {
  try {
    const { weight, height, age, gender, activityLevel, goal } = req.body;
    
    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
      return res.status(400).json({ Success: false, Message: 'Vui lòng điền đầy đủ tất cả thông tin.' });
    }

    const { targetCalories, targetProtein, targetCarbs, targetFat } = calculateNutritionTargets(
      parseFloat(weight),
      parseFloat(height),
      parseInt(age),
      gender,
      activityLevel,
      goal
    );

    let profile = await UserNutrition.findOne({ where: { userId: req.user.id } });
    if (profile) {
      await profile.update({
        weight,
        height,
        age,
        gender,
        activityLevel,
        goal,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat
      });
    } else {
      profile = await UserNutrition.create({
        userId: req.user.id,
        weight,
        height,
        age,
        gender,
        activityLevel,
        goal,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat
      });
    }

    res.json({ Success: true, Message: 'Thiết lập kế hoạch dinh dưỡng thành công!', Data: profile });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/nutrition/plan:
 *   get:
 *     summary: Generate a personalized meal plan matching user targets
 *     tags: [Nutrition]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Structured breakfast, lunch, and dinner recommendations
 */
router.get('/plan', auth, async (req, res) => {
  try {
    const profile = await UserNutrition.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(400).json({ 
        Success: false, 
        Message: 'Vui lòng thiết lập chỉ số dinh dưỡng trước khi lên thực đơn!' 
      });
    }

    // 1. Calculate calorie distributions
    const breakfastTarget = Math.round(profile.targetCalories * 0.25);
    const lunchTarget = Math.round(profile.targetCalories * 0.40);
    const dinnerTarget = Math.round(profile.targetCalories * 0.35);

    // 2. Fetch recipes
    const recipes = await Recipe.findAll();
    
    // Parse recipes and attach nutrition deterministically
    const recipesWithNutrition = recipes.map(r => {
      const parsed = r.toJSON();
      const nutrition = getRecipeNutrition(r);
      return {
        ...parsed,
        ingredients: JSON.parse(parsed.ingredients),
        steps: JSON.parse(parsed.steps),
        nutrition
      };
    });

    // 3. Match closest recipes for each meal type
    // Breakfast: Lighter, lower calories, healthy salads or eggs/breads
    const breakfastOptions = recipesWithNutrition
      .filter(r => r.nutrition.calories <= breakfastTarget + 100)
      .sort((a, b) => Math.abs(a.nutrition.calories - breakfastTarget) - Math.abs(b.nutrition.calories - breakfastTarget))
      .slice(0, 20);

    // Lunch: Medium to high calorie mains
    const lunchOptions = recipesWithNutrition
      .sort((a, b) => Math.abs(a.nutrition.calories - lunchTarget) - Math.abs(b.nutrition.calories - lunchTarget))
      .slice(0, 20);

    // Dinner: Lean protein or balanced meals
    const dinnerOptions = recipesWithNutrition
      .filter(r => r.id !== (lunchOptions[0] ? lunchOptions[0].id : null))
      .sort((a, b) => Math.abs(a.nutrition.calories - dinnerTarget) - Math.abs(b.nutrition.calories - dinnerTarget))
      .slice(0, 20);

    res.json({
      Success: true,
      Data: {
        profile,
        targets: {
          breakfast: breakfastTarget,
          lunch: lunchTarget,
          dinner: dinnerTarget
        },
        meals: {
          breakfast: breakfastOptions,
          lunch: lunchOptions,
          dinner: dinnerOptions
        }
      }
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

module.exports = router;
