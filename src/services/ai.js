import { GoogleGenerativeAI } from "@google/generative-ai";

// Array of API keys for rotation to bypass Free Tier limits
const API_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY_FALLBACK_1,
    import.meta.env.VITE_GEMINI_API_KEY_FALLBACK_2
].filter(key => Boolean(key)); // Remove undefined keys

let currentKeyIndex = 0;

export const analyzeImage = async (imageBase64, language = 'en', diet = 'none', isRoastMode = false) => {
    if (API_KEYS.length === 0) {
        console.warn("No Gemini API Keys found. Using mock data.");
        return mockAnalysis(language);
    }

    let attempts = 0;
    while (attempts < API_KEYS.length) {
        const currentKey = API_KEYS[currentKeyIndex];
        const genAI = new GoogleGenerativeAI(currentKey);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // Extract mimeType if present, else default to jpeg
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
            - nextActionTip: Proactive, actionable advice on what the user should DO NEXT based on this food. For example, "Drink a glass of water to flush out sodium" or "Take a 15-minute walk to manage blood sugar." Make it short, punchy, and sound like a helpful navigator (in ${language}) (string)

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
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/^```json/i, '').replace(/^```/, '');
            }
            if (jsonStr.endsWith('```')) {
                jsonStr = jsonStr.replace(/```$/, '');
            }
            jsonStr = jsonStr.trim();

            try {
                const data = JSON.parse(jsonStr);
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
                return { isFood: false, reason: "Analysis succeeded but data format was unreadable. Please try again." };
            }

        } catch (error) {
            console.error(`Gemini Error with key index ${currentKeyIndex}:`, error);

            // Check if it's a 429 Quota Error
            if (error.message && error.message.includes("429")) {
                console.warn(`API Key ${currentKeyIndex} hit rate limit. Rotating to next key...`);
                // Rotate to the next available key
                currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                attempts++;
                // Let the while loop retry with the new key
            } else {
                // Not a quota error, return the failure
                return { isFood: false, reason: "Error analyzing image: " + (error.message || "Unknown error") };
            }
        }
    }

    // If we've exhausted all keys
    return { isFood: false, reason: "All AI capacity is currently maxed out globally. Please try again in a few moments." };
};

const mockAnalysis = (lang) => {
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
