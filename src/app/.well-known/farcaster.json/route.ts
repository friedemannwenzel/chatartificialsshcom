function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "ArtificialSSH Chat",
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Modern AI chat application featuring multiple providers, beautiful UI, and comprehensive rate limiting",
      screenshotUrls: [],
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON || `${baseUrl}/icon.png`,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${baseUrl}/splash.svg`,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#151515",
      homeUrl: baseUrl,
      webhookUrl: `${baseUrl}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || "productivity",
      tags: [],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${baseUrl}/hero.svg`,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Ultimate AI chat experience",
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || "ArtificialSSH Chat - Mini App",
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION || "Chat with AI in Base App",
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE || `${baseUrl}/og.svg`,
    }),
  });
} 