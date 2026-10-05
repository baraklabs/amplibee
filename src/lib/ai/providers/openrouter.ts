import type { AIProvider, CompletionRequest } from "../types";

const API_BASE = "https://openrouter.ai/api/v1";

export const openrouterProvider: AIProvider = {
  definition: {
    id: "openrouter",
    name: "OpenRouter",
    docsUrl: "https://openrouter.ai/docs",
    defaultModel: "openai/gpt-4o-mini",
    models: [
      "openai/gpt-4o-mini",
      "anthropic/claude-sonnet-5",
      "meta-llama/llama-3.1-70b-instruct",
      "google/gemini-2.5-flash",
    ],
    apiKeyPlaceholder: "sk-or-...",
  },

  async testConnection(apiKey, model) {
    try {
      const response = await fetch(`${API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://oyekool.com",
          "X-Title": "Oyekool",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Reply with the single word: ok" }],
          max_tokens: 5,
        }),
      });
      if (!response.ok) {
        const body = await response.text();
        return {
          ok: false,
          error: `OpenRouter responded ${response.status}: ${body.slice(0, 200)}`,
        };
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  async complete({ apiKey, model, system, prompt, maxTokens = 1200 }: CompletionRequest) {
    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://oyekool.com",
        "X-Title": "Oyekool",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenRouter error (${response.status}): ${body.slice(0, 300)}`);
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    return { text: data.choices[0]?.message.content ?? "" };
  },
};
