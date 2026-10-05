import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PlatformId } from "@/lib/platforms/types";
import type { ChannelId } from "@/lib/channels/types";

type IconId = PlatformId | ChannelId;

interface PlatformIconProps {
  platform: IconId;
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

  const badges: Record<IconId, ReactNode> = {
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
    medium: (
      <>
        <rect width="24" height="24" rx="6" fill="#000000" />
        <path d="M5.2 8.3a.5.5 0 0 0-.16-.4L3.6 6.2V6h4.5l3.5 7.6L14.7 6h4.3v.2l-1.2 1.2c-.1.1-.16.25-.14.4v8.4c-.02.14.04.29.14.4l1.2 1.2v.2h-6v-.2l1.24-1.2c.12-.12.12-.16.12-.4v-6.8l-3.5 8.8h-.47L6 10.2v5.9c-.03.3.07.6.28.8l1.6 1.9v.2H3.4v-.2l1.6-1.9c.2-.2.3-.5.2-.8z" fill="#ffffff" transform="translate(2.2 1.5) scale(.82)" />
      </>
    ),
    substack: (
      <>
        <rect width="24" height="24" rx="6" fill="#FF6719" />
        <path d="M6.5 6h11v1.9h-11zM6.5 9.3h11v1.9h-11zM6.5 12.6h11V19L12 15.9 6.5 19z" fill="#ffffff" />
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
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-4 shrink-0", className)}>
      {badges[platform]}
    </svg>
  );
}
