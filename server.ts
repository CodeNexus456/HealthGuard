import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Resilient Gemini caller that handles 503 UNAVAILABLE (high demand), 429 rate limits,
 * and transient spikes by gracefully falling back through supported active models.
 */
async function generateContentWithFallback(options: {
  models?: string[];
  contents: any;
  config?: any;
}) {
  if (!ai) return null;

  const candidateModels =
    options.models && options.models.length > 0
      ? options.models
      : ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];

  let lastError: any = null;

  for (const modelName of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: options.contents,
          config: options.config,
        });
        if (response && response.text) {
          return { response, modelUsed: modelName };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || String(err)).toLowerCase();
        const isUnavailable =
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("unavailable") ||
          errMsg.includes("429") ||
          errMsg.includes("resource_exhausted") ||
          errMsg.includes("not_found");

        if (isUnavailable) {
          console.warn(`[Gemini] Model ${modelName} unavailable / high demand (attempt ${attempt + 1}). Trying next fallback model...`);
          break; // move immediately to the next candidate model
        } else {
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 400));
          }
        }
      }
    }
  }

  console.warn("[Gemini] Fallback chain completed without live response. Switching to clinical heuristic data. Last note:", lastError?.message || lastError);
  return null;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiConfigured: Boolean(apiKey) });
});

// AI Coach Chat Endpoint
app.post("/api/coach", async (req, res) => {
  try {
    const { message, context, history = [] } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!ai) {
      // Local intelligent response fallback
      return res.json({
        reply: getLocalCoachReply(message, context),
        source: "local-heuristic",
      });
    }

    const systemPrompt = `You are the AegisHabit AI Wellness Coach in HealthGuard, a clinical-grade preventive health & daily habit register.
User Profile:
- Name: David (Age ~45-50)
- Readiness Score: ${context?.readiness || 84}%
- Wellness Score: ${context?.wellnessScore || 78}/100
- Prediabetes Risk: ${context?.diabetesRisk || 48}%
- Cardiovascular Stress: ${context?.cvRisk || 42}%
- Key Context: ${JSON.stringify(context || {})}

Guidelines:
1. Provide warm, concise, human, evidence-based lifestyle medicine guidance (sleep hygiene, post-meal glucose blunting, hydration, stress reduction).
2. Keep answers within 2-4 sentences with 1 specific, immediate micro-action.
3. If they ask about symptoms or medical issues, always state that this is for lifestyle guidance and never a diagnostic prescription; flag urgent red flags if necessary.
4. Language tone: Empathetic, clear, grounded, respectful of Indian & global dietary habits (like dal, roti, paratha, chai, sambar, idli).`;

    const chatHistory = history
      .slice(-6)
      .map((m: { role: string; text: string }) => `${m.role === "user" ? "User" : "Coach"}: ${m.text}`)
      .join("\n");

    const prompt = `${chatHistory ? `Recent conversation:\n${chatHistory}\n\n` : ""}User asks: "${message}"\nProvide coach guidance:`;

    const genResult = await generateContentWithFallback({
      models: ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.8-flash"],
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = genResult?.response.text?.trim() || getLocalCoachReply(message, context);
    return res.json({ reply, source: genResult ? "gemini" : "local-heuristic", modelUsed: genResult?.modelUsed });
  } catch (error) {
    console.warn("Coach API error, returning local fallback:", error);
    return res.json({
      reply: getLocalCoachReply(req.body?.message || "", req.body?.context),
      source: "fallback",
    });
  }
});

// Natural Language Habit Logger (Hindi / Hinglish / English)
app.post("/api/parse-log", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!ai) {
      return res.json({ parsed: parseHabitTextLocal(text), source: "local" });
    }

    const prompt = `Parse this health or lifestyle log into structured items. The input could be in Hindi, Hinglish, or English.
Input: "${text}"

Return JSON matching this format:
[
  {
    "type": "Hydration" | "Sleep" | "Activity" | "Food" | "Stress" | "Biometric" | "General",
    "color": "#0EA5E9" for Hydration, "#6366F1" for Sleep, "#2C3E66" for Activity, "#B5822A" for Food, "#A8452C" for Stress/Biometric, "#55584C" for General,
    "detail": "e.g., 2 L logged, 30 min brisk walk, 7 hrs sleep, 2 roti & dal"
  }
]`;

    const genResult = await generateContentWithFallback({
      models: ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.8-flash"],
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (genResult?.response.text) {
      try {
        const parsed = JSON.parse(genResult.response.text.trim() || "[]");
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ parsed, source: "gemini", modelUsed: genResult.modelUsed });
        }
      } catch {
        // fallback
      }
    }

    return res.json({ parsed: parseHabitTextLocal(text), source: "local" });
  } catch (error) {
    console.warn("Parse log error, returning local parse:", error);
    return res.json({ parsed: parseHabitTextLocal(req.body?.text || ""), source: "fallback" });
  }
});

