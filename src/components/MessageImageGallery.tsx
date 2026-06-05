"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { MessageImage } from "@/lib/messageImages";

interface MessageImageGalleryProps {
  images: MessageImage[];
  className?: string;
}

export const MessageImageGallery = memo(function MessageImageGallery({
  images,
  className,
}: MessageImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<MessageImage | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className={cn("mb-1.5 flex flex-wrap gap-1.5", className)}>
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            onClick={() => setSelectedImage(image)}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-panel transition-opacity hover:cursor-pointer hover:opacity-80"
            aria-label={`View ${image.alt}`}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent
          className="max-w-[min(92vw,1200px)] border-0 bg-transparent p-2 shadow-none sm:p-4"
          showCloseButton
        >
          <DialogTitle className="sr-only">
            {selectedImage?.alt ?? "Image preview"}
          </DialogTitle>
          {selectedImage && (
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt}
              width={1200}
              height={900}
              className="mx-auto max-h-[85vh] w-auto rounded-lg object-contain"
              unoptimized
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});
