import { NextRequest, NextResponse } from "next/server";

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY!;
const TOGETHER_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";

export async function POST(req: NextRequest) {
  const { type, sample } = await req.json();

  const prompt = `
You are an AI rule recommender. Suggest useful filtering or cleaning rules for the "${type}" table based on the sample data.

Respond ONLY in the following **pure JSON** format (no comments or explanations):
[
  {
    "field": "PriorityLevel",
    "operator": "<",
    "value": "3"
  },
  ...
]

Sample data: ${JSON.stringify(sample, null, 2)}

Column names are:
Clients: ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag
Workers: WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel
Tasks: TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases
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
          { role: "system", content: "You return only pure JSON rules to help filter or clean datasets." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const result = await response.json();
    const message = result.choices?.[0]?.message?.content ?? "";

    console.log("🧠 Raw AI message:", message); // To check the response that my model is giving 

    let rules;
    try {
      // Trying to extract JSON from response even if it has extra text
      const jsonStart = message.indexOf("[");
      const jsonEnd = message.lastIndexOf("]");
      const jsonSlice = message.slice(jsonStart, jsonEnd + 1);

      rules = JSON.parse(jsonSlice);
    } catch (e) {
      console.error("❌ JSON parsing failed:", e);
      return NextResponse.json({ error: "LLM returned invalid rules" }, { status: 500 });
    }

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Suggest Rules API Error:", error);
    return NextResponse.json({ error: "Failed to suggest rules" }, { status: 500 });
  }
}
