import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PlatformId } from "@/lib/platforms/types";

interface PlatformIconProps {
  platform: PlatformId;
  className?: string;
  /** @deprecated icons now always render as full-color app icons — kept so existing call sites don't need to change. */
  colored?: boolean;
}

/**
 * Renders each channel as a self-contained "app icon" — a rounded-square
 * badge with the platform's real background (or gradient) and a white
 * glyph, the way these apps actually look on a phone home screen. No
 * wrapper background needed at call sites.
 */
export function PlatformIcon({ platform, className }: PlatformIconProps) {
  const gradientId = useId();

  const badges: Record<PlatformId, ReactNode> = {
    x: (
      <>
        <rect width="24" height="24" rx="6" fill="#000000" />
        <path
          d="M7 6.5h2.9l3.1 4.15 3.6-4.15h1.9l-4.55 5.24L18.9 17.5H16l-3.35-4.5-3.9 4.5H6.85l4.9-5.66Zm1.35 1 6.9 9h1.4l-6.9-9Z"
          fill="#ffffff"
        />
      </>
    ),
    linkedin: (
      <>
        <rect width="24" height="24" rx="6" fill="#0A66C2" />
        <path
          d="M8.14 6.5a1.64 1.64 0 1 1 0-3.28 1.64 1.64 0 0 1 0 3.28ZM6.5 8.6h3.28V19H6.5Zm5.4 0h3.14v1.42h.05c.44-.83 1.5-1.7 3.1-1.7 3.32 0 3.93 2.19 3.93 5.03V19h-3.28v-5.02c0-1.2-.02-2.74-1.67-2.74-1.68 0-1.94 1.31-1.94 2.65V19h-3.33Z"
          fill="#ffffff"
        />
      </>
    ),
    youtube: (
      <>
        <rect width="24" height="24" rx="6" fill="#FF0000" />
        <path d="M9.7 7.6v8.8l7.6-4.4Z" fill="#ffffff" />
      </>
    ),
    instagram: (
      <>
        <defs>
          <linearGradient id={gradientId} x1="1" y1="23" x2="23" y2="1" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FEDA75" />
            <stop offset="0.35" stopColor="#FA7E1E" />
            <stop offset="0.6" stopColor="#D62976" />
            <stop offset="0.8" stopColor="#962FBF" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill={`url(#${gradientId})`} />
        <rect x="6.3" y="6.3" width="11.4" height="11.4" rx="3.4" fill="none" stroke="#ffffff" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="3.1" fill="none" stroke="#ffffff" strokeWidth="1.4" />
        <circle cx="15.7" cy="8.3" r="0.9" fill="#ffffff" />
      </>
    ),
    facebook: (
      <>
        <rect width="24" height="24" rx="6" fill="#1877F2" />
        <path
          d="M13.4 19v-5.6h1.88l.36-2.18h-2.24V9.73c0-.6.29-1.18 1.24-1.18h.96V6.69s-.87-.15-1.7-.15c-1.74 0-2.88 1.05-2.88 2.97v1.71H9.1v2.18h1.92V19Z"
          fill="#ffffff"
        />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-4 shrink-0", className)}>
      {badges[platform]}
    </svg>
  );
}
