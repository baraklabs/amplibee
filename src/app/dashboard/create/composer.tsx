"use client";

import * as React from "react";
import { useActionState } from "react";
import { MessageSquareText, FileText, Link as LinkIcon, GitBranch, Megaphone, Newspaper, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { cn } from "@/lib/utils";
import { generateContent, type GenerateContentState } from "./actions";
import { GeneratedPostPanel } from "./generated-post-panel";
import type { PlatformIdDb } from "@/types/database";

const inputTypes: { value: string; label: string; icon: typeof MessageSquareText }[] = [
  { value: "x_post", label: "X post", icon: MessageSquareText },
  { value: "text", label: "Text", icon: FileText },
  { value: "url", label: "URL", icon: LinkIcon },
  { value: "github_repo", label: "GitHub repo", icon: GitBranch },
  { value: "product_hunt", label: "Product Hunt", icon: Megaphone },
  { value: "blog_post", label: "Blog post", icon: Newspaper },
];

const platforms: { value: PlatformIdDb; label: string }[] = [
  { value: "x", label: "X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "medium", label: "Medium" },
  { value: "substack", label: "Substack" },
];

const initialState: GenerateContentState = { status: "idle" };

interface ContentProfileOption {
  id: string;
  name: string;
}

interface AccountOption {
  id: string;
  platform: PlatformIdDb;
  displayName: string;
  status: string;
}

export function Composer({
  contentProfiles,
  accounts,
  hasAIProvider,
}: {
  contentProfiles: ContentProfileOption[];
  accounts: AccountOption[];
  hasAIProvider: boolean;
}) {
  const [inputType, setInputType] = React.useState("text");
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<Set<PlatformIdDb>>(new Set(["linkedin"]));
  const [state, formAction, isPending] = useActionState(generateContent, initialState);
  const [activeTab, setActiveTab] = React.useState<string | null>(null);
  const [syncedPosts, setSyncedPosts] = React.useState(state.posts);

  if (state.posts !== syncedPosts) {
    setSyncedPosts(state.posts);
    if (state.posts && state.posts.length > 0) setActiveTab(state.posts[0].id);
  }

  function togglePlatform(platform: PlatformIdDb) {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-5">
        {!hasAIProvider && (
          <div className="mb-4 rounded-md border border-warning-soft bg-warning-soft px-3 py-2.5 text-sm text-warning">
            Connect an AI provider in Settings → AI providers before generating content.
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-5">
          <div>
            <Label>Input type</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {inputTypes.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-center text-xs font-medium transition-colors",
                    inputType === value
                      ? "border-primary bg-secondary text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <input
                    type="radio"
                    name="inputType"
                    value={value}
                    checked={inputType === value}
                    onChange={() => setInputType(value)}
                    className="sr-only"
                  />
                  <Icon className="size-4" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {inputType === "url" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sourceUrl">Source URL</Label>
              <Input id="sourceUrl" name="sourceUrl" type="url" placeholder="https://" />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rawContent">Content</Label>
            <Textarea
              id="rawContent"
              name="rawContent"
              rows={7}
              required
              placeholder="Paste your X post, launch notes, or write the core idea here…"
            />
          </div>

          <details className="rounded-md border border-border p-3 open:pb-1">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              Backlink (optional)
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="linkUrl">Destination URL</Label>
                <Input id="linkUrl" name="linkUrl" type="url" placeholder="https://yourproduct.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="anchorText">Anchor text</Label>
                <Input id="anchorText" name="anchorText" placeholder="Check out the launch" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input name="utmSource" placeholder="utm_source" />
                <Input name="utmMedium" placeholder="utm_medium" />
                <Input name="utmCampaign" placeholder="utm_campaign" />
              </div>
            </div>
          </details>

          {contentProfiles.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contentProfileId">Content profile</Label>
              <Select id="contentProfileId" name="contentProfileId" defaultValue="">
                <option value="">Default</option>
                {contentProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <Label>Generate for</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {platforms.map(({ value, label }) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    selectedPlatforms.has(value)
                      ? "border-primary bg-secondary text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <input
                    type="checkbox"
                    name="targetPlatforms"
                    value={value}
                    checked={selectedPlatforms.has(value)}
                    onChange={() => togglePlatform(value)}
                    className="sr-only"
                  />
                  <PlatformIcon platform={value} className="size-3.5" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {state.status === "error" && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" loading={isPending} disabled={!hasAIProvider || selectedPlatforms.size === 0}>
            <Wand2 className="size-4" />
            Generate
          </Button>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        {state.status === "success" && state.posts && state.posts.length > 0 ? (
          <Tabs value={activeTab ?? state.posts[0].id} onValueChange={setActiveTab}>
            <TabsList>
              {state.posts.map((post) => (
                <TabsTrigger key={post.id} value={post.id}>
                  <span className="flex items-center gap-1.5">
                    <PlatformIcon platform={post.platform} className="size-3.5" />
                    {post.platform}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            {state.posts.map((post) => (
              <TabsContent key={post.id} value={post.id} className="mt-4">
                {post.status === "failed" ? (
                  <p className="text-sm text-destructive">{post.content}</p>
                ) : (
                  <GeneratedPostPanel
                    postId={post.id}
                    platform={post.platform}
                    initialContent={post.content}
                    initialStatus={post.status}
                    accounts={accounts.filter((a) => a.platform === post.platform && a.status === "connected")}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
            <Wand2 className="size-6 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Generated versions for each platform will show up here, ready to review and edit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
