import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Extract base64 data if it includes a data URI scheme
    const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    if (!apiKey) {
      // Fallback for demonstration when API key is missing
      console.warn("GEMINI_API_KEY is missing. Returning simulated response.");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 30% chance of detecting a simulated threat for demo purposes
      const isThreat = Math.random() > 0.7;
      
      return NextResponse.json({
        threatDetected: isThreat,
        severity: isThreat ? "CRITICAL" : "SAFE",
        analysis: isThreat 
          ? "Simulated: Anomalous metallic cylinder detected near rear exhaust assembly. Wires visible." 
          : "Simulated: Undercarriage topology verified clear. No foreign objects detected."
      });
    }

    // Actual Gemini Vision API integration
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "You are a tactical security AI. Analyze this vehicle undercarriage. Are there any foreign objects, pipe bombs, wires, or contraband? Respond in strictly valid JSON format: { \"threatDetected\": boolean, \"severity\": \"SAFE\" | \"WARNING\" | \"CRITICAL\", \"analysis\": \"short explanation\" }.";

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    // Sometimes Gemini wraps JSON in markdown blocks like ```json ... ```
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      const parsedJson = JSON.parse(cleanedText);
      return NextResponse.json(parsedJson);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", text);
      return NextResponse.json({
        threatDetected: false,
        severity: "WARNING",
        analysis: "Analysis completed but failed to parse structured data. Please manually review."
      });
    }

  } catch (error) {
    console.error("Analysis API Error:", error);
    return NextResponse.json(
      { error: "Internal server error during analysis" },
      { status: 500 }
    );
  }
}
