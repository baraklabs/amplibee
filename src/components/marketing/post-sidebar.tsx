import Link from "next/link";
import { Wand2, Users, Link2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const points = [
  { icon: Wand2, color: "#4f46e5", label: "Generate platform-native posts from one source" },
  { icon: Users, color: "#9333ea", label: "Connect multiple accounts per platform" },
  { icon: Link2, color: "#0284c7", label: "Auto-generate backlinks back to your launch" },
  { icon: Shield, color: "#059669", label: "Bring your own AI key — no token markup" },
];

/** CTA sidebar shown on /blog/[slug] — same pitch and layout everywhere, with an
 * optional deterministic YouTube video per post. */
export function PostSidebar({ videoId }: { videoId?: string }) {
  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
      <div className="rounded-lg border border-[#ddd8ff] bg-gradient-to-br from-accent-soft to-card p-7 shadow-sm">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Want your next launch to go further?
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          Oyekool turns one post into platform-native content, builds backlinks, and helps you
          reach more people through the network.
        </p>
        <ul className="mt-4 flex flex-col gap-2.5">
          {points.map((point) => (
            <li key={point.label} className="flex items-center gap-2.5 text-[13px] font-semibold text-foreground">
              <point.icon className="size-[18px] shrink-0" style={{ color: point.color }} />
              {point.label}
            </li>
          ))}
        </ul>
        <Button
          className="mt-5 h-auto w-full whitespace-nowrap rounded-xl bg-block-sky-fg px-4 py-4 text-sm font-bold text-white hover:bg-block-sky-fg/90"
          asChild
        >
          <Link href="/login?mode=signup">Yes, I want to boost my launch!</Link>
        </Button>
      </div>

      {videoId && (
        <div className="relative aspect-video overflow-hidden rounded-lg border border-border shadow-sm">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Oyekool video"
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </aside>
  );
}
