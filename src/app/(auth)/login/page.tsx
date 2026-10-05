import type { Metadata } from "next";
import { AuthCard } from "../auth-card";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Log in",
  description: "Log in to your Oyekool account.",
  path: "/login",
  noIndex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return <AuthCard initialMode={mode === "signup" ? "signup" : "signin"} />;
}
