import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "lg";
}) {
  const isLarge = size === "lg";

  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <Image
        src="/icon-mark.png"
        alt=""
        width={isLarge ? 28 : 22}
        height={isLarge ? 28 : 22}
        className={isLarge ? "rounded-[7px]" : "rounded-[6px]"}
        priority
      />
      <span
        className={cn(
          "font-heading font-semibold tracking-tight text-foreground",
          isLarge ? "text-[28px] font-bold" : "text-[15px]",
        )}
      >
        Oyekool
      </span>
    </Link>
  );
}
