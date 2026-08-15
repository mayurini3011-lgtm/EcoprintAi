import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAuth } from "@/hooks/use-auth";
import { useEnsureDemoData } from "@/hooks/use-demo-data";
import {
  Factory,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Scissors,
  ShieldCheck,
  Sparkles,
  Sprout,
  Droplets,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "EcoPrint Studio", icon: Sparkles },
  { to: "/dyes", label: "Dye Catalogue", icon: Droplets },
  { to: "/tailors", label: "Tailor Network", icon: Scissors },
  { to: "/orders", label: "My Orders", icon: Package },
  { to: "/farmer", label: "Farmer Portal", icon: Sprout },
  { to: "/manufacturer", label: "Manufacturer", icon: Factory },
  { to: "/security", label: "Security Center", icon: ShieldCheck },
  { to: "/admin", label: "Admin Console", icon: LayoutDashboard },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/8 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function PageTitle() {
  const { pathname } = useLocation();
  const item = NAV.find((n) => pathname.startsWith(n.to));
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border/70 bg-background lg:flex">
        <div className="flex h-14 items-center border-b border-border/60 px-4">
          <NavLink to="/" className="flex items-center">
            <Logo />
          </NavLink>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavItems />
        </div>
        <div className="border-t border-border/60 p-3">
          <p className="mb-1.5 px-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Demo role
          </p>
          <RoleSwitcher />
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/70 bg-background/90 px-3 backdrop-blur lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-3">
            <div className="mb-4 flex items-center px-2 pt-1">
              <Logo />
            </div>
            <NavItems onNavigate={() => setSheetOpen(false)} />
            <div className="mt-4 border-t pt-3">
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

      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
