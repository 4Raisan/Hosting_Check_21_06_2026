import { handlers } from "@/auth";

// Auth.js v5 exposes a `handlers` object with GET and POST. Re-export them
// as the Next.js route handlers for /api/auth/*.
export const { GET, POST } = handlers;
