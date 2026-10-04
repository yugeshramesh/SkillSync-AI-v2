import { GoogleGenAI } from "@google/genai";

let ai;
function getAiClient() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

export const aiChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const prompt = `
You are SkillSync AI Mentor.

Your job is to help college students.

You should answer questions about:
- Programming
- AI
- Machine Learning
- Web Development
- Career Guidance
- Study Plans
- Resume
- Interview Preparation

Keep answers practical, friendly and easy to understand.

Question:
${message}
`;

    const response = await getAiClient().models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      reply: response.text,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};