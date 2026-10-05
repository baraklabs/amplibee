"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  getStoredConsent,
  storeConsent,
  onOpenCookieSettings,
  type CookieConsent,
} from "@/lib/cookie-consent";

const categories: {
  key: keyof Omit<CookieConsent, "necessary">;
  title: string;
  description: string;
}[] = [
  {
    key: "analytics",
    title: "Analytics",
    description: "Helps us understand usage.",
  },
  {
    key: "marketing",
    title: "Marketing",
    description: "Measures our ads and campaigns.",
  },
];

export function CookieSettingsModal({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (consent: CookieConsent) => void;
}) {
  const [analytics, setAnalytics] = React.useState(false);
  const [marketing, setMarketing] = React.useState(false);

  React.useEffect(() => {
    // Re-reads the saved choice from localStorage each time the dialog
    // opens, so it reflects whatever was last saved rather than stale
    // in-memory state from a previous open/close cycle.
    if (!open) return;
    const stored = getStoredConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnalytics(stored?.analytics ?? false);
    setMarketing(stored?.marketing ?? false);
  }, [open]);

  // Lets the footer's "Cookie Settings" link open this modal from anywhere,
  // since the footer and this modal live in different layouts.
  React.useEffect(() => onOpenCookieSettings(() => onOpenChange(true)), [onOpenChange]);

  function save(consent: CookieConsent) {
    storeConsent(consent);
    onSaved(consent);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      title="Cookie settings"
      description="Choose which cookies Oyekool may use. You can change this anytime from the footer."
    >
      <div className="flex flex-col divide-y divide-border">
        <div className="flex items-start justify-between gap-4 py-4 first:pt-0">
          <div>
            <p className="text-sm font-medium text-foreground">Strictly necessary</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Required for sign-in and security. Always active.
            </p>
          </div>
          <Switch checked disabled onCheckedChange={() => {}} label="Strictly necessary cookies" />
        </div>

        {categories.map((category) => (
          <div key={category.key} className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-foreground">{category.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{category.description}</p>
            </div>
            <Switch
              checked={category.key === "analytics" ? analytics : marketing}
              onCheckedChange={category.key === "analytics" ? setAnalytics : setMarketing}
              label={`${category.title} cookies`}
            />
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        <Link href="/privacy#cookies" className="font-medium text-foreground underline underline-offset-4">
          Privacy Policy
        </Link>
      </p>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={() => save({ necessary: true, analytics: false, marketing: false })}
        >
          Reject all
        </Button>
        <Button
          variant="outline"
          onClick={() => save({ necessary: true, analytics: true, marketing: true })}
        >
          Accept all
        </Button>
        <Button onClick={() => save({ necessary: true, analytics, marketing })}>
          Save preferences
        </Button>
      </div>
    </Dialog>
  );
}
