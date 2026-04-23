const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try v1 first
  console.log("--- Listing Models (v1) ---");
  try {
    // Note: The SDK doesn't have a direct listModels on the main class in all versions
    // Usually one uses the API directly or a specific method.
    // However, we can try to generate content with a common model to see if it's there,
    // or use a more direct approach if the SDK supports it.
    // In @google/generative-ai, listing models is usually done via a separate client or direct fetch.
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("v1 failed:", e.message);
  }

  console.log("\n--- Listing Models (v1beta) ---");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("v1beta failed:", e.message);
  }
}

listModels();
