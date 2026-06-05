const IMAGE_MARKDOWN_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g;

export interface MessageImage {
  url: string;
  alt: string;
}

export function extractImagesFromContent(content: string): MessageImage[] {
  const images: MessageImage[] = [];
  const regex = new RegExp(IMAGE_MARKDOWN_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    images.push({ alt: match[1] || "Uploaded image", url: match[2] });
  }

  return images;
}

export function stripImagesFromContent(content: string): string {
  return content.replace(new RegExp(IMAGE_MARKDOWN_REGEX.source, "g"), "").trim();
}

export function isImageAttachment(attachment: { name: string; type?: string }): boolean {
  return (
    attachment.type?.startsWith("image/") ||
    (!attachment.type &&
      [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some((ext) =>
        attachment.name.toLowerCase().endsWith(ext)
      ))
  );
}

export function getMessageImages(
  content: string,
  attachments?: Array<{ url: string; name: string; type: string }>
): MessageImage[] {
  const images = extractImagesFromContent(content);
  const seenUrls = new Set(images.map((image) => image.url));

  if (attachments) {
    for (const attachment of attachments) {
      if (isImageAttachment(attachment) && !seenUrls.has(attachment.url)) {
        images.push({ url: attachment.url, alt: attachment.name });
        seenUrls.add(attachment.url);
      }
    }
  }

  return images;
}
