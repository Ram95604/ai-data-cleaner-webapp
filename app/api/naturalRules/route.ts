import { NextRequest, NextResponse } from "next/server";

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY!;
const TOGETHER_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";

export async function POST(req: NextRequest) {
  try {
    const { prompt, type } = await req.json();

    const fullPrompt = `
Convert the following instruction into filter rules for the "${type}" table.

Instruction: "${prompt}"

Respond ONLY in JSON array format. Each rule should include:
- field: string
- operator: one of "=", ">", "<", "includes", "contains"
- value: string
- optional weight: number

Example:
[
  { "field": "Duration", "operator": ">", "value": "5", "weight": 2 },
  { "field": "Category", "operator": "contains", "value": "ML", "weight": 1 }
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

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TOGETHER_MODEL,
        messages: [
          { role: "system", content: "You are a JSON rule parser. Only return JSON." },
          { role: "user", content: fullPrompt },
        ],
      }),
    });

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content ?? "[]";

    // Try parsing rules
    const rules = JSON.parse(message);
    return NextResponse.json({ rules });

  } catch (error) {
    console.error("Natural rule parse error:", error);
    return NextResponse.json({ error: "Failed to process input" }, { status: 500 });
  }
}
