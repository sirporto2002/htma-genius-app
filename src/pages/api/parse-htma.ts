import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { file } = req.body;

    if (!file || typeof file !== "string") {
      return res.status(400).json({ error: "No valid file data received" });
    }

    console.log("📦 Received base64 length:", file.length);
    console.log("📦 First 50 chars:", file.substring(0, 50));

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: file,
        },
      },
      {
        text: 'Extract all mineral values from this HTMA report. Return ONLY valid JSON with format: { "minerals": { "calcium": number, "magnesium": number, "sodium": number, "potassium": number } }',
      },
    ]);

    const text = result.response.text();
    console.log("🤖 Gemini response:", text);

    // Clean up markdown if present
    const cleanJson = text.replace(/```json|```/g, "").trim();

    res.status(200).json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.error("Gemini Direct Error:", error);
    res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
}
