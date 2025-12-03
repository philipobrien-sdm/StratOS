import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInputs, AnalysisResult, ActionPlan, ProjectVersion } from "../types";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is not defined");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "dummy" });

// Schema definitions for Structured Output
const scenarioSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['Best Reasonable Case', 'Probable Case', 'Reasonable Worst Case'] },
    narrative: { type: Type.STRING },
    probability: { type: Type.NUMBER, description: "Percentage 0-100" },
    impactLevel: { type: Type.NUMBER, description: "1-10 scale" },
    effortToAchieve: { type: Type.NUMBER, description: "1-10 scale" },
    fragilityMarkers: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["title", "type", "narrative", "probability", "fragilityMarkers"]
};

const mitigationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    riskId: { type: Type.STRING },
    action: { type: Type.STRING },
    effortCost: { type: Type.NUMBER },
    effectiveness: { type: Type.NUMBER },
    residualRisk: { type: Type.NUMBER }
  }
};

const expandedRiskSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    description: { type: Type.STRING },
    likelihood: { type: Type.NUMBER },
    impact: { type: Type.NUMBER },
    category: { type: Type.STRING },
    isAIGenerated: { type: Type.BOOLEAN },
    contagionEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
    mitigations: { type: Type.ARRAY, items: mitigationSchema }
  },
  required: ["id", "description", "likelihood", "impact", "isAIGenerated"]
};

const stakeholderStrategySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stakeholderId: { type: Type.STRING },
    predictedBehaviour: { type: Type.STRING },
    leveragePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
    communicationCadence: { type: Type.STRING }
  }
};

const decisionGateSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    purpose: { type: Type.STRING },
    entryCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
    exitCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
    failureConditions: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
};

const analysisResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scenarios: { type: Type.ARRAY, items: scenarioSchema },
    expandedRisks: { type: Type.ARRAY, items: expandedRiskSchema },
    stakeholderStrategies: { type: Type.ARRAY, items: stakeholderStrategySchema },
    decisionGates: { type: Type.ARRAY, items: decisionGateSchema },
    deltas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Explicit list of what changed compared to previous context or new analysis insights." },
    executiveSummary: { type: Type.STRING }
  },
  required: ["scenarios", "expandedRisks", "stakeholderStrategies", "decisionGates", "deltas"]
};

const actionPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    targetOutcome: { type: Type.STRING },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          order: { type: Type.NUMBER },
          action: { type: Type.STRING },
          owner: { type: Type.STRING }
        }
      }
    },
    cumulativeCost: { type: Type.NUMBER },
    residualProbabilityOfFailure: { type: Type.NUMBER },
    newRisks: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["steps", "cumulativeCost"]
};

// Extraction Schemas
const goalsExtractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    goals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['Primary', 'Secondary'] },
          successCriteria: { type: Type.STRING }
        },
        required: ["description", "type", "successCriteria"]
      }
    }
  }
};

const stakeholdersExtractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stakeholders: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          influence: { type: Type.STRING, enum: ['Low', 'High'] },
          interest: { type: Type.STRING, enum: ['Low', 'High'] },
          baseSupport: { type: Type.STRING, enum: ['Supporter', 'Neutral', 'Detractor'] }
        },
         required: ["name", "role", "influence", "baseSupport"]
      }
    }
  }
};

const deliverablesExtractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    deliverables: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          dueDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
          dependencies: { type: Type.STRING }
        },
        required: ["name", "dueDate", "dependencies"]
      }
    }
  }
};

const risksExtractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          likelihood: { type: Type.NUMBER, description: "0 to 1" },
          impact: { type: Type.NUMBER, description: "1 to 10" },
          category: { type: Type.STRING, enum: ['Operational', 'Financial', 'Strategic', 'Reputational'] }
        },
        required: ["description", "likelihood", "impact", "category"]
      }
    }
  }
};


export const generateAnalysis = async (
  inputs: UserInputs,
  previousVersion: ProjectVersion | null
): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("API Key missing");

  const prompt = `
    You are StratOS, an advanced strategic risk engine.
    Analyze the following Project State. 
    
    If a Previous State is provided, compare the new inputs against it to calculate Deltas (changes in likelihood, stakeholder sentiment, etc.).
    
    Task:
    1. Expand on known risks (identify gaps, contagion).
    2. Generate 3 specific scenarios (Best, Probable, Worst).
    3. Engineer mitigations for top risks.
    4. Define stakeholder strategies based on their attributes.
    5. Define Decision Gates.
    
    Organization/Context: ${inputs.organization}
    Current Inputs: ${JSON.stringify(inputs)}
    Previous Analysis (for reference/delta): ${previousVersion ? JSON.stringify(previousVersion.analysis) : "None (First run)"}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisResponseSchema,
        systemInstruction: "You are a rigid strategic planning engine. Output strict JSON only. Be critical, realistic, and highly specific about risks.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};

export const generateOutcomePlan = async (
  target: string,
  currentAnalysis: AnalysisResult,
  inputs: UserInputs
): Promise<ActionPlan> => {
  if (!apiKey) throw new Error("API Key missing");

  const prompt = `
    Based on the current project state, generate a concrete Action Plan to achieve the target outcome: "${target}".
    
    Context:
    Organization: ${inputs.organization}
    Risks: ${JSON.stringify(currentAnalysis.expandedRisks.slice(0, 5))}
    Scenarios: ${JSON.stringify(currentAnalysis.scenarios)}
    Goals: ${JSON.stringify(inputs.goals)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: actionPlanSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    return JSON.parse(text) as ActionPlan;
  } catch (error) {
    console.error("Action planning failed", error);
    throw error;
  }
};

export const parseInputText = async (category: string, text: string): Promise<any> => {
  if (!apiKey) throw new Error("API Key missing");

  let schema: Schema;
  let promptCategory: string;

  switch (category) {
    case 'Goals':
      schema = goalsExtractionSchema;
      promptCategory = "Goals";
      break;
    case 'Stakeholders':
      schema = stakeholdersExtractionSchema;
      promptCategory = "Stakeholders";
      break;
    case 'Deliverables':
      schema = deliverablesExtractionSchema;
      promptCategory = "Deliverables";
      break;
    case 'Risks':
      schema = risksExtractionSchema;
      promptCategory = "Known Risks";
      break;
    default:
      throw new Error("Invalid category");
  }

  const prompt = `
    Extract structured data from the following text for the category: ${promptCategory}.
    Text: "${text}"
    
    Current Date: ${new Date().toISOString().split('T')[0]} (Use this to calculate relative dates like 'next friday').
    
    Return a valid JSON object matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    const output = response.text;
    if (!output) throw new Error("Empty response");
    
    return JSON.parse(output);
  } catch (error) {
    console.error("Extraction failed", error);
    throw error;
  }
};
