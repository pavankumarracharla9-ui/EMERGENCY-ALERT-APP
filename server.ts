import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI client if key is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// API Health & Capabilities endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(ai),
    timestamp: new Date().toISOString(),
    version: '1.0.0-hackathon-demo',
    mode: 'demonstration',
  });
});

// Emergency AI Classification endpoint
app.post('/api/ai/classify-emergency', async (req, res) => {
  const { description, emergencyType, affectedCount, locationText } = req.body;

  if (!description && !emergencyType) {
    return res.status(400).json({ error: 'Description or emergency type is required' });
  }

  // If Gemini API is available, perform real model inference
  if (ai) {
    try {
      const prompt = `You are RESQ-AI's emergency assessment system. Analyze this emergency report:
Emergency Type Provided: ${emergencyType || 'Unspecified'}
Reported Description: "${description || ''}"
Affected People: ${affectedCount || 'Unknown'}
Reported Location: "${locationText || 'Unspecified'}"

Extract key structured details and evaluate priority for human dispatcher review.
Priority rules:
- Critical: Immediate threat to life, severe multi-vehicle collision, unconsciousness, heavy bleeding, active major structural fire, cardiac/respiratory arrest.
- High: Serious injury, fractures, moderate fire, trapped individuals, acute worsening medical condition.
- Moderate: Minor injuries, controlled hazards, non-life-threatening medical symptoms.
- Low: Informational, property damage without injury, post-incident reporting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an AI assistant for human emergency dispatchers. Provide objective, helpful prioritization recommendations. Never hallucinate facts or claim guaranteed medical certainty.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              priority: {
                type: Type.STRING,
                description: 'Must be one of: Critical, High, Moderate, Low',
              },
              confidence: {
                type: Type.NUMBER,
                description: 'Confidence score between 0.0 and 1.0',
              },
              category: {
                type: Type.STRING,
                description: 'Classified incident category (e.g., Road Accident, Medical Emergency, Fire, Security, Natural Disaster, Other)',
              },
              summary: {
                type: Type.STRING,
                description: 'Concise 1-2 sentence executive briefing for the response crew',
              },
              extractedAffectedCount: {
                type: Type.INTEGER,
                description: 'Number of affected people deduced from text',
              },
              extractedLocation: {
                type: Type.STRING,
                description: 'Key location landmarks or street mentions extracted from text',
              },
              hazards: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Potential safety hazards (e.g. fuel spill, downed power lines, structural collapse risk)',
              },
              recommendedEquipment: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Recommended response equipment (e.g. ALS kit, hydraulic rescue tools, burn treatment kit, thermal imaging)',
              },
              missingInformation: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Critical missing questions dispatcher should ask caller',
              },
              priorityRationale: {
                type: Type.STRING,
                description: 'Clear objective rationale for the assigned priority level',
              },
            },
            required: ['priority', 'category', 'summary', 'priorityRationale'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          source: 'gemini-3.8-flash',
          isSimulated: false,
          ...parsed,
        });
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to rule-based classification:', err);
    }
  }

  // Graceful rule-based fallback (Simulated AI Assessment)
  const text = `${emergencyType || ''} ${description || ''}`.toLowerCase();
  let priority = 'Moderate';
  let priorityRationale = 'Standard incident report evaluated under default emergency triage protocols.';
  let confidence = 0.88;
  const hazards: string[] = [];
  const recommendedEquipment: string[] = ['Standard First Aid Kit', 'Trauma Dressing'];
  const missingInformation: string[] = ['Exact intersection or building number', 'Are patients breathing and conscious?'];

  if (
    text.includes('unconscious') ||
    text.includes('cardiac') ||
    text.includes('heart') ||
    text.includes('critical') ||
    text.includes('severe') ||
    text.includes('bleed') ||
    text.includes('head trauma') ||
    text.includes('trapped') ||
    text.includes('major accident') ||
    text.includes('multiple vehicle') ||
    text.includes('explosion')
  ) {
    priority = 'Critical';
    priorityRationale = 'Keywords indicate potential life threat, severe physical trauma, or entrapment requiring immediate ALS dispatch.';
    confidence = 0.94;
    hazards.push('Active traffic hazard', 'Patient airway compromise risk');
    recommendedEquipment.push('ALS Monitor / Defibrillator', 'C-Collar & Spinal Board', 'Oxygen Delivery System');
  } else if (
    text.includes('fire') ||
    text.includes('burn') ||
    text.includes('fracture') ||
    text.includes('smoke') ||
    text.includes('broken') ||
    text.includes('pain') ||
    text.includes('collision') ||
    text.includes('crash')
  ) {
    priority = 'High';
    priorityRationale = 'Report indicates urgent response required for acute injury or active environmental hazard.';
    confidence = 0.91;
    hazards.push('Smoke inhalation risk', 'Traffic disruption');
    recommendedEquipment.push('Burn Gel Dressing', 'Immobilization Splints', 'Thermal Blanket');
  } else if (text.includes('minor') || text.includes('scratch') || text.includes('bruise') || text.includes('water leak')) {
    priority = 'Low';
    priorityRationale = 'Minor non-acute event with no reported life threats or immediate bodily peril.';
    confidence = 0.85;
  }

  // Determine category
  let category = emergencyType || 'Medical Emergency';
  if (text.includes('accident') || text.includes('crash') || text.includes('car') || text.includes('bike') || text.includes('truck')) {
    category = 'Road Accident';
  } else if (text.includes('fire') || text.includes('smoke') || text.includes('flame')) {
    category = 'Fire';
  } else if (text.includes('theft') || text.includes('assault') || text.includes('intruder') || text.includes('security')) {
    category = 'Security';
  } else if (text.includes('flood') || text.includes('earthquake') || text.includes('storm')) {
    category = 'Natural Disaster';
  }

  let extractedCount = affectedCount || 1;
  const matchNum = text.match(/(\d+)\s*(people|persons|patients|victims|casualties|individuals)/);
  if (matchNum && matchNum[1]) {
    extractedCount = parseInt(matchNum[1], 10);
  }

  return res.json({
    source: 'simulated-rules',
    isSimulated: true,
    priority,
    confidence,
    category,
    summary: `${category} reported: ${description ? description.slice(0, 140) : 'Immediate assistance requested'}.`,
    extractedAffectedCount: extractedCount,
    extractedLocation: locationText || 'Location captured via client coordinates',
    hazards,
    recommendedEquipment,
    missingInformation,
    priorityRationale,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`RESQ-AI server running on http://localhost:${PORT}`);
  });
}

startServer();
