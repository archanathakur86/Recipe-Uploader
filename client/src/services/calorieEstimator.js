// Deterministic simple calorie estimator based on recipe id or title
// Returns an integer between min and max so the UI shows plausible values
function hashString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export default function estimateCalories(recipe = {}, min = 180, max = 850) {
  const seed = (recipe._id || recipe.title || 'r') + (recipe.title || '');
  const h = hashString(seed.toString());
  const range = Math.max(1, max - min + 1);
  const val = (h % range) + min;
  // round to nearest 5
  return Math.round(val / 5) * 5;
}
