"use client";

import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AIProviderIdDb } from "@/types/database";

export interface AIProviderOption {
  id: string;
  providerId: AIProviderIdDb;
  /** Display name — the fixed provider's name, or the user's label for a custom one. */
  name: string;
  defaultModel: string;
  isDefault: boolean;
}

export interface ProviderChoice {
  id: string;
  providerId: AIProviderIdDb;
  model: string;
}

export function ProviderPickerDialog({
  open,
  onClose,
  providers,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  providers: AIProviderOption[];
  value: ProviderChoice;
  onChange: (choice: ProviderChoice) => void;
}) {
  function selectProvider(option: AIProviderOption) {
    onChange({ id: option.id, providerId: option.providerId, model: option.defaultModel });
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Change BYOK provider"
      description="Pick which of your connected providers to generate this post with. Model and other settings are managed in BYOK."
    >
      <div className="flex flex-col gap-2">
        {providers.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => selectProvider(option)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md border px-3 py-2.5 text-center text-sm font-medium transition-colors",
              option.id === value.id
                ? "border-primary bg-secondary text-foreground"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            <span className="truncate">
              {option.name}
              <span className="ml-1.5 font-normal text-muted-foreground">· {option.defaultModel}</span>
            </span>
            {option.isDefault && <span className="shrink-0 text-xs text-muted-foreground">(default)</span>}
          </button>
        ))}
      </div>
    </Dialog>
  );
}
