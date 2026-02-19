import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize with a placeholder or environment variable
// USER MUST REPLACE THIS
const API_KEY = "YOUR_GEMINI_API_KEY";

const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeImage = async (imageBase64, language = 'en', diet = 'none') => {
    if (API_KEY === "YOUR_GEMINI_API_KEY") {
        console.warn("Gemini API Key missing. Using mock data.");
        return mockAnalysis(language);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Remove data:image/png;base64, prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const prompt = `
      You are a strict nutritionist. Analyze this image.
      User's Dietary Preference: ${diet.toUpperCase()}.
      
      First, determine if this is a FOOD item.
      
      If it is NOT food (e.g., a person, car, scenery, random object):
      Return JSON: { "isFood": false, "reason": "Not a recognizable food item." }

      If it IS food:
      Check if it complies with the dietary preference (${diet}).
      If it VIOLATES the diet (e.g., Pork for Halal/Kosher, Meat for Vegan/Vegetarian):
         - Set 'isSafe': false
         - 'warning': "Contains [Ingredient], not suitable for ${diet} diet."
      Else:
         - Set 'isSafe': true
         - 'warning': null

      Return JSON with these fields:
      - isFood: true
      - foodName: Specific name of the food (in ${language})
      - calories: Total calories (integer)
      - protein: Protein in grams (integer)
      - carbs: Carbs in grams (integer)
      - fat: Fat in grams (integer)
      - healthScore: 0-100 score (integer)
      - briefTip: A short, actionable health tip (in ${language})
      - confidence: 0-100 score of how sure you are (integer)
      - isSafe: boolean (based on diet)
      - warning: string or null (if diet violated)
      - carbonFootprint: "Low", "Medium", or "High" (string)
      - sustainabilityTip: Short tip to reduce environmental impact (in ${language})

      Language: ${language}
      Return ONLY raw JSON. No markdown.
    `;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/png",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up if markdown is included despite "ONLY raw JSON" instruction
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        return data;

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return { isFood: false, reason: "Error analyzing image." };
    }
};

const mockAnalysis = (lang) => {
    // Simple multilingual mock (fallback)
    const names = {
        en: "Mock Broccoli Soup",
        ko: "브로콜리 스프 (모의)",
        ja: "ブロッコリースープ (模擬)"
    };

    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                isFood: true,
                foodName: names[lang] || names['en'],
                calories: 250,
                protein: 10,
                carbs: 20,
                fat: 15,
                healthScore: 88,
                briefTip: "Great source of vitamins!",
                confidence: 95
            });
        }, 2000);
    });
};
