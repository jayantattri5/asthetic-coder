import Lookup from "@/app/data/Lookup";
import { GenAiCode } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
    const {prompt} = await req.json();
    try{
        const result = await GenAiCode.sendMessage(prompt);
        const resp = result.response.text();
        
        try {
            // Attempt to parse the response
            const parsedResponse = JSON.parse(resp);
            return NextResponse.json(parsedResponse);
        } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            // Return a fallback response
            return NextResponse.json({
                error: "Failed to parse the AI-generated code response",
                files: Lookup.DEFAULT_FILE
            });
        }
    } catch(e) {
        return NextResponse.json({error: e.message});
    }
}