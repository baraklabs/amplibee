"use client";

import * as React from "react";
import { useActionState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { idleActionState } from "@/lib/types/action-state";
import { saveAIProvider, testAIProviderConnection, type TestConnectionState } from "./actions";
import type { AIProviderDefinition, AIProviderId } from "@/lib/ai/types";

const CUSTOM_OPTION = "custom" as const;
const testInitial: TestConnectionState = { status: "idle" };

export interface EditingProvider {
  id: string;
  provider: AIProviderId;
  definition: AIProviderDefinition | null; // null for a custom provider
  label: string | null;
  baseUrl: string | null;
  defaultModel: string;
  isDefault: boolean;
}

function initialFieldsFor(editing: EditingProvider | null | undefined, availableFixed: AIProviderDefinition[]) {
  const provider = editing?.provider ?? availableFixed[0]?.id ?? CUSTOM_OPTION;
  const fixed = provider === CUSTOM_OPTION ? null : (availableFixed.find((d) => d.id === provider) ?? editing?.definition);
  return {
    provider,
    label: editing?.label ?? (provider === CUSTOM_OPTION ? "" : (fixed?.name ?? "")),
    baseUrl: editing?.baseUrl ?? "",
    defaultModel: editing?.defaultModel ?? fixed?.defaultModel ?? "",
    isDefault: editing?.isDefault ?? false,
  };
}

export function ProviderDialog({
  open,
  onClose,
  availableFixed,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  /** Fixed provider definitions not yet configured — offered in "add" mode alongside "Custom". */
  availableFixed: AIProviderDefinition[];
  editing?: EditingProvider | null;
}) {
  const title = editing ? `Edit ${editing.label ?? editing.definition?.name ?? "provider"}` : "Add AI provider";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description="Bring your own key. Oyekool never marks up AI usage."
    >
      {/* Dialog only mounts this while `open` is true, so it gets a fresh, reset instance
          each time it opens — but stays mounted (preserving typed values, including the API
          key) across a failed save/test re-render, since `open` doesn't change on error. */}
      <ProviderForm onClose={onClose} availableFixed={availableFixed} editing={editing} />
    </Dialog>
  );
}

function ProviderForm({
  onClose,
  availableFixed,
  editing,
}: {
  onClose: () => void;
  availableFixed: AIProviderDefinition[];
  editing?: EditingProvider | null;
}) {
  const isEdit = Boolean(editing);
  const [fields, setFields] = React.useState(() => initialFieldsFor(editing, availableFixed));
  const [apiKey, setApiKey] = React.useState("");
  const [saveState, saveAction, isSaving] = useActionState(saveAIProvider, idleActionState);
  const [testState, testAction, isTesting] = useActionState(testAIProviderConnection, testInitial);

  React.useEffect(() => {
    if (saveState.status === "success") onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveState.status]);

  const selection = fields.provider;
  const isCustom = selection === CUSTOM_OPTION;
  const selectedFixed = isCustom ? null : (availableFixed.find((d) => d.id === selection) ?? editing?.definition);

  function selectProvider(id: AIProviderId) {
    const fixed = id === CUSTOM_OPTION ? null : availableFixed.find((d) => d.id === id);
    setFields((prev) => ({
      ...prev,
      provider: id,
      label: id === CUSTOM_OPTION ? "" : (fixed?.name ?? prev.label),
      defaultModel: fixed?.defaultModel ?? prev.defaultModel,
    }));
  }

  return (
    <form action={saveAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={editing?.id ?? ""} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="provider">Provider</Label>
        {isEdit ? (
          <>
            <Input id="provider-label" value={editing?.definition?.name ?? "Custom (OpenAI-compatible)"} disabled />
            <input type="hidden" name="provider" value={selection} />
          </>
        ) : (
          <Select
            id="provider"
            name="provider"
            value={selection}
            onChange={(e) => selectProvider(e.target.value as AIProviderId)}
          >
            {availableFixed.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
            <option value={CUSTOM_OPTION}>Custom (OpenAI-compatible)</option>
          </Select>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label">Name</Label>
        <Input
          id="label"
          name="label"
          placeholder={isCustom ? "e.g. Groq, Together AI, local model" : selectedFixed?.name}
          value={fields.label}
          onChange={(e) => setFields((prev) => ({ ...prev, label: e.target.value }))}
          required
        />
      </div>

      {isCustom && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input
            id="baseUrl"
            name="baseUrl"
            type="url"
            placeholder="https://api.example.com/v1"
            value={fields.baseUrl}
            onChange={(e) => setFields((prev) => ({ ...prev, baseUrl: e.target.value }))}
            required
          />
          <p className="text-xs text-muted-foreground">
            Any OpenAI-compatible <span className="font-mono-tech">/chat/completions</span> endpoint.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="apiKey">API key</Label>
        <Input
          id="apiKey"
          name="apiKey"
          type="password"
          placeholder={selectedFixed?.apiKeyPlaceholder ?? "sk-..."}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="defaultModel">Default model</Label>
        {isCustom ? (
          <Input
            id="defaultModel"
            name="defaultModel"
            placeholder="e.g. llama-3.3-70b-versatile"
            value={fields.defaultModel}
            onChange={(e) => setFields((prev) => ({ ...prev, defaultModel: e.target.value }))}
            required
          />
        ) : (
          <Select
            id="defaultModel"
            name="defaultModel"
            value={fields.defaultModel}
            onChange={(e) => setFields((prev) => ({ ...prev, defaultModel: e.target.value }))}
          >
            {selectedFixed?.models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </Select>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="isDefault"
          checked={fields.isDefault}
          onChange={(e) => setFields((prev) => ({ ...prev, isDefault: e.target.checked }))}
          className="size-4 rounded border-input"
        />
        Use as default AI provider
      </label>

      {testState.status === "success" && (
        <p className="flex items-center gap-1.5 text-xs text-success">
          <CheckCircle2 className="size-3.5" /> Connection works.
        </p>
      )}
      {testState.status === "error" && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <XCircle className="size-3.5" /> {testState.error}
        </p>
      )}
      {saveState.status === "error" && <p className="text-xs text-destructive">{saveState.error}</p>}

      <div className="mt-1 flex flex-wrap gap-2">
        <Button type="submit" size="sm" loading={isSaving}>
          Save
        </Button>
        <Button type="submit" size="sm" variant="outline" formAction={testAction} loading={isTesting}>
          Test connection
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
