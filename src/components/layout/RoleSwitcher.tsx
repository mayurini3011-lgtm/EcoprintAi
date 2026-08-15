import { api } from "@/convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { toast } from "sonner";

const ROLES = [
  { value: "customer", label: "Customer" },
  { value: "farmer", label: "Farmer" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "tailor", label: "Tailor" },
  { value: "admin", label: "Admin" },
] as const;

/**
 * Hackathon demo switcher: lets the presenter jump between every portal role
 * instantly. Mutations still enforce requireRole() server-side, so this is a
 * legit RBAC path — the account's role is genuinely changed in Convex.
 */
export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const setDemoRole = useMutation(api.roles.setDemoRole);

  const role = (user?.role ?? "customer") as string;

  const handleChange = (value: string) => {
    void setDemoRole({ role: value as (typeof ROLES)[number]["value"] });
    const label = ROLES.find((r) => r.value === value)?.label ?? value;
    toast.success(`Demo role switched to ${label}`);
  };

  return (
    <Select value={role} onValueChange={handleChange}>
      <SelectTrigger
        className={compact ? "h-8 w-full text-xs" : "h-9 w-full text-xs"}
        aria-label="Demo role"
      >
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
