import { NextRequest, NextResponse } from "next/server";

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY!;
const TOGETHER_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";

export async function POST(req: NextRequest) {
  const { prompt, type } = await req.json();

  const instruction = `
You are a data modifier for a table named "${type}". Convert the instruction below into a JSON modification structure.

Always interpret:
- "greater than" → ">"
- "less than" → "<"
- "equal to" or "equals" → "="
- Field names may be partial or fuzzy. Match closely to actual column names like "Qualification Level", "MaxLoadPerPhase", "Duration", etc.
If the field is a comma-separated list (like "Skills", "RequestedTaskIDs", or "RequiredSkills"), use the "includes" operator instead of "=".
Instruction: "${prompt}"

Respond in JSON format like:
[
  {
    "filter": {
      "field": "Qualification Level",
      "operator": ">",
      "value": "3"
    },
    "update": {
      "field": "MaxLoadPerPhase",
      "value": "5"
    }
  }
]
  Just for your information there are 3 tables we are dealing with Tasks, Clients and workers whost column names are like 
  Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string;
  GroupTag: string;
  AttributesJSON:string
}

Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string;
  AvailableSlots: string;
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel:number;
   
}

Task {
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: number;
  RequiredSkills: string;
  PreferredPhases: string;
  MaxConcurrent:number;
}
`;

  try {
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TOGETHER_MODEL,
        messages: [
          { role: "system", content: "You are a JSON-only assistant. Only return valid JSON arrays. Do not include any explanations or markdown formatting." },
          { role: "user", content: instruction },
        ],
      }),
    });

    const result = await response.json();
    const message = result.choices?.[0]?.message?.content ?? "";

    console.log("🧠 Raw LLM Response:", message);

    
    const match = message.match(/\[\s*{[\s\S]*}\s*]/);
    if (!match) {
      throw new Error("No valid JSON array found in LLM response");
    }

    const modifications = JSON.parse(match[0]);

    return NextResponse.json({ modifications });
  } catch (error) {
    console.error("❌ Modification API Error:", error);
    return NextResponse.json({ error: "Failed to parse modifications" }, { status: 500 });
  }
}
