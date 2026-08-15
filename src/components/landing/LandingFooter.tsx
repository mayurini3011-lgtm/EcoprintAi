import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { Reveal } from "./shared";
import { ArrowRight, Instagram, Linkedin, Mail, Sparkles, Youtube } from "lucide-react";
import { Link } from "react-router";

type FooterLink = { label: string; to: string } | { label: string; href: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "AI Fabric Lab", to: "/#fabric-lab" },
      { label: "Design Studio", to: "/#design-studio" },
      { label: "Natural Dyes", to: "/natural-dyes" },
      { label: "Colours", to: "/colors" },
      { label: "Collections", to: "/collections" },
      { label: "Yarn Shop", to: "/shop" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/auth?returnTo=/assistant" },
      { label: "Contact", href: "mailto:hello@ecoprint.ai" },
      { label: "FAQs", to: "/#faq" },
      { label: "Privacy Policy", href: "#" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Designs", to: "/auth?returnTo=/designs" },
      { label: "Orders", to: "/orders" },
      { label: "Checkout", to: "/checkout" },
      { label: "Profile", to: "/auth?returnTo=/account" },
    ],
  },
];

export function LandingFooter() {
  return (
    <>
      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 lg:py-20">
            <div
              aria-hidden
              className="animate-gradient-pan absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, transparent 0%, currentColor 25%, transparent 50%, currentColor 75%, transparent 100%)",
              }}
            />
            <div aria-hidden className="animate-float-slow absolute -left-10 top-10 size-48 rounded-full bg-primary-foreground/10 blur-3xl" />
            <div aria-hidden className="animate-float absolute -right-10 bottom-6 size-56 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/70 uppercase">
                <Sparkles className="mr-1.5 inline size-3.5" /> EcoPrint AI
              </p>
              <h2 className="font-display mx-auto mt-4 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Build the Future of Sustainable Fashion
              </h2>
              <p className="font-display mt-4 text-lg italic text-primary-foreground/80">
                Analyze. Design. Optimize. Create.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="gap-2 rounded-full bg-background text-foreground shadow-xl hover:bg-background/90">
                  <Link to="/auth?returnTo=/dashboard">
                    Start with AI <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link to="/collections">Explore Collections</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer id="faq" className="border-t border-border/60 bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                AI-powered sustainable fashion technology. From plant to
                personalized fashion — designed by AI, protected by cybersecurity.
              </p>
              <div className="mt-5 flex gap-2">
                {[
                  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
                  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
                  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
                  { icon: Mail, label: "Email", href: "mailto:hello@ecoprint.ai" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    aria-label={s.label}
                    className="flex size-10 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                  >
                    <s.icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold tracking-wider text-foreground uppercase">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {"to" in l ? (
                        <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6">
            <p className="text-xs text-muted-foreground">© 2026 EcoPrint AI. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">
              Crafted with natural dyes & AI 🌿
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
