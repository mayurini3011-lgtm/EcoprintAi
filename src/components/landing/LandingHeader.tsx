import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/Logo";
import { useCart } from "@/lib/cart";
import { DYE_KNOWLEDGE } from "@/convex/constants";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  /** Internal route (e.g. /shop) or landing anchor (e.g. /#fabric-lab). */
  to?: string;
  /** Same-page anchor only — used on the landing page itself. */
  href?: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", to: "/" },
  { label: "AI Fabric Lab", to: "/#fabric-lab" },
  { label: "Natural Dyes", to: "/natural-dyes" },
  { label: "Colours", to: "/colors" },
  { label: "Design Studio", to: "/#design-studio" },
  { label: "Collections", to: "/collections" },
  { label: "Yarn Shop", to: "/shop" },
  { label: "How It Works", to: "/#how-it-works" },
];

export function LandingHeader() {
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const dyeMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return Object.entries(DYE_KNOWLEDGE)
      .filter(
        ([name, k]) =>
          name.toLowerCase().includes(q) ||
          k.source.toLowerCase().includes(q) ||
          k.suitableFabrics.some((f) => f.toLowerCase().includes(q)),
      )
      .slice(0, 6);
  }, [query]);

  const openChat = () => window.dispatchEvent(new Event("ecoprint:open-chat"));

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Center nav */}
        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) =>
            l.href ? (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.to}
                to={l.to ?? "/"}
                className="rounded-full px-3 py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9 rounded-full" aria-label="Search">
                <Search className="size-[18px]" />
              </Button>
            </DialogTrigger>
            <DialogContent className="top-24 max-w-lg translate-y-0">
              <DialogHeader>
                <DialogTitle className="text-base">Search the palette</DialogTitle>
                <DialogDescription className="text-xs">
                  Find a natural dye, botanical source or suitable fabric.
                </DialogDescription>
              </DialogHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try “indigo”, “cotton”, “Rubia cordifolia”…"
                  className="pl-9"
                />
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {query.trim() === "" ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(DYE_KNOWLEDGE)
                      .slice(0, 8)
                      .map(([name, k]) => (
                        <SearchResult
                          key={name}
                          href="/auth?returnTo=/dye-library"
                          onClick={() => setSearchOpen(false)}
                          swatch={k.hex}
                          title={name}
                          sub={k.source}
                        />
                      ))}
                  </div>
                ) : dyeMatches.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No matches — explore the full library.
                  </p>
                ) : (
                  dyeMatches.map(([name, k]) => (
                    <SearchResult
                      key={name}
                      href="/auth?returnTo=/dye-library"
                      onClick={() => setSearchOpen(false)}
                      swatch={k.hex}
                      title={name}
                      sub={`${k.source} · ${k.suitableFabrics.slice(0, 3).join(" / ")}`}
                    />
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="sm"
            onClick={openChat}
            className="hidden gap-1.5 rounded-full text-[13px] font-medium sm:inline-flex"
          >
            <Bot className="size-4 text-primary" /> AI Assistant
          </Button>

          <Button asChild variant="ghost" size="icon" className="size-9 rounded-full" aria-label="Account">
            <Link to="/auth?returnTo=/dashboard">
              <User className="size-[18px]" />
            </Link>
          </Button>

          <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted/70">
            <ShoppingBag className="size-[18px]" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-background">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          <Button asChild size="sm" className="ml-1 hidden gap-1.5 rounded-full md:inline-flex">
            <Link to="/auth?returnTo=/design-studio">
              <Sparkles className="size-3.5" /> Try AI
            </Link>
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full lg:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur lg:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {NAV_LINKS.map((l) =>
                l.href ? (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                  >
                    {l.label}
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </a>
                ) : (
                  <Link
                    key={l.to}
                    to={l.to ?? "/"}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                  >
                    {l.label}
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                ),
              )}
              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" className="flex-1 gap-1.5 rounded-full">
                  <Link to="/auth?returnTo=/design-studio">
                    <Sparkles className="size-3.5" /> Try AI
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={openChat} className="flex-1 gap-1.5 rounded-full">
                  <Bot className="size-3.5 text-primary" /> AI Assistant
                </Button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function SearchResult({
  href,
  onClick,
  swatch,
  title,
  sub,
}: {
  href: string;
  onClick: () => void;
  swatch: string;
  title: string;
  sub: string;
}) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-border/60 bg-card p-2.5 transition-colors hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      <span className="size-7 shrink-0 rounded-full ring-1 ring-border" style={{ background: swatch }} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{title}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{sub}</span>
      </span>
    </Link>
  );
}
