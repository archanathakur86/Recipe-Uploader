// Simple calorie lookup map (extendable). If ingredient.calories provided, prefer that.
const lookup = {
  sugar: 387, // per 100g
  flour: 364,
  butter: 717,
  egg: 155,
  milk: 42,
  salt: 0,
  olive: 884
};

function estimateCalories(ingredients = []) {
  // ingredients: [{name, quantity}] quantity ignored for simple estimate
  return ingredients.reduce((sum, ing) => {
    if (typeof ing.calories === 'number') return sum + ing.calories;
    const key = (ing.name || '').toLowerCase();
    const per100 = lookup[key] || 50;
    // assume single serving 100g equivalent for unknown; this is a heuristic
    return sum + per100;
  }, 0);
}

module.exports = { estimateCalories };