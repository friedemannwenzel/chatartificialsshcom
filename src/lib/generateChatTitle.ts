export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You generate concise titles (max 32 chars) for conversations based on the first user message. Return only the title without quotes.",
          },
          {
            role: "user",
            content: `Generate a short, descriptive title (max 32 chars) for a chat that starts with this message: "${firstMessage}"`,
          },
        ],
        model: "gemini-2.0-flash",
        skipRateLimit: true,
      }),
    });

    if (!response.body) return "";

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let title = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) title += parsed.content;
          } catch {
            /* ignore */
          }
        }
      }
    }

    title = title.replace(/^\s+|\s+$/g, "");
    title = title.replace(/^['"`]|['"`]$/g, "");
    return title.substring(0, 40);
  } catch {
    return "";
  }
} 