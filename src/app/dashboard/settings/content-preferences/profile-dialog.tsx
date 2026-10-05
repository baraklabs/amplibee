"use client";

import { useActionState } from "react";
import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { idleActionState } from "@/lib/types/action-state";
import { saveContentProfile } from "./actions";
import type { ContentProfileRow } from "./types";

const toneOptions = ["Founder", "Professional", "Casual", "Technical", "Educational", "Opinionated"];

export function ContentProfileDialog({
  open,
  onClose,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  profile?: ContentProfileRow;
}) {
  const action = saveContentProfile.bind(null, profile?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, idleActionState);

  React.useEffect(() => {
    if (state.status === "success") onClose();
  }, [state.status, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={profile ? "Edit content profile" : "New content profile"}
      description="This controls how AI-generated content sounds across every platform."
      className="max-w-xl"
    >
      <form action={formAction} className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="name">Profile name</Label>
          <Input id="name" name="name" defaultValue={profile?.name} required placeholder="e.g. Default voice" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tone">Tone</Label>
          <Select id="tone" name="tone" defaultValue={profile?.tone ?? "Founder"}>
            {toneOptions.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="formality">Formality</Label>
          <Select id="formality" name="formality" defaultValue={profile?.formality ?? "neutral"}>
            <option value="casual">Casual</option>
            <option value="neutral">Neutral</option>
            <option value="formal">Formal</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="audience">Audience</Label>
          <Input id="audience" name="audience" defaultValue={profile?.audience} placeholder="e.g. Founders and builders" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="length">Default length</Label>
          <Select id="length" name="length" defaultValue={profile?.length ?? "medium"}>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="brandVoice">Brand voice</Label>
          <Textarea
            id="brandVoice"
            name="brandVoice"
            defaultValue={profile?.brand_voice}
            placeholder="Direct, confident, no fluff"
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="ctaStyle">Preferred CTA style</Label>
          <Input id="ctaStyle" name="ctaStyle" defaultValue={profile?.cta_style} placeholder="Soft — invite, don't push" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="defaultHashtags">Default hashtags</Label>
          <Input id="defaultHashtags" name="defaultHashtags" defaultValue={profile?.default_hashtags} placeholder="#buildinpublic" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="topicsToAvoid">Topics to avoid</Label>
          <Input id="topicsToAvoid" name="topicsToAvoid" defaultValue={profile?.topics_to_avoid} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="wordsToAvoid">Words/phrases to avoid</Label>
          <Input id="wordsToAvoid" name="wordsToAvoid" defaultValue={profile?.words_to_avoid} placeholder="e.g. game-changer, synergy" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="personalContext">Context about you/company</Label>
          <Textarea
            id="personalContext"
            name="personalContext"
            defaultValue={profile?.personal_context}
            rows={2}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
          <input type="checkbox" name="isDefault" defaultChecked={profile?.is_default} className="size-4 rounded border-input" />
          Use as default profile
        </label>

        {state.status === "error" && (
          <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>
        )}
        <Button type="submit" loading={isPending} className="sm:col-span-2">
          Save profile
        </Button>
      </form>
    </Dialog>
  );
}
