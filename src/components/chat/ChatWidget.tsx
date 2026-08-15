import { ChatPanel } from "./ChatPanel";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Floating "EcoPrint AI Assistant" launcher — bottom-right, above the shell. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);

  // Allow any button (e.g. the landing header's "AI Assistant") to open chat.
  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("ecoprint:open-chat", openChat);
    return () => window.removeEventListener("ecoprint:open-chat", openChat);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-[min(92vw,380px)]"
          >
            <ChatPanel className="h-[min(70vh,540px)] shadow-2xl shadow-black/10" />
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className={cn(
          "flex size-14 items-center justify-center rounded-full text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95",
          "bg-gradient-to-br from-primary to-primary/85",
        )}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
      {!open && (
        <span className="pointer-events-none flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-medium text-foreground shadow-lg ring-1 ring-border">
          <Sparkles className="size-3 text-primary" /> Ask EcoPrint AI
        </span>
      )}
    </div>
  );
}
