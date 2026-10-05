import {
  LayoutDashboard,
  PenSquare,
  Workflow,
  FileStack,
  Users,
  Bot,
  BarChart3,
  Settings,
  Megaphone,
  ClipboardCheck,
  Network,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Cross-platform posting is the primary product. */
export const dashboardNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Create", href: "/dashboard/create", icon: PenSquare },
  { label: "Workflows", href: "/dashboard/workflows", icon: Workflow },
  { label: "Posts", href: "/dashboard/posts", icon: FileStack },
  { label: "Accounts", href: "/dashboard/accounts", icon: Users },
  { label: "AI", href: "/dashboard/ai", icon: Bot },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

/** Influencer campaigns are the secondary product, shown below the posting tools. */
export const campaignNavItems: NavItem[] = [
  { label: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
  { label: "Deliverables", href: "/dashboard/deliverables", icon: ClipboardCheck },
  { label: "Influencer Profile", href: "/dashboard/channels", icon: Network },
];

export const settingsNavItems: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
