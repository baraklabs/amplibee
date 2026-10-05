"use client";

import * as React from "react";
import { useActionState } from "react";
import { Wand2, Settings, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { channelList } from "@/lib/channels/registry";
import { promotionTypeLabels, campaignGoalLabels, budgetTypeLabels } from "@/lib/campaign-labels";
import { cn } from "@/lib/utils";
import { generateCampaign, writeCampaignManually, type CreateCampaignState, type CampaignBriefView } from "./actions";
import { BriefPanel } from "./brief-panel";
import { CampaignPreview } from "./campaign-preview";
import { NetworkPanel } from "./network-panel";
import { useCampaignBrief } from "./use-campaign-brief";
import { ProviderPickerDialog, type AIProviderOption, type ProviderChoice } from "./provider-picker-dialog";
import type { ChannelId, PromotionType, CampaignGoal, BudgetType } from "@/types/database";

const initialState: CreateCampaignState = { status: "idle" };

interface ContentProfileOption {
  id: string;
  name: string;
}

/** A square icon button with a tooltip name — the "quick selection" idiom used across Create. */
function QuickSelect({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md border transition-colors",
          active
            ? "border-primary bg-secondary text-foreground"
            : "border-border text-muted-foreground hover:bg-muted",
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
}

export function Composer({
  contentProfiles,
  aiProviders,
}: {
  contentProfiles: ContentProfileOption[];
  aiProviders: AIProviderOption[];
}) {
  const hasAIProvider = aiProviders.length > 0;
  const defaultProvider = aiProviders.find((p) => p.isDefault) ?? aiProviders[0];
  const [providerChoice, setProviderChoice] = React.useState<ProviderChoice | null>(
    defaultProvider
      ? { id: defaultProvider.id, providerId: defaultProvider.providerId, model: defaultProvider.defaultModel }
      : null,
  );
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [promotionType, setPromotionType] = React.useState<PromotionType>("saas_product");
  const [selectedChannels, setSelectedChannels] = React.useState<Set<ChannelId>>(new Set(["linkedin"]));
  const [state, formAction, isPending] = useActionState(generateCampaign, initialState);
  const [manualState, manualFormAction, isManualPending] = useActionState(writeCampaignManually, initialState);
  const [campaign, setCampaign] = React.useState<{ id: string; name: string; briefs: CampaignBriefView[] } | null>(null);
  const [activeChannel, setActiveChannel] = React.useState<ChannelId | null>(null);
  const [lastAIState, setLastAIState] = React.useState(state);
  const [lastManualState, setLastManualState] = React.useState(manualState);
  const [latestState, setLatestState] = React.useState<CreateCampaignState>(initialState);
  const selectedProviderOption = aiProviders.find((p) => p.id === providerChoice?.id);

  if (state !== lastAIState) {
    setLastAIState(state);
    setLatestState(state);
    if (state.status === "success" && state.campaignId && state.briefs) {
      setCampaign({ id: state.campaignId, name: state.campaignName ?? "Campaign", briefs: state.briefs });
      setActiveChannel(state.briefs[0]?.channel ?? null);
    }
  }
  if (manualState !== lastManualState) {
    setLastManualState(manualState);
    setLatestState(manualState);
    if (manualState.status === "success" && manualState.campaignId && manualState.briefs) {
      setCampaign({ id: manualState.campaignId, name: manualState.campaignName ?? "Campaign", briefs: manualState.briefs });
      setActiveChannel(manualState.briefs[0]?.channel ?? null);
    }
  }

  const activeBrief = campaign?.briefs.find((b) => b.channel === activeChannel) ?? campaign?.briefs[0];
  const brief = useCampaignBrief({
    briefId: activeBrief?.id ?? "",
    channel: activeBrief?.channel ?? "x",
    initialContent: activeBrief?.content ?? "",
    initialStatus: activeBrief?.status ?? "draft",
  });

  const errorMessage = latestState.status === "error" ? latestState.error : null;

  function toggleChannel(channel: ChannelId) {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(channel)) next.delete(channel);
      else next.add(channel);
      return next;
    });
  }

  // Once a campaign has been created, this composer's job is done — show the
  // per-channel briefs to review/edit, and the network-publish step.
  if (campaign) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            {campaign.briefs.length > 1 && (
              <div className="flex items-center gap-2">
                {campaign.briefs.map((b) => (
                  <QuickSelect
                    key={b.channel}
                    label={b.channel}
                    active={b.channel === activeBrief?.channel}
                    onClick={() => setActiveChannel(b.channel)}
                  >
                    <PlatformIcon platform={b.channel} className="size-4" colored />
                  </QuickSelect>
                ))}
              </div>
            )}
            {activeBrief && activeBrief.status !== "failed" ? (
              <BriefPanel brief={brief} />
            ) : activeBrief ? (
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-destructive">{activeBrief.content}</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            {activeBrief && activeBrief.status !== "failed" && <CampaignPreview brief={brief} campaignName={campaign.name} />}
            <NetworkPanel campaignId={campaign.id} campaignName={campaign.name} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top: quick channel selection */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Target channels</span>
          {channelList.map((platform) => (
            <QuickSelect
              key={platform.id}
              label={platform.name}
              active={selectedChannels.has(platform.id)}
              onClick={() => toggleChannel(platform.id)}
            >
              <PlatformIcon platform={platform.id} className="size-4" colored />
            </QuickSelect>
          ))}
        </div>
      </div>

      {!hasAIProvider && (
        <div className="rounded-md border border-warning-soft bg-warning-soft px-3 py-2.5 text-sm text-warning">
          No AI provider connected — you can still write talking points yourself, or connect one in BYOK to generate them.
        </div>
      )}

      <form id="composer-form" className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-heading text-[15px] font-semibold text-foreground">What are you promoting?</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Brief it once — write the talking points yourself, or let AI draft a starting point per channel for an
          influencer to adapt in their own voice.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          {[...selectedChannels].map((channel) => (
            <input key={channel} type="hidden" name="targetPlatforms" value={channel} />
          ))}
          <input type="hidden" name="aiProviderId" value={providerChoice?.id ?? ""} />
          <input type="hidden" name="model" value={providerChoice?.model ?? ""} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="promotionType">What is it</Label>
              <Select
                id="promotionType"
                name="promotionType"
                value={promotionType}
                onChange={(e) => setPromotionType(e.target.value as PromotionType)}
              >
                {Object.entries(promotionTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Campaign name</Label>
              <Input id="name" name="name" placeholder="e.g. Launch week" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="productUrl">Product URL</Label>
              <Input id="productUrl" name="productUrl" type="url" placeholder="https://yourproduct.com" />
            </div>
            {promotionType === "github_repo" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="repoUrl">Repo URL</Label>
                <Input id="repoUrl" name="repoUrl" type="url" placeholder="https://github.com/you/repo" />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal">Goal</Label>
              <Select id="goal" name="goal" defaultValue={"awareness" satisfies CampaignGoal}>
                {Object.entries(campaignGoalLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budgetType">Budget</Label>
              <Select id="budgetType" name="budgetType" defaultValue={"unpaid" satisfies BudgetType}>
                {Object.entries(budgetTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rawContent">Tell us about it</Label>
            <Textarea
              id="rawContent"
              name="rawContent"
              rows={6}
              required
              placeholder="What it does, who it's for, why it's worth an influencer's genuine attention…"
            />
          </div>

          <details className="rounded-md border border-border p-3 open:pb-1">
            <summary className="cursor-pointer text-sm font-medium text-foreground">Tracked link (optional)</summary>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="linkUrl">Destination URL</Label>
                <Input id="linkUrl" name="linkUrl" type="url" placeholder="https://yourproduct.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="anchorText">Suggested CTA text</Label>
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
              <Label htmlFor="contentProfileId">Product voice</Label>
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

          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              formAction={manualFormAction}
              loading={isManualPending}
              disabled={isPending || selectedChannels.size === 0}
              variant="outline"
              className="flex-1"
            >
              <PenLine className="size-4" />
              Write
            </Button>
            <Button
              type="submit"
              formAction={formAction}
              loading={isPending}
              disabled={isManualPending || !hasAIProvider || selectedChannels.size === 0}
              className="flex-1"
            >
              <Wand2 className="size-4" />
              Generate
            </Button>
            {hasAIProvider && (
              <Tooltip label="Change BYOK provider">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {selectedProviderOption?.name ?? "BYOK"}
                  <Settings className="size-3.5 text-muted-foreground" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </form>

      {providerChoice && (
        <ProviderPickerDialog
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          providers={aiProviders}
          value={providerChoice}
          onChange={setProviderChoice}
        />
      )}
    </div>
  );
}
