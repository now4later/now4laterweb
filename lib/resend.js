import { Resend } from "resend";

// Server-side only. RESEND_API_KEY is never sent to the browser.
export const resend = new Resend(process.env.RESEND_API_KEY);