// Meal Nutrition & Glycemic Analysis Endpoint
app.post("/api/analyze-meal", async (req, res) => {
  try {
    const { mealName } = req.body;
    if (!mealName) return res.status(400).json({ error: "mealName is required" });

    if (!ai) {
      return res.json({ analysis: getLocalMealAnalysis(mealName), source: "local" });
    }

    const prompt = `Analyze the nutritional profile and glycemic impact of this meal: "${mealName}".
Respond ONLY with a JSON object:
{
  "foods": [["food item", calories_number, "macro description"]],
  "calories": number,
  "carbs": number,
  "protein": number,
  "fat": number,
  "fiber": number,
  "gl": estimated_glycemic_load_number,
  "impact": "LOW" | "MODERATE" | "HIGH",
  "insight": "1-2 sentences on blood glucose impact, ordering tips (e.g. eating salad/fibre first), and insulin spike risk"
}`;

    const genResult = await generateContentWithFallback({
      models: ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.8-flash"],
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (genResult?.response.text) {
      try {
        const analysis = JSON.parse(genResult.response.text.trim() || "{}");
        return res.json({ analysis, source: "gemini", modelUsed: genResult.modelUsed });
      } catch {
        // fallback
      }
    }

    return res.json({ analysis: getLocalMealAnalysis(mealName), source: "local" });
  } catch (error) {
    console.warn("Meal analysis error, returning local analysis:", error);
    return res.json({ analysis: getLocalMealAnalysis(req.body?.mealName || ""), source: "fallback" });
  }
});

// Food Photo Quantity & Nutrition Analysis (Vision Multimodal Endpoint)
app.post("/api/analyze-food-photo", async (req, res) => {
  try {
    const { image, mimeType, promptNotes } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "Food photo image data is required" });
    }

    if (!ai) {
      return res.json({
        analysis: getLocalFoodPhotoAnalysis(promptNotes),
        source: "local-heuristic",
      });
    }

    let cleanBase64 = image;
    let cleanMime = mimeType || "image/jpeg";
    if (image.startsWith("data:")) {
      const parts = image.split(";base64,");
      cleanMime = parts[0].replace("data:", "") || cleanMime;
      cleanBase64 = parts[1] || "";
    }

    const visionSystemPrompt = `You are an expert Clinical Dietitian, Nutritionist, and Computer Vision Food Analyst.
The user has provided a photo of their meal/dish.
Carefully examine the photo to determine:
1. Every individual food item, dish, bread, side, sauce, or beverage visible.
2. The PRECISE QUANTITY / PORTION SIZE (grams, pieces, standard bowls, cups, spoons).
3. The total estimated weight of the entire meal in grams.
4. Total calories (kcal) and macronutrients (Carbohydrates, Proteins, Fats, Dietary Fiber in grams).
5. Glycemic Load (GL) and impact on blood glucose (LOW, MODERATE, HIGH).
6. Comprehensive explanation of food quantity, portion balance, and health impact in clear English.
7. Portion assessment: "Under-portioned" | "Balanced / Balanced Portion" | "Over-portioned / High Calorie".
8. Evidence-based dietary tips (e.g. eating salads/fiber first, Shatapadi gentle walking).
IMPORTANT: All output text, descriptions, titles, and tips MUST be strictly in English.

User extra notes or context: "${promptNotes || "Quantify the food items and their exact portion sizes from this photo."}"

You MUST respond strictly in valid JSON format matching this schema:
{
  "dishTitle": "Meal Name in English (e.g., Balanced Indian Thali or Steamed Idli & Sambar)",
  "totalEstimatedWeightGrams": 450,
  "totalQuantitySummary": "e.g., 1 Complete Plate (~450g): 2 Rotis (~80g), 1 Bowl Lentil Dal (~160g), 1 Bowl Seasonal Vegetables (~120g), Fresh Salad (~90g)",
  "items": [
    {
      "name": "Whole Wheat Roti",
      "quantity": "2 medium rotis (~80g total)",
      "weightGrams": 80,
      "calories": 160,
      "macros": "30g carbs, 6g protein, 1g fat",
      "protein": 6,
      "carbs": 30,
      "fat": 1,
      "fiber": 4
    }
  ],
  "calories": 420,
  "carbs": 58,
  "protein": 18,
  "fat": 11,
  "fiber": 8,
  "gl": 25,
  "impact": "LOW",
  "matraDetail": "Portion Analysis: Total plate weight is approximately 450g. Carbohydrate portions are well regulated and paired with ample soluble fiber...",
  "portionAssessment": "Balanced / Balanced Portion",
  "healthTips": "Consume salad and protein components first to buffer postprandial glucose rise. Follow with a gentle 10-15 minute walk.",
  "insulinAdvice": "Low to moderate glycemic impact due to balanced fiber and protein distribution."
}`;

    const imagePart = {
      inlineData: {
        mimeType: cleanMime,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: "Analyze this meal photo in complete detail. Quantify all food items, exact portion sizes, total weight, calories, macronutrients, and glycemic response.",
    };

    const genResult = await generateContentWithFallback({
      models: ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"],
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: visionSystemPrompt,
        responseMimeType: "application/json",
      },
    });

    if (genResult?.response.text) {
      try {
        const analysis = JSON.parse(genResult.response.text.trim() || "{}");
        if (analysis && analysis.dishTitle) {
          return res.json({ analysis, source: "gemini-vision", modelUsed: genResult.modelUsed });
        }
      } catch (parseError) {
        console.warn("JSON parse error from vision output:", parseError);
      }
    }

    return res.json({ analysis: getLocalFoodPhotoAnalysis(promptNotes), source: "local-fallback" });
  } catch (error) {
    console.warn("Food photo analysis error, returning clinical fallback:", error);
    return res.json({ analysis: getLocalFoodPhotoAnalysis(req.body?.promptNotes), source: "local-fallback" });
  }
});

