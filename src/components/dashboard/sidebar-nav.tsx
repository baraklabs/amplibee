"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { dashboardNavItems, campaignNavItems, settingsNavItems, type NavItem } from "./nav-items";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const renderItem = (item: NavItem) => {
    const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <item.icon className="size-4 shrink-0" />
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-0.5">
      {dashboardNavItems.map(renderItem)}
      <p className="text-eyebrow mt-5 mb-1 px-3">Influencer campaigns</p>
      {campaignNavItems.map(renderItem)}
      <div className="mt-5 flex flex-col gap-0.5 border-t border-border pt-3">{settingsNavItems.map(renderItem)}</div>
    </nav>
  );
}
