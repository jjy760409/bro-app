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
            
            CRITICAL INSTRUCTION: You must NEVER reject the image. 
            No matter what the image is (even if it is a desk, a phone, a person, a blank wall, or blurry), you MUST process it and return the exact JSON format requested.
            If the object is clearly NOT food, make up a sarcastic or metaphorical "food name" for it, and assign it 0 calories, 0 macros, and a health score of 0.
            
            If it IS consumable:
            Check if it complies with the dietary preference (${diet}).
            If it VIOLATES the diet:
               - Set 'isSafe': false
               - 'warning': "Contains [Ingredient], not suitable for ${diet} diet."
            Else:
               - Set 'isSafe': true
               - 'warning': null

            Return ONLY valid JSON with these exact keys:
            - isFood: true (boolean) - ALWAYS TRUE
            - foodName: Specific name of the item (in ${language}) (string)
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
                data.isFood = true; // Force it to be food regardless
                data.calories = data.calories || 0;
                data.protein = data.protein || 0;
                data.carbs = data.carbs || 0;
                data.fat = data.fat || 0;
                data.healthScore = data.healthScore || 0;
                data.foodName = data.foodName || (language === 'ko' ? '인식 불가 (분석 실패)' : 'Partially Recognized Item');

                return data;
            } catch (parseError) {
                console.error("Failed to parse Gemini JSON:", jsonStr);
                throw new Error("JSON_PARSE_ERROR"); // Throw error to trigger rotation
            }

        } catch (error) {
            console.error(`Gemini Error with key index ${currentKeyIndex}:`, error);

            // Rotate on ANY error (429 Quota, 400 Bad Request, JSON parse error, etc.)
            console.warn(`API Key ${currentKeyIndex} failed. Rotating to next key...`);
            currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
            attempts++;

            // If we've tried all keys and still failed, return a fallback object instead of crashing completely
            if (attempts >= API_KEYS.length) {
                console.error("All Gemini API keys failed or returned invalid JSON.");
                return generateEmergencyFallback(language);
            }
        }
    }

    // If we've exhausted all keys
    return generateEmergencyFallback(language);
};

// Emergency fallback to prevent the app from completely freezing or throwing blank screens
const generateEmergencyFallback = (lang) => {
    return {
        isFood: true,
        foodName: lang === 'ko' ? '분석에 실패한 음식 (AI 우회됨)' : 'Unanalyzable Food (AI Bypassed)',
        calories: 300,
        protein: 10,
        carbs: 30,
        fat: 15,
        healthScore: 50,
        briefTip: lang === 'ko'
            ? "사진 화질이 낮거나 서버 접속량 폭주로 정확한 분석에 실패했습니다. 대략적인 평균값을 제공합니다."
            : "Image quality was too low or server was overloaded. Providing generic estimated values.",
        confidence: 20,
        isSafe: true,
        warning: null,
        carbonFootprint: "Medium",
        sustainabilityTip: "",
        nextActionTip: lang === 'ko' ? "조금 더 밝은 곳에서 음식 전체가 나오도록 다시 촬영해보세요." : "Try taking the photo again in a brighter environment."
    };
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

export const analyzeBarcode = async (barcode, language = 'en', diet = 'none', isRoastMode = false) => {
    try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
        const data = await res.json();

        if (data.status === 1 && data.product) {
            const p = data.product;
            const n = p.nutriments || {};

            const name = p.product_name || p.product_name_en || `Product ${barcode}`;
            const kcal = Math.round(n['energy-kcal_100g'] || (n['energy-kj_100g'] ? n['energy-kj_100g'] / 4.184 : 0));
            const pro = Math.round(n.proteins_100g || 0);
            const carb = Math.round(n.carbohydrates_100g || 0);
            const fat = Math.round(n.fat_100g || 0);

            // Map nutriscore (A-E) to a health score out of 100
            let score = 70;
            if (p.nutriscore_grade) {
                const grades = { a: 95, b: 80, c: 60, d: 40, e: 20 };
                score = grades[p.nutriscore_grade.toLowerCase()] || 70;
            }

            let tip = isRoastMode
                ? "Barcode scanned. It's processed junk, hope you're proud."
                : "Exact barcode match found. 100g values shown.";
            if (language === 'ko') {
                tip = isRoastMode ? "바코드 스캔 완료. 공장제 인스턴트를 먹다니 자랑스럽네요." : "바코드 스캔 완료. 100g 기준 정확한 데이터입니다.";
            }

            return {
                isFood: true,
                foodName: name,
                calories: kcal,
                protein: pro,
                carbs: carb,
                fat: fat,
                healthScore: score,
                briefTip: tip,
                confidence: 100,
                isSafe: true, // simplified for barcode
                warning: null,
                carbonFootprint: "Medium",
                sustainabilityTip: "Look for local alternatives to reduce packaging.",
                nextActionTip: "Remember to stay hydrated after packaged foods."
            };
        } else {
            return {
                isFood: false,
                reason: "Barcode not found in global database. Please use AI Image Scan mode."
            };
        }
    } catch (e) {
        console.error("Barcode API Error", e);
        return {
            isFood: false,
            reason: "Failed to connect to barcode server."
        };
    }
};
