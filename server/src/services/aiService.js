const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function generateRecipe(prompt) {
  if (!openai) {
    // stub
    return {
      title: `AI: ${prompt.slice(0, 20)}...`,
      ingredients: [{ name: 'water', quantity: '1 cup', calories: 0 }],
      instructions: 'Mix and serve.',
      caloriesTotal: 0
    };
  }
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `Create a recipe: ${prompt}` }],
    max_tokens: 400
  });
  // naive parse from completion
  const text = completion.choices?.[0]?.message?.content || '';
  return { title: 'AI Recipe', ingredients: [{ name: 'ingredient', quantity: '1', calories: 0 }], instructions: text, caloriesTotal: 0 };
}

module.exports = { generateRecipe };