"use client";

import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

function getSessionId() {
  if (typeof window === "undefined") return makeId();
  const k = "vf_session";
  const v = sessionStorage.getItem(k);
  if (v) return v;
  const id = makeId();
  sessionStorage.setItem(k, id);
  return id;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const sessionId = getSessionId();

    setMessages((p) => [
      ...p,
      { id: makeId(), role: "user", content, timestamp: new Date().toISOString() },
    ]);
    setIsLoading(true);

    const aiId = makeId();
    setMessages((p) => [
      ...p,
      { id: aiId, role: "assistant", content: "", timestamp: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: content }),
      });

      if (!res.ok || !res.body) throw new Error("failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const p = JSON.parse(line.slice(6));
            if (p.type === "text") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId ? { ...m, content: m.content + p.content } : m
                )
              );
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages((p) =>
        p.map((m) =>
          m.id === aiId
            ? { ...m, content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendWithContext = useCallback(
    (contextText: string) => sendMessage(contextText),
    [sendMessage]
  );

  return { messages, sendMessage, sendWithContext, isLoading };
}
