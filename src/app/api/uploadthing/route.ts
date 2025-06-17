import { createRouteHandler } from "uploadthing/next";
import { messageAttachmentRouter } from "@/app/api/uploadthing/core";

export const { GET, POST } = createRouteHandler({
  router: messageAttachmentRouter,
}); 