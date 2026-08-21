import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("Missing GEMINI_API_KEY environment variable");
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured.",
          answer: "Our intelligent assistant is currently unavailable because the API key is not configured. Please add GEMINI_API_KEY to your frontend .env file.",
        },
        { status: 200 } // Return 200 so the frontend can gracefully show the fallback answer
      );
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const systemInstruction = `
You are the "TenderEase Assistant", an intelligent chatbot for the TenderEase.lk government procurement platform.
Your job is to answer questions about using the platform, submitting bids, registering as a vendor, tender timelines, and general platform functionality.
Keep your answers very concise, helpful, and polite. Do not use more than 3-4 short sentences.
If a user asks something unrelated to procurement, tenders, or this web application, politely guide them back to the topic.
Important rules:
- Registration is free but some tenders require a bidding fee.
- Bids must include standard bidding documents (SBD), Business Registration (BR), and Tax Clearance.
- Official answers to specific tenders are provided on the 'Clarifications' tab of the tender details page.
- Support email is support@tenderease.lk.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    return NextResponse.json({ answer: response.text });
  } catch (error) {
    console.error("Error in AI Chat API:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response", answer: "I'm having trouble connecting to my brain right now. Please try again later!" },
      { status: 500 }
    );
  }
}
