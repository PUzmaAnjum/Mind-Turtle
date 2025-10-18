import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
let chat: Chat | null = null;

const getChatInstance = (): Chat => {
  if (!chat) {
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are MindTurtle AI, a friendly and helpful virtual tutor for an online learning platform. Your goal is to assist students and teachers with their questions about course content, learning strategies, and platform features. Keep your answers concise, encouraging, and easy to understand.',
      },
    });
  }
  return chat;
};

export const geminiService = {
  sendMessageToChatbot: async (message: string): Promise<string> => {
    if (!API_KEY) return "The AI assistant is currently unavailable. Please check the API key configuration.";
    try {
      const chatInstance = getChatInstance();
      const result: GenerateContentResponse = await chatInstance.sendMessage({ message });
      return result.text;
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      return "Sorry, I encountered an error. Please try again later.";
    }
  },

  generateCoursePrerequisites: async (courseTitle: string): Promise<any> => {
    if (!API_KEY) return "Prerequisite generation is currently unavailable. Please check the API key configuration.";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `For a course titled "${courseTitle}", generate a list of 5 prerequisite topics. For each topic, provide a brief one-sentence description and suggest a relevant YouTube search query to find introductory videos.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              prerequisites: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: {
                      type: Type.STRING,
                      description: "The name of the prerequisite topic.",
                    },
                    description: {
                      type: Type.STRING,
                      description: "A brief one-sentence description of the topic.",
                    },
                    youtubeSearchQuery: {
                      type: Type.STRING,
                      description: "A YouTube search query to find relevant videos.",
                    },
                  },
                },
              },
            },
          },
        },
      });
      
      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error generating prerequisites with Gemini:", error);
      return { error: "Could not generate prerequisites." };
    }
  },

  generateCourseDetails: async (courseTitle: string): Promise<any> => {
    if (!API_KEY) return { error: "Course detail generation is currently unavailable. Please check the API key configuration." };
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a detailed course description (around 100 words) and a suggested course duration (e.g., "8 weeks") for a course titled "${courseTitle}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
                description: "A detailed description for the course."
              },
              duration: {
                type: Type.STRING,
                description: "A suggested duration for the course, e.g., '8 weeks'."
              }
            },
          },
        },
      });
      
      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error generating course details with Gemini:", error);
      return { error: "Could not generate course details." };
    }
  },
};