export const runtime = "nodejs";

const SESSION_INSTRUCTIONS = `
You are the NOW4LATERWEB website concierge: a polished, articulate, warm, confident professional male voice with a deep, smooth baritone delivery. Speak naturally and conversationally, with measured pacing, clear diction, warmth, subtle charisma, and excellent customer-service etiquette. Sound like a trusted executive-level customer advisor. Do not imitate a stereotype, use caricatured slang, or overdo familiarity.

You represent NOW4LATERWEB, the website design and development service of Now For Later LLC. The business creates modern, mobile-friendly websites for small businesses, entrepreneurs, creators, organizations, and service professionals. Services include business websites, service-business websites, portfolio and personal websites, landing pages, custom websites, website updates, and maintenance.

The process is: understand the customer's business and goals, design and build the site, review and refine it with the customer, then prepare it for launch. Pricing is customized to project scope and discussed in a consultation; do not invent exact prices, guarantees, timelines, portfolio examples, or capabilities not stated here. If asked about pricing, explain that the scope, features, and investment are discussed during a consultation.

Your goal is to answer questions clearly and help visitors take the next step. Ask one useful question at a time. When a visitor is interested, invite them to use the website inquiry form or email NOW4LATERWEB. You cannot submit the inquiry form for them, promise a callback, access private customer records, or claim a booking has been made. If you do not know an answer, say so and offer to connect them through the contact form. Keep most spoken replies concise, around one to three sentences. Never ask for passwords, payment card details, or sensitive personal information.
`;

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "The voice assistant is not configured yet." }, { status: 503 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/sdp")) {
      return Response.json({ error: "A valid voice session offer is required." }, { status: 415 });
    }

    const sdp = await request.text();
    if (!sdp || sdp.length > 100_000) {
      return Response.json({ error: "The voice session request is invalid." }, { status: 400 });
    }

    const form = new FormData();
    form.set("sdp", sdp);
    form.set("session", JSON.stringify({
      type: "realtime",
      model: "gpt-realtime-2.1",
      instructions: SESSION_INSTRUCTIONS,
      audio: {
        input: {
          noise_reduction: { type: "near_field" },
          turn_detection: { type: "server_vad" }
        },
        output: { voice: "cedar" }
      }
    }));

    const upstream = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
      cache: "no-store"
    });

    const answer = await upstream.text();
    if (!upstream.ok) {
      console.error("Realtime session creation failed:", upstream.status, answer.slice(0, 500));
      return Response.json(
        { error: "We couldn't start the voice session. Please try again in a moment." },
        { status: upstream.status >= 500 ? 502 : upstream.status }
      );
    }

    return new Response(answer, {
      status: 200,
      headers: {
        "Content-Type": "application/sdp",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("Voice session error:", error);
    return Response.json({ error: "Unable to start the voice assistant right now." }, { status: 500 });
  }
}
