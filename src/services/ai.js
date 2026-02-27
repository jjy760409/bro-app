import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the environment variable for the real Gemini API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeImage = async (imageBase64, language = 'en', diet = 'none', isRoastMode = false) => {
    if (!API_KEY) {
        console.warn("Gemini API Key missing (VITE_GEMINI_API_KEY). Using mock data.");
        return mockAnalysis(language);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Extract mimeType if present, else default to jpeg since we changed the camera export
        const matches = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = matches ? matches[1] : "image/jpeg";

        // Remove data:image/...;base64, prefix
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const tipInstruction = isRoastMode
            ? `briefTip: Instead of a polite health tip, brutally ROAST the user for eating this in ${language}. Use savage, Gen-Z humor. Be funny but mean about its nutritional value.`
            : `briefTip: A short, actionable and polite health tip (in ${language}).`;

        const prompt = `
      You are an expert nutritionist and food analyst. Analyze this image.
      User's Dietary Preference: ${diet.toUpperCase()}.
      
      Determine if this image contains ANYTHING consumable by humans (e.g., meals, snacks, packaged foods, beverages, ingredients, dietary supplements).
      Be Extremely Lenient: If it looks remotely like food, a drink, or a nutritional item, consider it FOOD.
      
      If it is absolutely NOT consumable (e.g., a person, car, scenery, furniture, random object with no relation to food):
      Return JSON: { "isFood": false, "reason": "Not a recognizable consumable item." }

      If it IS consumable:
      Check if it complies with the dietary preference (${diet}).
      If it VIOLATES the diet (e.g., Pork for Halal/Kosher, Meat for Vegan/Vegetarian):
         - Set 'isSafe': false
         - 'warning': "Contains [Ingredient], not suitable for ${diet} diet."
      Else:
         - Set 'isSafe': true
         - 'warning': null

      Provide your best estimate for the nutritional values. If you cannot be entirely sure, make an educated guess based on typical serving sizes for the item shown.
      
      Return ONLY valid JSON with these exact keys:
      - isFood: true (boolean)
      - foodName: Specific name of the food/drink (in ${language}) (string)
      - calories: Total calories (integer)
      - protein: Protein in grams (integer)
      - carbs: Carbs in grams (integer)
      - fat: Fat in grams (integer)
      - healthScore: 0-100 score (integer)
      - ${tipInstruction} (string)
      - confidence: 0-100 score of how sure you are (integer)
      - isSafe: boolean (based on diet)
      - warning: string or null (if diet violated)
      - carbonFootprint: "Low", "Medium", or "High" (string)
      - sustainabilityTip: Short tip to reduce environmental impact (in ${language}) (string)

      Language: ${language}
      DO NOT INCLUDE ANY MARKDOWN PRINTS like \`\`\`json. Return ONLY raw JSON text.
    `;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Robust JSON Parsing
        let jsonStr = text.trim();
        // aggressively strip markdown if the model hallucinated it
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```json/i, '').replace(/^```/, '');
        }
        if (jsonStr.endsWith('```')) {
            jsonStr = jsonStr.replace(/```$/, '');
        }
        jsonStr = jsonStr.trim();

        try {
            const data = JSON.parse(jsonStr);
            // Ensure essential fields exist even if AI hallucinated
            if (data.isFood !== false) {
                data.calories = data.calories || 0;
                data.protein = data.protein || 0;
                data.carbs = data.carbs || 0;
                data.fat = data.fat || 0;
                data.healthScore = data.healthScore || 50;
                data.foodName = data.foodName || (language === 'ko' ? '알 수 없는 부분 인식됨' : 'Partially Recognized Item');
            }
            return data;
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON:", jsonStr);
            console.error(parseError);
            return { isFood: false, reason: "Analysis succeeded but data format was unreadable. Please try again." };
        }

    } catch (error) {
        console.error("Gemini Analysis Error details:", error);
        return { isFood: false, reason: "Error analyzing image: " + (error.message || "Unknown error") };
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