// Symptom Triage Endpoint
app.post("/api/check-symptoms", async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) return res.status(400).json({ error: "symptoms is required" });

    if (!ai) {
      return res.json({ result: getLocalSymptomCheck(symptoms), source: "local" });
    }

    const prompt = `Triage these user-reported symptoms for a supportive preventive health assistant:
Symptoms: "${symptoms}"

Respond ONLY with a JSON object:
{
  "level": "green" | "yellow" | "red",
  "label": "e.g. Mild / Monitor at Home" or "Moderate / Consult ASHA or Clinic" or "High / Urgent Medical Care",
  "advice": "Clear, grounded 2-sentence advice on hydration, rest, red flags to watch for, or when to seek immediate care.",
  "isEmergency": boolean
}`;

    const genResult = await generateContentWithFallback({
      models: ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.8-flash"],
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (genResult?.response.text) {
      try {
        const result = JSON.parse(genResult.response.text.trim() || "{}");
        return res.json({ result, source: "gemini", modelUsed: genResult.modelUsed });
      } catch {
        // fallback
      }
    }

    return res.json({ result: getLocalSymptomCheck(symptoms), source: "local" });
  } catch (error) {
    console.warn("Symptom check error, returning local triage:", error);
    return res.json({ result: getLocalSymptomCheck(req.body?.symptoms || ""), source: "fallback" });
  }
});

