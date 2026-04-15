"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { CheckIcon, Glasses, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  PromptInput,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";

import { Button } from "@/components/ui/button";
import { models } from "@/lib/models";
import { api } from "../../../../../convex/_generated/api";
import { SUGGESTED_AGENTS } from "@/features/agents/lib/constants";

const page = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedModelData = models.find((m) => m.id === model);

  const sendMessage = useMutation(api.agentsCreation.sendMessage);

  const handleSubmit = async (
    promptMessage: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!promptMessage.text.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const { threadId } = await sendMessage({ prompt: promptMessage.text });
      router.push(`/dashboard/agents/${threadId}`);
    } catch (error) {
      toast.error("Failed to start conversation");
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setMessage(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-1 flex-col size-full overflow-hidden">
      <div className="relative flex flex-1 items-center justify-center px-6 py-10">

        <div className="flex w-full max-w-2xl flex-col items-center">
          <div className="flex items-center gap-2.5 mb-10">
            <Glasses className="size-8 text-primary" />
            <h1 className="text-3xl font-semibold  tracking-tight">
              Super Agents
            </h1>
          </div>

          <PromptInput onSubmit={handleSubmit} className="w-full rounded-2xl p-1">
            <PromptInputTextarea
              ref={textareaRef}
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
              placeholder="Tell us what you want automated and we'll build your agent"
              className="min-h-16"
              disabled={isLoading}
            />

            <PromptInputFooter className="pt-2">
              <PromptInputTools>
                <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton>
                      {selectedModelData?.chefSlug && (
                        <ModelSelectorLogo
                          provider={selectedModelData.chefSlug}
                        />
                      )}
                      {selectedModelData?.name && (
                        <ModelSelectorName>
                          {selectedModelData.name}
                        </ModelSelectorName>
                      )}
                    </PromptInputButton>
                  </ModelSelectorTrigger>

                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />

                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      <ModelSelectorGroup
                        heading={selectedModelData?.chef || "Models"}
                      >
                        {models.map((m) => (
                          <ModelSelectorItem
                            key={m.id}
                            onSelect={() => {
                              setModel(m.id);
                              setModelSelectorOpen(false);
                            }}
                            value={m.id}
                          >
                            <ModelSelectorLogo provider={m.chefSlug} />
                            <ModelSelectorName>{m.name}</ModelSelectorName>
                            <ModelSelectorLogoGroup>
                              {m.providers.map((provider) => (
                                <ModelSelectorLogo
                                  key={provider}
                                  provider={provider}
                                />
                              ))}
                            </ModelSelectorLogoGroup>
                            {model === m.id ? (
                              <CheckIcon className="ml-auto size-4" />
                            ) : (
                              <div className="ml-auto size-4" />
                            )}
                          </ModelSelectorItem>
                        ))}
                      </ModelSelectorGroup>
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!message.trim() || isLoading}
                className="size-8 rounded-full"
              />
            </PromptInputFooter>
          </PromptInput>

          <div className="grid  w-full grid-cols-3 gap-3 mt-4">
            {SUGGESTED_AGENTS.map((agent, index) => {
              const Icon = agent.icon;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(agent.description)}
                  disabled={isLoading}
                  className="flex flex-col items-start gap-2 rounded-xl border p-4 text-left hover:bg-accent/50 transition-colors disabled:opacity-50"
                >
                  <Icon className="size-3.5 text-primary" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{agent.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default page;
