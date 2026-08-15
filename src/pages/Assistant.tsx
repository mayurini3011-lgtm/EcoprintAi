import { ChatPanel } from "@/components/chat/ChatPanel";
import { Bot, Sparkles } from "lucide-react";
import { Link } from "react-router";

export default function Assistant() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          EcoPrint AI · Assistant
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Ask EcoPrint AI Assistant
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Natural dyes, fabric care, mordants, colour retention and sustainable
          textile practices — with context from your latest analysis.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Sparkles, title: "Context-aware", text: "Explains your latest fabric analysis result." },
          { icon: Bot, title: "Honest answers", text: "Recommendations are clearly labelled, never lab-certified claims." },
          { icon: Sparkles, title: "Demo-friendly", text: "Works fully offline with the built-in demo engine." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border/70 bg-card p-3.5">
            <f.icon className="size-4 text-primary" />
            <p className="mt-1.5 text-xs font-semibold">{f.title}</p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>

      <ChatPanel className="h-[62vh] min-h-[420px]" />

      <p className="text-center text-[11px] text-muted-foreground">
        Tip: run a <Link to="/analyze" className="font-medium text-primary hover:underline">fabric analysis</Link>{" "}
        first, then ask "explain my analysis result".
      </p>
    </div>
  );
}
