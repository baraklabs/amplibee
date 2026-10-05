import {
  LayoutDashboard,
  PenSquare,
  FileStack,
  Users,
  Bot,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const dashboardNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Create", href: "/dashboard/create", icon: PenSquare },
  { label: "Posts", href: "/dashboard/posts", icon: FileStack },
  { label: "Accounts", href: "/dashboard/accounts", icon: Users },
  { label: "AI", href: "/dashboard/ai", icon: Bot },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
