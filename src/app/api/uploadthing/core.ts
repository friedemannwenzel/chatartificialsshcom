import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const messageAttachmentRouter = {
  messageAttachment: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "32MB" },
    audio: { maxFileSize: "16MB" },
    text: { maxFileSize: "4MB" },
    application: { maxFileSize: "16MB" },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId } as { userId: string };
    })
    .onUploadComplete(async ({ file }: { file: { url: string } }): Promise<void> => {
      console.log("file uploaded", file.url);
    }),
} satisfies FileRouter;

export type MessageAttachmentRouter = typeof messageAttachmentRouter; 