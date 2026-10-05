import { ArrowRight } from "lucide-react";
import { PlatformIcon } from "@/components/platform/platform-icon";
import type { PlatformId } from "@/lib/platforms/types";
import { cn } from "@/lib/utils";

const labels: Record<PlatformId, string> = {
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
};

const chipColors: Record<PlatformId | "draft", { bg: string; fg: string }> = {
  x: { bg: "bg-block-violet-bg", fg: "text-block-violet-fg" },
  linkedin: { bg: "bg-block-sky-bg", fg: "text-block-sky-fg" },
  youtube: { bg: "bg-block-rose-bg", fg: "text-block-rose-fg" },
  instagram: { bg: "bg-block-amber-bg", fg: "text-block-amber-fg" },
  facebook: { bg: "bg-block-emerald-bg", fg: "text-block-emerald-fg" },
  draft: { bg: "bg-block-purple-bg", fg: "text-block-purple-fg" },
};

interface Route {
  draft: string;
  to: PlatformId[];
}

const routes: Route[] = [
  { draft: "Product update post", to: ["x", "linkedin", "facebook"] },
  { draft: "New video upload", to: ["youtube", "instagram", "x"] },
  { draft: "Weekly roundup", to: ["linkedin", "facebook", "x"] },
];

function DraftChip({ label }: { label: string }) {
  const color = chipColors.draft;
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-md text-[10px] font-bold",
          color.bg,
          color.fg,
        )}
      >
        D
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}

function PlatformChip({ platform }: { platform: PlatformId }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
      <PlatformIcon platform={platform} className="size-6" />
      <span className="text-sm font-medium text-foreground">{labels[platform]}</span>
    </div>
  );
}

export function WorkflowMap() {
  return (
    <div className="flex flex-col gap-3">
      {routes.map((route) => (
        <div
          key={route.draft}
          className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:gap-4"
        >
          <DraftChip label={route.draft} />
          <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
          <div className="flex flex-wrap items-center gap-2">
            {route.to.map((dest) => (
              <PlatformChip key={dest} platform={dest} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
