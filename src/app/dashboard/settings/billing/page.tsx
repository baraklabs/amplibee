import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <div>
      <h2 className="font-heading text-base font-semibold text-foreground">Billing</h2>
      <p className="mt-1 text-sm text-muted-foreground">Your current plan and usage.</p>

      <div className="mt-6 max-w-md rounded-lg border border-border p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Starter</p>
          <Badge variant="accent">Free</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          1 workflow, 2 connected accounts, cross-post to 1 destination.
        </p>
        <Button className="mt-4" variant="outline" size="sm" asChild>
          <Link href="/pricing">View plans</Link>
        </Button>
      </div>

      <p className="mt-6 max-w-md text-sm text-muted-foreground">
        Self-serve plan upgrades and invoices aren&apos;t live yet.{" "}
        <Link href="/contact" className="font-medium text-foreground underline underline-offset-4">
          Contact us
        </Link>{" "}
        if you want to move to Builder or Team today.
      </p>
    </div>
  );
}
