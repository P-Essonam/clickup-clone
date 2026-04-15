"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";

import {
  optimisticallySendMessage,
  useUIMessages,
  useSmoothText,
  type UIMessage,
} from "@convex-dev/agent/react";

import { ArrowLeft, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { ChatStatus } from "ai";

import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputButton,
  type PromptInputMessage,
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
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import InfiniteScroll from "@/components/infinite-scroll";
import { PER_PAGE } from "@/lib/constants";
import { models } from "@/lib/models";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { api } from "../../../../convex/_generated/api";

interface Props {
  threadId: string;
}
const AgentChatSection = ({ threadId }: Props) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageStatus, setMessageStatus] = useState<ChatStatus>("ready");
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedModelData = models.find((m) => m.id === model);

  const sendMessageMutation = useMutation(
    api.agentsCreation.sendMessage,
  ).withOptimisticUpdate((store, args) => {
    if (!args.threadId) return;
    optimisticallySendMessage(api.agentsCreation.listMessages)(store, {
      threadId: args.threadId,
      prompt: args.prompt,
    });
  });

  const {
    results: messages,
    status,
    isLoading,
    loadMore,
  } = useUIMessages(
    api.agentsCreation.listMessages,
    { threadId },
    { initialNumItems: PER_PAGE, stream: true },
  );

  const isStreaming = useMemo(
    () => messages.some((msg) => msg.status === "streaming"),
    [messages],
  );

  const submitStatus: ChatStatus =
    messageStatus === "error"
      ? "error"
      : isSubmitting
        ? "submitted"
        : isStreaming
          ? "streaming"
          : "ready";

  const isDisabled =
    submitStatus === "submitted" || submitStatus === "streaming";

  const handleSendMessage = async (
    promptMessage: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!promptMessage.text.trim() || isDisabled) return;

    setIsSubmitting(true);
    try {
      await sendMessageMutation({ threadId, prompt: promptMessage.text });
      setMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
      setMessageStatus("ready");
    }
  };

  return (
    <div className="w-120 flex flex-col border-r p-1">
      <div className="flex items-center  gap-3">
        <Button variant={"ghost"} asChild>
          <Link href="/dashboard/agents" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <Conversation className="size-full">
          <ConversationContent>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </ConversationContent>
          <ConversationScrollButton />
          <InfiniteScroll
            status={status}
            isLoading={isLoading}
            loadMore={loadMore}
            numItems={PER_PAGE}
          />
        </Conversation>
      </div>

      <PromptInput
        onSubmit={handleSendMessage}
        className="w-full rounded-2xl p-1"
      >
        <PromptInputTextarea
          ref={textareaRef}
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setMessage(e.target.value)
          }
          placeholder="Ask AI any questions or update your Super Agent"
          className="min-h-16"
          disabled={isLoading}
        />

        <PromptInputFooter className="flex justify-between">
          <PromptInputTools>
            <ModelSelector
              onOpenChange={setModelSelectorOpen}
              open={modelSelectorOpen}
            >
              <ModelSelectorTrigger asChild>
                <PromptInputButton>
                  {selectedModelData?.chefSlug && (
                    <ModelSelectorLogo provider={selectedModelData.chefSlug} />
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
    </div>
  );
};

export default AgentChatSection;

function ChatMessage({ message }: { message: UIMessage }) {
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  });

  const [reasoningText] = useSmoothText(
    message.parts
      .filter((p) => p.type === "reasoning")
      .map((p) => p.text)
      .join("\n"),
    {
      startStreaming: message.status === "streaming",
    },
  );

  const isStreaming = message.status === "streaming";

  return (
    <Message from={message.role}>
      <MessageContent>
        {reasoningText && (
          <Reasoning className="w-full" isStreaming={isStreaming}>
            <ReasoningTrigger />
            <ReasoningContent>{reasoningText}</ReasoningContent>
          </Reasoning>
        )}

        {!isStreaming && visibleText && (
          <MessageResponse>{visibleText}</MessageResponse>
        )}
      </MessageContent>
    </Message>
  );
}
