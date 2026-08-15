import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAuth } from "@/hooks/use-auth";
import { useEnsureDemoData } from "@/hooks/use-demo-data";
import {
  Bot,
  BookMarked,
  CreditCard,
  Factory,
  FileText,
  FlaskConical,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Palette,
  Scissors,
  ShieldCheck,
  Sparkles,
  Sprout,
  User,
  Droplets,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/analyze", label: "Fabric Analysis", icon: FlaskConical },
      { to: "/design-studio", label: "AI Design Studio", icon: Palette },
      { to: "/assistant", label: "AI Assistant", icon: Bot },
      { to: "/dye-library", label: "Dye Library", icon: Droplets },
    ],
  },
  {
    label: "Your data",
    items: [
      { to: "/history", label: "Analysis History", icon: History },
      { to: "/designs", label: "Saved Designs", icon: BookMarked },
      { to: "/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "Plan",
    items: [
      { to: "/pricing", label: "Pricing", icon: CreditCard },
      { to: "/account", label: "Account", icon: User },
    ],
  },
  {
    label: "Supply chain",
    items: [
      { to: "/studio", label: "EcoPrint Studio", icon: Sparkles },
      { to: "/dyes", label: "Dye Catalogue", icon: Droplets },
      { to: "/tailors", label: "Tailor Network", icon: Scissors },
      { to: "/orders", label: "My Orders", icon: Package },
      { to: "/farmer", label: "Farmer Portal", icon: Sprout },
      { to: "/manufacturer", label: "Manufacturer", icon: Factory },
      { to: "/security", label: "Security Center", icon: ShieldCheck },
      { to: "/admin", label: "Admin Console", icon: LayoutDashboard },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function NavItems({ onNavigate, navId }: { onNavigate?: () => void; navId?: string }) {
  const pillId = `${navId ?? "nav"}-pill`;
  return (
    <nav className="flex flex-col gap-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId={pillId}
                        className="absolute inset-0 -z-10 rounded-lg bg-primary/10 ring-1 ring-primary/15"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <item.icon className="size-4" />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function AIStatusChip() {
  return (
    <div className="mb-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-2.5 py-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-amber-800">AI Status</span>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">
          <span className="size-1.5 rounded-full bg-amber-500" /> Demo Mode
        </span>
      </div>
      <p className="mt-0.5 text-[9px] leading-3.5 text-amber-700/80">
        Backend online · demo AI engine active. Add API keys to go live.
      </p>
    </div>
  );
}

function PageTitle() {
  const { pathname } = useLocation();
  const item = ALL_ITEMS.find((n) => pathname.startsWith(n.to));
  return item ? item.label : "Workspace";
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast("Signed out");
    navigate("/");
  };

  const initials = (user?.name ?? "Guest")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full"
          aria-label="Account menu"
        >
          <Avatar className="size-8">
            <AvatarImage src={user?.image ?? undefined} />
            <AvatarFallback className="text-[11px]">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.name ?? "Demo Guest"}</p>
          <p className="text-xs text-muted-foreground">
            {user?.email ?? "Anonymous demo session"}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/account")}
          className="cursor-pointer"
        >
          <User className="mr-2 size-4" /> Account
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/")}
          className="cursor-pointer"
        >
          Landing page
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  useEnsureDemoData();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/70 bg-background print:hidden lg:flex">
        <div className="flex h-14 items-center border-b border-border/60 px-4">
          <NavLink to="/" className="flex items-center">
            <Logo />
          </NavLink>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavItems navId="desktop" />
        </div>
        <div className="border-t border-border/60 p-3">
          <AIStatusChip />
          <p className="mb-1.5 px-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Demo role
          </p>
          <RoleSwitcher />
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/70 bg-background/90 px-3 backdrop-blur print:hidden lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-3">
            <div className="mb-4 flex items-center px-2 pt-1">
              <Logo />
            </div>
            <NavItems onNavigate={() => setSheetOpen(false)} navId="mobile" />
            <div className="mt-4 border-t pt-3">
              <AIStatusChip />
              <p className="mb-1.5 px-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Demo role
              </p>
              <RoleSwitcher />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center gap-2">
          <LogoMark className="size-6" />
          <span className="text-sm font-semibold">{PageTitle()}</span>
        </div>
        <UserMenu />
      </header>

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:max-w-none print:p-0">
          {children}
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
