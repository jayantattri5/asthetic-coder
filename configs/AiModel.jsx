const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
});

const generationConfig = {
    temperature: 0.5,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 1000,
    responseMimeType: "text/plain",
};

const CodeGenerationConfig = {
    temperature: 0.5,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 8000,
    responseMimeType: "application/json",
};

    export const chatSession = model.startChat({
        generationConfig,
        history: [
        ],
    });

    export const GenAiCode = model.startChat({
        generationConfig: CodeGenerationConfig,
        history:[]
    })

    // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // console.log(result.response.text());