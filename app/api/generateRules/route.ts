import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages: [
          {
            role: "system",
            content:
              "You are a rule-creation assistant for data filtering. You return structured rule arrays based on user query.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data;

    return NextResponse.json({ result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
