export function getProviderIcon(provider: string): string | null {
  switch (provider) {
    case "openai":
      return "/OpenAI.svg";
    case "google":
      return "/Gemini.svg";
    case "anthropic":
      return "/Anthropic.svg";
    case "xai":
      return "/Grok_dark.svg";
    default:
      return null;
  }
}
