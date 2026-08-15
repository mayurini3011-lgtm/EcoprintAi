import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { readDemoAnalysis } from "@/lib/demo-analysis";
import { useAction, useQuery } from "convex/react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  demo?: boolean;
}

const SUGGESTIONS = [
  "Which natural dye is best for cotton?",
  "How can I improve color retention?",
  "What mordant should I use?",
  "Why did my color fade after washing?",
  "Which fabric works best with turmeric?",
  "Explain my analysis result",
];

export function ChatPanel({ className }: { className?: string }) {
  const chat = useAction(api.chat.chat);
  const analyses = useQuery(api.analysis.listAnalyses);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm the EcoPrint AI Assistant 🌿 Ask me about natural dyes, fabric care, colour retention, mordants, washing cycles — or ask me to explain your latest fabric analysis.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Context-awareness: the most recent analysis powers the assistant.
  // Signed-in users get their latest saved report; signed-out visitors get
  // the analysis just run on the landing page's Fabric Lab (localStorage).
  const saved = analyses && analyses.length > 0 ? analyses[0] : undefined;
  const latest = saved ?? readDemoAnalysis();
  const analysisContext = latest
    ? {
        fabric: latest.fabric,
        dye: latest.dye,
        pattern: latest.pattern,
        washes: latest.washes,
        retention: latest.retention,
        retentionCategory: latest.retentionCategory,
        colorDifference: latest.colorDifference,
        mordant: latest.mordant,
        sustainabilityScore: latest.sustainabilityScore,
      }
    : undefined;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, sending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    setSending(true);
    try {
      const result = await chat({ message: trimmed, analysisContext });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: result.reply, demo: result.mode === "demo" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I couldn't reach the assistant backend just now. If the backend is unavailable, EcoPrint AI falls back to Demo Mode — try again in a moment.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">EcoPrint AI Assistant</p>
            <p className="text-[10px] text-muted-foreground">
              {latest
                ? `Context: ${latest.dye} on ${latest.fabric} · ${latest.retention}% retention`
                : "Ask anything about natural textiles"}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-600" />
          </span>
          Online
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex items-start gap-2.5", m.role === "user" && "flex-row-reverse")}
          >
            <span
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                m.role === "user" ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground",
              )}
            >
              {m.role === "user" ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
            </span>
            <div
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-6",
                m.role === "user"
                  ? "rounded-tr-sm bg-primary text-primary-foreground"
                  : "rounded-tl-sm bg-muted/70 text-foreground",
              )}
            >
              {m.content}
              {m.demo && (
                <span className="mt-1.5 block text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                  Demo engine reply
                </span>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="size-3.5" />
            </span>
            <span className="rounded-2xl rounded-tl-sm bg-muted/70 px-3.5 py-2.5 text-[13px] text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
            </span>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              className="rounded-full border border-border/80 bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="Ask about dyes, mordants, retention…"
            rows={1}
            className="min-h-9 max-h-28 resize-none text-[13px]"
          />
          <Button size="icon" onClick={() => void send(input)} disabled={sending || !input.trim()} aria-label="Send message">
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Answers are recommendations, not lab-certified results. Demo replies are clearly labelled.
        </p>
      </div>
    </div>
  );
}