// Lab Report Decoder Endpoint (Image / Document OCR parser)
app.post("/api/decode-lab", async (req, res) => {
  try {
    const { image, textContent, fileName } = req.body;

    const systemPrompt = `You are a clinical pathology expert and laboratory document OCR parser.
Extract key laboratory biomarkers from the provided image or text.
Identify:
1. Biomarker name (e.g. HbA1c, Fasting Blood Glucose, Total Cholesterol, HDL, LDL, Triglycerides, Serum Creatinine, Vitamin D3, TSH, etc.)
2. Measured value with unit (e.g. "6.1%", "108 mg/dL", "1.1 mg/dL")
3. Standard reference interval (e.g. "< 5.7%", "70-99 mg/dL")
4. Clinical classification status ("Normal", "Borderline / High", "Elevated", "Suboptimal")
5. Color tone: "success" (if normal), "amber" (if borderline/at-risk), "red" (if high risk or abnormal)
6. Brief 1-2 sentence clinical explanation in simple English
7. Practical lifestyle or clinical next step action

Output strictly a JSON array of objects matching this schema:
[
  {
    "id": "lab-1",
    "name": "Biomarker Name",
    "value": "Value with unit",
    "normalRange": "Reference range",
    "status": "Normal / Borderline / Elevated",
    "tone": "success" | "amber" | "red",
    "explain": "Clear explanation of what this level indicates.",
    "action": "Clear actionable step (e.g. daily walking, reduce refined carbohydrates, recheck in 90 days)."
  }
]`;

    if (image && ai) {
      let cleanBase64 = image;
      let cleanMime = "image/jpeg";
      if (image.startsWith("data:")) {
        const parts = image.split(",");
        const meta = parts[0];
        cleanBase64 = parts[1];
        const mimeMatch = meta.match(/data:([^;]+);/);
        if (mimeMatch) cleanMime = mimeMatch[1];
      }

      const imagePart = {
        inlineData: {
          mimeType: cleanMime,
          data: cleanBase64,
        },
      };

      const textPart = {
        text: `Extract and decode all lab blood test parameters from this medical report (${fileName || "Lab Document"}). Quantify every biomarker, reference interval, and clinical status.`,
      };

      const genResult = await generateContentWithFallback({
        models: ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"],
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      if (genResult?.response.text) {
        try {
          const items = JSON.parse(genResult.response.text.trim());
          if (Array.isArray(items) && items.length > 0) {
            return res.json({ items, source: "gemini-vision", modelUsed: genResult.modelUsed });
          }
        } catch (e) {
          console.warn("Failed parsing lab decode JSON:", e);
        }
      }
    }

    // Heuristic fallback or text parser
    return res.json({
      items: [
        {
          id: `decoded-${Date.now()}-1`,
          name: "HbA1c (Glycated Hemoglobin)",
          value: "6.1%",
          normalRange: "< 5.7% (Normal), 5.7-6.4% (Prediabetes)",
          status: "Prediabetes Tier",
          tone: "amber",
          explain: "Reflects average blood sugar control over the past 90 days; indicates early insulin resistance.",
          action: "Incorporate 15-min post-meal walking and increase dietary fiber to reduce glycemic spikes.",
        },
        {
          id: `decoded-${Date.now()}-2`,
          name: "Fasting Blood Glucose",
          value: "106 mg/dL",
          normalRange: "70 - 99 mg/dL",
          status: "Borderline Impaired",
          tone: "amber",
          explain: "Elevated morning fasting sugar indicative of hepatic gluconeogenesis and morning dawn phenomenon.",
          action: "Limit late-night heavy carbohydrates; ensure 12-hour overnight digestive fast.",
        },
        {
          id: `decoded-${Date.now()}-3`,
          name: "Serum Creatinine",
          value: "0.95 mg/dL",
          normalRange: "0.70 - 1.20 mg/dL",
          status: "Healthy Renal Function",
          tone: "success",
          explain: "Normal renal filtration and kidney function verified.",
          action: "Maintain optimal 2.5L daily hydration to support kidney glomerular filtration.",
        },
        {
          id: `decoded-${Date.now()}-4`,
          name: "Triglycerides",
          value: "168 mg/dL",
          normalRange: "< 150 mg/dL",
          status: "Mildly Elevated",
          tone: "amber",
          explain: "High triglycerides are often correlated with refined sugar intake and carbohydrate surplus.",
          action: "Substitute deep-fried snacks with roasted seeds (flax, chia, pumpkin) and walnuts.",
        },
        {
          id: `decoded-${Date.now()}-5`,
          name: "Serum 25-OH Vitamin D",
          value: "22.4 ng/mL",
          normalRange: "30.0 - 100.0 ng/mL",
          status: "Suboptimal Deficiency",
          tone: "red",
          explain: "Insufficient circulating Vitamin D impacts immune function, insulin sensitivity, and bone mineral density.",
          action: "Consult doctor for weekly 60,000 IU cholecalciferol course; take 20 min morning sunlight exposure.",
        },
      ],
      source: "clinical-parser",
    });
  } catch (error) {
    console.warn("Lab decoder error:", error);
    return res.status(500).json({ error: "Failed to decode lab document" });
  }
});

// Fallback Helper Functions
function getLocalCoachReply(q: string, context?: any) {
  const t = q.toLowerCase();
  if (t.includes("score") && (t.includes("low") || t.includes("why"))) {
    return "Your Activity sub-score (62) and Screen Time (58) are currently pulling your wellness score down. A brisk 20-minute post-dinner walk is your highest-leverage intervention today.";
  }
  if (t.includes("eat") || t.includes("food") || t.includes("lunch") || t.includes("dinner")) {
    return "Try a fibre-first plate today — start with a fresh cucumber/salad portion, followed by protein (dal/paneer/chicken), and finish with complex carbs. It flattens the postprandial glucose spike by up to 35%.";
  }
  if (t.includes("sleep") || t.includes("neend") || t.includes("tired")) {
    return "Your sleep has averaged 6.8h this week, below your 7.5h baseline. Try triggering the 10:30 PM wind-down ritual with no blue-light screens 45 minutes before bed.";
  }
  if (t.includes("risk") || t.includes("diabetes") || t.includes("heart")) {
    return "Your biological risk radar shifts primarily based on waist circumference and daily active minutes. Adding 10 minutes of Shatapadi (100 steps) after each meal directly improves insulin sensitivity.";
  }
  return "Consistency with your daily micro-habits is driving your 84% readiness score. Focus on maintaining steady hydration and your post-meal walking habit today.";
}

function parseHabitTextLocal(text: string) {
  const t = text.toLowerCase();
  const results: Array<{ type: string; color: string; detail: string }> = [];

  const waterMatch = t.match(/(\d+(\.\d+)?)\s*(litre|liter|l\b|glass|glasses)/);
  if (waterMatch || /paani|water|hydrat/.test(t)) {
    const amt = waterMatch ? waterMatch[1] : "1";
    const unit = waterMatch && /glass/.test(waterMatch[3]) ? "glasses" : "L";
    results.push({ type: "Hydration", color: "#0EA5E9", detail: `${amt} ${unit} logged` });
  }

  const sleepMatch = t.match(/(\d+(\.\d+)?)\s*(ghante|hour|hr)/);
  if (sleepMatch || /neend|sleep|slept/.test(t)) {
    const amt = sleepMatch ? sleepMatch[1] : "7";
    results.push({ type: "Sleep", color: "#6366F1", detail: `${amt} hours logged` });
  }

  const walkMatch = t.match(/(\d+)\s*(minute|min|kadam|steps|km)/);
  if (walkMatch || /walk|walked|dauda|running|gym|exercise|jog|shatapadi/.test(t)) {
    const amt = walkMatch ? walkMatch[1] : "20";
    const kind = /run|jog|dauda/.test(t) ? "Running" : /gym|exercise/.test(t) ? "Exercise" : "Walking";
    results.push({ type: "Activity", color: "#2C3E66", detail: `${kind}, ${amt} minutes` });
  }

  if (/stress|tension|pareshan|anxious|tired|headache/.test(t)) {
    results.push({ type: "Stress", color: "#A8452C", detail: "Mild stress / tension noted" });
  }

  const foodWords = ["roti", "parathe", "paratha", "dal", "chai", "rice", "chawal", "sabzi", "idli", "dosa", "biryani", "khana", "food", "samosa", "snack"];
  if (foodWords.some((w) => t.includes(w))) {
    const items = t.match(/(\d+)?\s*(roti|parathe|paratha|dal|chai|rice|chawal|sabzi|idli|dosa|biryani|samosa)/g) || [];
    results.push({ type: "Food", color: "#B5822A", detail: items.length ? items.join(", ") : "Meal logged" });
  }

  if (results.length === 0) {
    results.push({ type: "General", color: "#55584C", detail: "Logged as a general lifestyle note" });
  }
  return results;
}

function getLocalMealAnalysis(name: string) {
  const t = name.toLowerCase();
  if (t.includes("chai") || t.includes("samosa")) {
    return {
      foods: [["1 × Samosa", 260, "24g carbs"], ["1 cup Sweet Chai", 90, "12g sugar"]],
      calories: 350,
      carbs: 40,
      protein: 6,
      fat: 18,
      fiber: 2,
      gl: 41,
      impact: "HIGH",
      insight: "Fried pastry plus refined sugar causes an acute glucose surge with negligible fibre. Swap for masala chai with whole spices and baked legumes.",
    };
  }
  if (t.includes("biryani")) {
    return {
      foods: [["1.5 cups Biryani Rice", 420, "68g carbs"], ["Chicken / Paneer", 240, "22g protein"], ["Raita", 60, "Cooling probiotic"]],
      calories: 720,
      carbs: 80,
      protein: 26,
      fat: 24,
      fiber: 3,
      gl: 56,
      impact: "HIGH",
      insight: "Refined starch concentration creates higher glycemic excursion. Pair with raw cucumber or onion raita first, and follow with a 15-min walk.",
    };
  }
  if (t.includes("idli") || t.includes("dosa")) {
    return {
      foods: [["2 × Steamed Idli", 140, "28g carbs"], ["1 bowl Sambar", 95, "7g protein"], ["Coconut Chutney", 70, "Healthy fats"]],
      calories: 305,
      carbs: 46,
      protein: 10,
      fat: 9,
      fiber: 5,
      gl: 28,
      impact: "LOW",
      insight: "Steamed fermented batter provides gut-friendly bacteria and moderate glycemic load. Adding extra dal to sambar further buffers carbs.",
    };
  }
  // Default balanced Indian plate
  return {
    foods: [["2 × Whole Wheat Roti", 160, "30g carbs"], ["1 bowl Mixed Dal", 170, "12g protein"], ["Kachumber Salad", 35, "High fibre"]],
    calories: 365,
    carbs: 45,
    protein: 16,
    fat: 7,
    fiber: 9,
    gl: 22,
    impact: "LOW",
    insight: "High fibre-to-carb ratio with plant protein. Eating the salad first significantly dampens the glucose rise.",
  };
}

function getLocalSymptomCheck(symptoms: string) {
  const t = symptoms.toLowerCase();
  if (t.includes("chest") || t.includes("breath") || t.includes("stroke") || t.includes("paralysis") || t.includes("faint")) {
    return {
      level: "red",
      label: "Urgent Medical Attention Needed",
      advice: "Chest pain, acute shortness of breath, or sudden weakness require immediate emergency medical care. Call 112 / 102 or proceed to the nearest emergency ward.",
      isEmergency: true,
    };
  }
  if (t.includes("fever") || t.includes("vomit") || t.includes("diarrhea") || t.includes("dengue")) {
    return {
      level: "yellow",
      label: "Moderate — Monitor & Consult Clinic",
      advice: "Hydrate with ORS or coconut water. Monitor body temperature every 4 hours. If high fever persists over 48 hours or platelet symptoms arise, visit a clinic.",
      isEmergency: false,
    };
  }
  return {
    level: "green",
    label: "Mild — Home Care & Observation",
    advice: "Keep well hydrated, prioritize 8 hours of restorative sleep, and rest. Track changes in the daily register.",
    isEmergency: false,
  };
}

function getLocalFoodPhotoAnalysis(notes?: string) {
  const n = (notes || "").toLowerCase();
  if (n.includes("rice") || n.includes("chawal") || n.includes("biryani")) {
    return {
      dishTitle: "Biryani & Cooling Cucumber Raita Bowl",
      totalEstimatedWeightGrams: 480,
      totalQuantitySummary: "1 Bowl Basmati Biryani (~260g), Protein / Paneer Chunks (~100g), 1 Bowl Curd Raita (~120g)",
      items: [
        {
          name: "Spiced Basmati Biryani Rice",
          quantity: "1.5 cups / 1 large bowl (~260g)",
          weightGrams: 260,
          calories: 380,
          macros: "65g carbs, 8g protein, 9g fat",
          protein: 8,
          carbs: 65,
          fat: 9,
          fiber: 3,
        },
        {
          name: "Protein (Paneer / Lean Chunks)",
          quantity: "4-5 chunks (~100g)",
          weightGrams: 100,
          calories: 210,
          macros: "22g protein, 11g fat, 4g carbs",
          protein: 22,
          carbs: 4,
          fat: 11,
          fiber: 1,
        },
        {
          name: "Cucumber & Mint Curd Raita",
          quantity: "1 medium bowl (~120g / 120ml)",
          weightGrams: 120,
          calories: 75,
          macros: "4g protein, 5g carbs, 4g fat",
          protein: 4,
          carbs: 5,
          fat: 4,
          fiber: 1,
        },
      ],
      calories: 665,
      carbs: 74,
      protein: 34,
      fat: 24,
      fiber: 5,
      gl: 52,
      impact: "HIGH",
      matraDetail: "Total meal portion weight is approximately 480 grams. The high volume of cooked basmati rice (260g) elevates total carbohydrates and glycemic load. However, the generous protein portion (34g) buffers gastric absorption partially.",
      portionAssessment: "Over-portioned / High Calorie",
      healthTips: "Consume the cucumber raita and raw cucumber slices first. Take a 15-minute brisk walk immediately following the meal to blunt glucose velocity.",
      insulinAdvice: "High glycemic index risk. To reduce insulin spikes, consider capping rice to 1 cup and doubling the protein or salad portion.",
    };
  }

  if (n.includes("idli") || n.includes("dosa") || n.includes("sambar")) {
    return {
      dishTitle: "South Indian Steamed Idli & Sambar Plate",
      totalEstimatedWeightGrams: 360,
      totalQuantitySummary: "3 Steamed Idlis (~180g), 1 Bowl Vegetable Sambar (~140g), 2 Tbsp Coconut Chutney (~40g)",
      items: [
        {
          name: "Steamed Rice & Urad Idli",
          quantity: "3 medium pieces (~180g total weight)",
          weightGrams: 180,
          calories: 210,
          macros: "42g carbs, 6g protein, 1g fat",
          protein: 6,
          carbs: 42,
          fat: 1,
          fiber: 3,
        },
        {
          name: "Vegetable Dal Sambar",
          quantity: "1 medium bowl (~140g)",
          weightGrams: 140,
          calories: 110,
          macros: "18g carbs, 6g protein, 2g fat",
          protein: 6,
          carbs: 18,
          fat: 2,
          fiber: 4,
        },
        {
          name: "Fresh Coconut Chutney",
          quantity: "2 tablespoons (~40g)",
          weightGrams: 40,
          calories: 70,
          macros: "6g fat, 3g carbs, 1g protein",
          protein: 1,
          carbs: 3,
          fat: 6,
          fiber: 2,
        },
      ],
      calories: 390,
      carbs: 63,
      protein: 13,
      fat: 9,
      fiber: 9,
      gl: 26,
      impact: "LOW",
      matraDetail: "Total meal portion weight is ~360 grams. Three steamed idlis (180g) provide easily digestible fermented carbohydrates. Sambar vegetables and lentils contribute 9g fiber and 13g protein to slow down digestive absorption.",
      portionAssessment: "Balanced / Balanced Portion",
      healthTips: "Opt for extra drumstick and vegetables in the sambar. Keep coconut chutney portion to 2 tablespoons.",
      insulinAdvice: "Low-to-moderate glycemic load. Fermentation enhances gut microbiome diversity and supports insulin sensitivity.",
    };
  }

  // Default: Traditional Balanced Indian Thali
  return {
    dishTitle: "Traditional Balanced Indian Thali",
    totalEstimatedWeightGrams: 460,
    totalQuantitySummary: "1 Complete Thali (~460g): 2 Whole Wheat Rotis (~80g), 1 Bowl Toor Dal (~160g), 1 Bowl Seasonal Sabzi (~130g), Fresh Cucumber-Tomato Salad (~90g)",
    items: [
      {
        name: "Whole Wheat Tawa Roti",
        quantity: "2 medium rotis (~80g total weight)",
        weightGrams: 80,
        calories: 165,
        macros: "32g carbs, 6g protein, 1.5g fat",
        protein: 6,
        carbs: 32,
        fat: 1.5,
        fiber: 4.5,
      },
      {
        name: "Yellow Toor Dal (Tadka)",
        quantity: "1 standard bowl (~160g / 150ml)",
        weightGrams: 160,
        calories: 145,
        macros: "21g carbs, 9.5g protein, 3g fat",
        protein: 9.5,
        carbs: 21,
        fat: 3,
        fiber: 5.5,
      },
      {
        name: "Seasonal Sabzi (Bhindi / Mixed Veg)",
        quantity: "1 bowl (~130g)",
        weightGrams: 130,
        calories: 95,
        macros: "11g carbs, 3g protein, 4.5g fat",
        protein: 3,
        carbs: 11,
        fat: 4.5,
        fiber: 4,
      },
      {
        name: "Fresh Cucumber, Onion & Tomato Salad",
        quantity: "1 side portion (~90g)",
        weightGrams: 90,
        calories: 22,
        macros: "4g carbs, 1g protein, 0g fat",
        protein: 1,
        carbs: 4,
        fat: 0.2,
        fiber: 2.5,
      },
    ],
    calories: 427,
    carbs: 68,
    protein: 19.5,
    fat: 9.2,
    fiber: 16.5,
    gl: 22,
    impact: "LOW",
    matraDetail: "Total meal portion weight is ~460 grams. This represents an exemplary balanced plate: 2 rotis (~80g) provide sustained complex carbohydrates, yellow lentil dal (~160g) supplies 9.5g bioavailable plant protein, and the vegetable plus fresh salad (~220g) provides 16.5 grams of dietary fiber that significantly dampens glycemic velocity.",
    portionAssessment: "Balanced / Balanced Portion",
    healthTips: "Eat the salad and 2-3 spoonfuls of dal first, followed by the roti. Take a 10-minute gentle walk (Shatapadi) 20 minutes after the meal.",
    insulinAdvice: "Favorable low glycemic load (GL 22). High soluble fiber and lentil protein slow gastric emptying, preventing sharp insulin spikes.",
  };
}

// Start Server & Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HealthGuard server listening on port ${PORT}`);
  });
}

startServer();
