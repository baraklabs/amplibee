import { ArrowRight } from "lucide-react";
import { PlatformIcon } from "@/components/platform/platform-icon";
import type { PlatformId } from "@/lib/platforms/types";
import { cn } from "@/lib/utils";

const labels: Record<PlatformId, string> = {
  x: "X",
  linkedin: "LinkedIn",
  medium: "Medium",
  substack: "Substack",
};

const chipColors: Record<PlatformId | "website", { bg: string; fg: string }> = {
  x: { bg: "bg-block-violet-bg", fg: "text-block-violet-fg" },
  linkedin: { bg: "bg-block-sky-bg", fg: "text-block-sky-fg" },
  medium: { bg: "bg-block-emerald-bg", fg: "text-block-emerald-fg" },
  substack: { bg: "bg-block-amber-bg", fg: "text-block-amber-fg" },
  website: { bg: "bg-block-purple-bg", fg: "text-block-purple-fg" },
};

interface Route {
  from: PlatformId | "website";
  to: PlatformId[];
}

const routes: Route[] = [
  { from: "x", to: ["linkedin", "medium", "substack"] },
  { from: "linkedin", to: ["x", "medium"] },
  { from: "website", to: ["x", "linkedin", "medium"] },
];

function Chip({ platform }: { platform: PlatformId | "website" }) {
  const color = chipColors[platform];

  if (platform === "website") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-md text-[10px] font-bold",
            color.bg,
            color.fg,
          )}
        >
          W
        </span>
        <span className="text-sm font-medium text-foreground">Website / Blog</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
      <span className={cn("flex size-6 items-center justify-center rounded-md", color.bg, color.fg)}>
        <PlatformIcon platform={platform} className="size-3.5" />
      </span>
      <span className="text-sm font-medium text-foreground">{labels[platform]}</span>
    </div>
  );
}

export function WorkflowMap() {
  return (
    <div className="flex flex-col gap-3">
      {routes.map((route) => (
        <div
          key={route.from}
          className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:gap-4"
        >
          <Chip platform={route.from} />
          <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
          <div className="flex flex-wrap items-center gap-2">
            {route.to.map((dest) => (
              <Chip key={dest} platform={dest} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
