// generateAIAnswer.js

const axios = require("axios");

async function generateAIAnswer(prompt) {
  try {
    if (!prompt || prompt.trim() === "") {
      throw new Error("Empty prompt provided.");
    }

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",       // Ensure llama3 model is available in your Ollama server
      prompt: prompt,
      stream: false
    });

    const aiResponse = response.data?.response;

    if (!aiResponse || typeof aiResponse !== 'string' || aiResponse.trim() === "") {
      throw new Error("AI response was empty or invalid.");
    }

    return aiResponse.trim();
  } catch (error) {
    console.error("Error generating AI answer:", error.message);
    return null; // Return null to indicate failure
  }
}

module.exports = generateAIAnswer;
