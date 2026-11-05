"use client";

import { useEffect, useRef, useState } from "react";

export default function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("Ready when you are");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Welcome to NOW4LATERWEB. I’m here to help you explore what we can build for your business. What would you like to know?" }
  ]);
  const [draft, setDraft] = useState("");
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const channelRef = useRef(null);
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function cleanup() {
    channelRef.current?.close();
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioRef.current) audioRef.current.srcObject = null;
    channelRef.current = null;
    pcRef.current = null;
    streamRef.current = null;
    setConnected(false);
    setBusy(false);
  }

  useEffect(() => () => {
    channelRef.current?.close();
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function addMessage(role, text) {
    if (!text?.trim()) return;
    setMessages((current) => {
      const last = current[current.length - 1];
      if (role === "assistant" && last?.role === "assistant" && last.live) {
        return [...current.slice(0, -1), { role, text: last.text + text, live: true }];
      }
      return [...current, { role, text, live: role === "assistant" }];
    });
  }

  async function connect() {
    if (busy || connected) return;
    setBusy(true);
    setStatus("Requesting microphone access…");
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
        throw new Error("Live voice requires a modern browser and a secure HTTPS connection.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.ontrack = (event) => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
          audioRef.current.play().catch(() => {});
        }
      };
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const channel = pc.createDataChannel("now4later-events");
      channelRef.current = channel;
      channel.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "response.output_audio_transcript.delta" || payload.type === "response.output_text.delta") {
            addMessage("assistant", payload.delta || "");
          } else if (payload.type === "conversation.item.input_audio_transcription.completed" && payload.transcript) {
            setMessages((current) => [...current, { role: "user", text: payload.transcript }]);
          } else if (payload.type === "response.done") {
            setMessages((current) => current.map((item, index) =>
              index === current.length - 1 && item.role === "assistant" ? { ...item, live: false } : item
            ));
          } else if (payload.type === "error") {
            setStatus(payload.error?.message || "There was a problem with the voice session.");
          }
        } catch {
          // Ignore non-JSON transport events.
        }
      });
      channel.addEventListener("open", () => {
        setConnected(true);
        setBusy(false);
        setStatus("Connected — go ahead, I’m listening.");
        channel.send(JSON.stringify({ type: "response.create" }));
      });
      channel.addEventListener("close", () => {
        setConnected(false);
        setStatus("Voice session ended.");
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const response = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.error || "We couldn't connect just now. Please try again.");
      }
      await pc.setRemoteDescription({ type: "answer", sdp: await response.text() });
    } catch (error) {
      cleanup();
      setStatus(error?.name === "NotAllowedError"
        ? "Microphone access was blocked. Allow microphone access in your browser settings and try again."
        : error?.message || "Unable to connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function disconnect() {
    cleanup();
    setStatus("Voice session ended. You can reconnect anytime.");
  }

  function sendText(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || channelRef.current?.readyState !== "open") return;
    setMessages((current) => [...current, { role: "user", text }]);
    channelRef.current.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }]
      }
    }));
    channelRef.current.send(JSON.stringify({ type: "response.create" }));
    setDraft("");
  }

  return (
    <div className="n4l-assistant">
      {open && (
        <section className="n4l-assistant-panel" aria-label="NOW4LATERWEB AI assistant">
          <div className="n4l-assistant-header">
            <div className="n4l-assistant-avatar" aria-hidden="true">N</div>
            <div className="n4l-assistant-heading">
              <strong>NOW4LATERWEB Assistant</strong>
              <span><i className={connected ? "is-live" : ""} />{connected ? "Live and listening" : "Your website concierge"}</span>
            </div>
            <button className="n4l-assistant-close" onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
          </div>

          <div className="n4l-assistant-messages" aria-live="polite">
            <div className="n4l-assistant-note">Ask about websites, services, pricing, or getting your project started.</div>
            {messages.map((message, index) => (
              <div className={`n4l-chat-message ${message.role}`} key={index}>{message.text}</div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="n4l-assistant-controls">
            <p className="n4l-assistant-status">{status}</p>
            {!connected ? (
              <button className="n4l-voice-button" onClick={connect} disabled={busy}>
                <span aria-hidden="true">🎙</span> {busy ? "Connecting…" : "Start live conversation"}
              </button>
            ) : (
              <button className="n4l-voice-button end" onClick={disconnect}>End voice conversation</button>
            )}
            <form className="n4l-assistant-text-form" onSubmit={sendText}>
              <input
                aria-label="Type a message"
                placeholder={connected ? "Type a message…" : "Start voice to chat by text"}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={!connected}
              />
              <button type="submit" disabled={!connected || !draft.trim()} aria-label="Send message">↑</button>
            </form>
            <small>Voice is optional. Your browser will ask for microphone permission.</small>
          </div>
          <audio ref={audioRef} autoPlay />
        </section>
      )}

      <button className={`n4l-assistant-launcher ${open ? "active" : ""}`} onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span aria-hidden="true">{open ? "×" : "✦"}</span>
        {open ? "Close" : "Talk to us"}
      </button>
    </div>
  );
}
