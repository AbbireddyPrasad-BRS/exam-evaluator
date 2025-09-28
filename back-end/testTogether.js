// testTogether.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

const run = async () => {
  const prompt = `Return {"marks": 5, "feedback": "Great answer!"}`;
  const res = await fetch('https://api.together.xyz/v1/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3-8b-chat',
      prompt,
      max_tokens: 100
    })
  });

  const data = await res.json();
  console.log(data.choices[0].text);
};

run();
