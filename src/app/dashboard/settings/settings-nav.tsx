"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { label: "Profile", href: "/dashboard/settings/profile" },
  { label: "Content preferences", href: "/dashboard/settings/content-preferences" },
  { label: "AI providers", href: "/dashboard/ai" },
  { label: "Connected accounts", href: "/dashboard/settings/connected-accounts" },
  { label: "Notifications", href: "/dashboard/settings/notifications" },
  { label: "Billing", href: "/dashboard/settings/billing" },
  { label: "Security", href: "/dashboard/settings/security" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto md:w-52 md:flex-col md:overflow-visible">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
