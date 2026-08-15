import { LandingHeader } from "./LandingHeader";
import { LandingFooter } from "./LandingFooter";
import { ChatWidget } from "@/components/chat/ChatWidget";
import type { ReactNode } from "react";

/** Public store pages share the marketing header/footer + floating assistant. */
export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>{children}</main>
      <LandingFooter />
      <ChatWidget />
    </div>
  );
}
