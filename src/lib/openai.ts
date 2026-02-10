import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

/** @deprecated Use getOpenAIClient() for lazy initialization */
export const openai = undefined as unknown as OpenAI;
