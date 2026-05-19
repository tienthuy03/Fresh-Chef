/**
 * Helper to estimate recipe nutrition facts deterministically
 * based on the recipe's ID and category to prevent changing database schemas.
 */
function getRecipeNutrition(recipe) {
  if (!recipe) {
    return { calories: 450, protein: 20, carbs: 50, fat: 15 };
  }

  const id = recipe.id || 1;
  const category = (recipe.category || '').toLowerCase();
  const title = (recipe.title || '').toLowerCase();

  let calories = 450;
  let protein = 20;
  let carbs = 50;
  let fat = 15;

  if (category.includes('salad') || title.includes('salad') || title.includes('nộm') || title.includes('gỏi')) {
    // Low calorie, low fat options
    calories = (id % 120) + 180; // 180 - 300 kcal
    protein = (id % 8) + 8;     // 8 - 16g
    carbs = (id % 15) + 15;     // 15 - 30g
    fat = (id % 8) + 6;         // 6 - 14g
  } else if (title.includes('gà') || title.includes('chicken') || category.includes('gà')) {
    // High protein options
    calories = (id % 180) + 380; // 380 - 560 kcal
    protein = (id % 15) + 25;    // 25 - 40g
    carbs = (id % 20) + 15;      // 15 - 35g
    fat = (id % 10) + 10;        // 10 - 20g
  } else if (title.includes('bò') || title.includes('beef') || category.includes('bò') || title.includes('heo') || title.includes('thịt')) {
    // Heavy meat option
    calories = (id % 200) + 450; // 450 - 650 kcal
    protein = (id % 12) + 22;    // 22 - 34g
    carbs = (id % 25) + 20;      // 20 - 45g
    fat = (id % 12) + 15;        // 15 - 27g
  } else if (title.includes('cá') || title.includes('tôm') || title.includes('hải sản') || title.includes('seafood') || category.includes('cá')) {
    // Healthy sea option
    calories = (id % 150) + 350; // 350 - 500 kcal
    protein = (id % 10) + 20;    // 20 - 30g
    carbs = (id % 20) + 20;      // 20 - 40g
    fat = (id % 8) + 8;          // 8 - 16g
  } else {
    // Standard default
    calories = (id % 150) + 400; // 400 - 550 kcal
    protein = (id % 10) + 15;    // 15 - 25g
    carbs = (id % 30) + 40;      // 40 - 70g
    fat = (id % 10) + 10;        // 10 - 20g
  }

  return { calories, protein, carbs, fat };
}

module.exports = {
  getRecipeNutrition,
};
