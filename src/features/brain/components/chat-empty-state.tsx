import React from "react";

import { FileText, Lightbulb, Pencil, Sparkles, Zap } from "lucide-react";
import { AI_SUGGESTIONS } from "../lib/constants";

const ICON_MAP = {
  Lightbulb,
  FileText,
  Pencil,
  Sparkles,
  Zap,
};

interface Props {
  onSuggestionClick: (s: string) => void;
}

const ChatEmptyState = ({ onSuggestionClick }: Props) => {
  return (
    <div className="flex flex-1 flex-col justify-between p-6">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Suggested</p>
          <div className="grid gap-1">
            {AI_SUGGESTIONS.slice(0, 3).map((s) => {
              const Icon =
                ICON_MAP[s.icon as keyof typeof ICON_MAP] || Sparkles;

              return (
                <button
                  key={s.text}
                  className="group flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm transition-colors hover:bg-accent/50"
                  onClick={() => onSuggestionClick(s.text)}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-foreground">{s.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Featured</p>
        <div className="grid gap-1">
          {AI_SUGGESTIONS.slice(3, 6).map((s) => {
            const Icon = ICON_MAP[s.icon as keyof typeof ICON_MAP] || Sparkles;

            return (
              <button
                key={s.text}
                className="group flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm transition-colors hover:bg-accent/50"
                onClick={() => onSuggestionClick(s.text)}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <Icon className="size-4" />
                </div>
                <span className="text-foreground">{s.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatEmptyState;
