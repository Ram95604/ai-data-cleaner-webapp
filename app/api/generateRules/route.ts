import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;

  try {
    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", 
        messages: [
          { role: "system", content: "You are a rule-creation assistant for data filtering. You return structured rule arrays based on user query." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          "Authorization": `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.choices[0].message.content;
    res.status(200).json({ result });
  } catch (error: unknown) {
  if (error instanceof Error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(500).json({ error: "Unknown error occurred" });
  }
}
}
