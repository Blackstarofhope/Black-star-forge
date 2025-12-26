import type { AIModel, ChatMessage, KnowledgeEntry } from "@shared/schema";

interface AIResponse {
  content: string;
  error?: string;
}

// Build context from knowledge base entries
function buildKnowledgeContext(entries: KnowledgeEntry[]): string {
  if (entries.length === 0) return "";
  
  const context = entries
    .map((entry) => `## ${entry.title}\nSource: ${entry.url}\n\n${entry.content.slice(0, 2000)}...`)
    .join("\n\n---\n\n");
  
  return `The following documentation has been loaded into context:\n\n${context}\n\n---\n\n`;
}

// OpenAI API call
async function callOpenAI(
  apiKey: string,
  messages: ChatMessage[],
  knowledgeContext: string
): Promise<AIResponse> {
  try {
    const systemMessage = {
      role: "system",
      content: `You are Nazahary, an AI coding assistant integrated into The Black Star Forge IDE. You help developers write code, debug issues, and understand documentation. Be concise, technical, and helpful. If the user says "Deploy", acknowledge the deployment command.\n\n${knowledgeContext}`,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [
          systemMessage,
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { content: "", error: error.error?.message || "OpenAI API error" };
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  } catch (error) {
    return { content: "", error: "Failed to connect to OpenAI" };
  }
}

// Anthropic API call
async function callAnthropic(
  apiKey: string,
  messages: ChatMessage[],
  knowledgeContext: string
): Promise<AIResponse> {
  try {
    const systemPrompt = `You are Nazahary, an AI coding assistant integrated into The Black Star Forge IDE. You help developers write code, debug issues, and understand documentation. Be concise, technical, and helpful. If the user says "Deploy", acknowledge the deployment command.\n\n${knowledgeContext}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 2000,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { content: "", error: error.error?.message || "Anthropic API error" };
    }

    const data = await response.json();
    return { content: data.content[0].text };
  } catch (error) {
    return { content: "", error: "Failed to connect to Anthropic" };
  }
}

// Google Gemini API call
async function callGemini(
  apiKey: string,
  messages: ChatMessage[],
  knowledgeContext: string
): Promise<AIResponse> {
  try {
    const systemPrompt = `You are Nazahary, an AI coding assistant integrated into The Black Star Forge IDE. You help developers write code, debug issues, and understand documentation. Be concise, technical, and helpful. If the user says "Deploy", acknowledge the deployment command.\n\n${knowledgeContext}`;

    // Build conversation history
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Prepend system context as user message
    contents.unshift({
      role: "user",
      parts: [{ text: systemPrompt }],
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { content: "", error: error.error?.message || "Gemini API error" };
    }

    const data = await response.json();
    return { content: data.candidates[0].content.parts[0].text };
  } catch (error) {
    return { content: "", error: "Failed to connect to Google AI" };
  }
}

// Main chat function
export async function sendChatMessage(
  model: AIModel,
  apiKeys: { openai?: string; anthropic?: string; google?: string },
  messages: ChatMessage[],
  knowledgeEntries: KnowledgeEntry[] = []
): Promise<AIResponse> {
  const knowledgeContext = buildKnowledgeContext(knowledgeEntries);

  switch (model) {
    case "gpt-4":
      if (!apiKeys.openai) {
        return { content: "", error: "OpenAI API key not configured" };
      }
      return callOpenAI(apiKeys.openai, messages, knowledgeContext);

    case "claude-3":
      if (!apiKeys.anthropic) {
        return { content: "", error: "Anthropic API key not configured" };
      }
      return callAnthropic(apiKeys.anthropic, messages, knowledgeContext);

    case "gemini-pro":
      if (!apiKeys.google) {
        return { content: "", error: "Google AI API key not configured" };
      }
      return callGemini(apiKeys.google, messages, knowledgeContext);

    default:
      return { content: "", error: "Unknown model" };
  }
}

// Fetch documentation via Jina AI
export async function scrapeDocumentation(url: string): Promise<{
  title: string;
  content: string;
  error?: string;
}> {
  try {
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    const response = await fetch(jinaUrl);

    if (!response.ok) {
      return { title: "", content: "", error: "Failed to fetch content" };
    }

    const markdown = await response.text();

    // Extract title from first heading
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : new URL(url).hostname;

    return { title, content: markdown };
  } catch (error) {
    return { title: "", content: "", error: "Failed to scrape documentation" };
  }
}
