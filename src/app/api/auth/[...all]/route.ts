import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth.handler);

export async function GET(req: Request) {
  try {
    return await handler.GET(req);
  } catch (e) {
    console.error("AUTH GET ERROR:", e);
    throw e;
  }
}

export async function POST(req: Request) {
  try {
    return await handler.POST(req);
  } catch (e) {
    console.error("AUTH POST ERROR:", e);
    throw e;
  }
}