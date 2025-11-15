import { GoogleGenAI, Chat, Content } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';

export const createNexusChat = (history?: Content[]): Chat | null => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
      console.error('Missing VITE_GEMINI_API_KEY – set it in your env vars.');
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });
    return ai.chats.create({
      model: 'gemini-2.5-pro',
      history,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    return null;
  }
};
