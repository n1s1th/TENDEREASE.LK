"use client";

import { Bot, Send, Sparkles, TriangleAlert } from "lucide-react";
import { useState } from "react";

const suggestions = [
  "How do I register as a vendor?",
  "What documents are required to submit a bid?",
  "How do I find tenders closing this week?",
];

export default function QaAssistantPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello, I'm the TenderEase Assistant. How can I help you today?",
    },
  ]);

  const sendMessage = (value = input) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
      {
        role: "assistant",
        text: "This assistant gives general guidance only. Official answers are shown in the public Q&A list.",
      },
    ]);
    setInput("");
  };

  return (
    <aside className="lg:sticky lg:top-32 h-fit overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-premium">
      <div className="bg-secondary px-6 py-5 text-black-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center text-primary">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-base font-black">TenderEase Assistant</h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-black-2/70">General Guidance</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="max-h-[320px] overflow-y-auto no-scrollbar space-y-3 pr-1">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold leading-6 ${
                message.role === "assistant"
                  ? "bg-[#fff7e6] text-gray-1"
                  : "ml-8 bg-primary text-white"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-3">
            <Sparkles size={14} className="text-secondary" />
            Try Asking
          </div>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessage(suggestion)}
              className="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-left text-xs font-bold text-gray-2 transition-all hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your question..."
            className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-gray-5/30 px-4 py-3 text-sm font-semibold outline-none transition-all focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="h-11 w-11 shrink-0 rounded-xl bg-secondary text-primary flex items-center justify-center transition-all hover:shadow-secondary active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>

        <div className="flex items-start gap-2 rounded-xl bg-warning/10 px-4 py-3 text-[11px] font-bold leading-5 text-gray-2">
          <TriangleAlert size={14} className="mt-0.5 shrink-0 text-warning" />
          AI responses are for guidance only. Official answers are shown on the left.
        </div>
      </div>
    </aside>
  );
}
