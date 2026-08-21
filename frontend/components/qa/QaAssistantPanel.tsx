"use client";

import { Bot, Send, Sparkles, TriangleAlert, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const suggestions = [
  "How do I register as a vendor?",
  "What documents are required to submit a bid?",
  "How do I find tenders closing this week?",
];

export default function QaAssistantPanel() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello, I'm the TenderEase AI Assistant! Ask me any general questions about the platform.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (value = input) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    // Add user message
    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await res.json();
      
      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.answer || "I received an empty response." },
      ]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((current) => [
        ...current,
        { role: "assistant", text: "Sorry, I couldn't connect to my AI server right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="lg:sticky lg:top-32 h-fit flex flex-col">
      <CardHeader className="border-b border-border flex flex-row items-center gap-3">
        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <CardTitle>TenderEase Assistant</CardTitle>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI Powered</p>
        </div>
      </CardHeader>

      <CardContent className="pt-5 flex flex-col gap-4">
        <div 
          ref={scrollRef}
          className="h-[320px] overflow-y-auto no-scrollbar flex flex-col gap-3 pr-1"
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-md px-4 py-3 text-sm max-w-[90%] ${
                message.role === "assistant"
                  ? "bg-muted text-foreground self-start rounded-tl-sm"
                  : "bg-primary text-primary-foreground self-end rounded-tr-sm"
              }`}
            >
              {message.text}
            </div>
          ))}
          {loading && (
            <div className="bg-muted text-foreground self-start rounded-tl-sm rounded-md px-4 py-3 text-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              Thinking...
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4 space-y-3 shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles size={14} className="text-primary" />
            Try Asking
          </div>
          <div className="flex flex-col gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={loading}
                onClick={() => sendMessage(suggestion)}
                className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-left text-sm text-foreground transition-all hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2 shrink-0 pt-2"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading}
            placeholder="Type your question..."
            className="min-w-0 flex-1 rounded-md border border-border bg-card px-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-9 w-9 shrink-0 rounded-md bg-primary text-primary-foreground flex items-center justify-center transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </form>

        <div className="flex items-start gap-2 rounded-md bg-warning/10 px-3 py-2 text-xs font-medium text-warning-foreground shrink-0 border border-warning/20">
          <TriangleAlert size={14} className="mt-0.5 shrink-0 text-warning" />
          AI responses are for platform guidance only.
        </div>
      </CardContent>
    </Card>
  );
}
