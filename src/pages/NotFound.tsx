import { motion } from "framer-motion";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-background"
    >
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard">Open the studio</Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
          <FileQuestion className="size-7" />
        </span>
        <p className="mt-6 font-mono text-[11px] tracking-widest text-primary uppercase">
          404 · route not found
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          This thread leads nowhere
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          The page you requested doesn't exist in this supply chain. Head back
          to the studio and start from a botanical instead.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Back to EcoPrint AI</Link>
        </Button>
      </div>
    </motion.div>
  );
}
