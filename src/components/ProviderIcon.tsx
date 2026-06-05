import Image from "next/image";
import { getProviderIcon } from "@/lib/provider-icons";
import { cn } from "@/lib/utils";

interface ProviderIconProps {
  provider: string;
  size?: number;
  className?: string;
  /** Invert to white on dark backgrounds (e.g. marketing sections). */
  inverted?: boolean;
}

export function ProviderIcon({
  provider,
  size = 16,
  className,
  inverted = false,
}: ProviderIconProps) {
  const src = getProviderIcon(provider);
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={provider}
      width={size}
      height={size}
      className={cn(inverted ? "invert" : "dark:invert", className)}
    />
  );
}
