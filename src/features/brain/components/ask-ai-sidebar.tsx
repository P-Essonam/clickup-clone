"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, usePreloadedQuery, type Preloaded } from "convex/react";
import { optimisticallySendMessage } from "@convex-dev/agent/react";

import { Clock, MessageSquarePlus, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";

import { useAskAIStore } from "../hooks/use-ask-ai-store";
import { useSpaces } from "@/hooks/use-spaces";

import { api } from "../../../../convex/_generated/api";
import { MessageStatus } from "../lib/types";
import MessagesView from "./messages-view";
import ChatEmptyState from "./chat-empty-state";
import ThreadListOverlay from "./thread-list-overlay";
import ResourcePicker from "./resource-picker";

interface Props {
  preloadedCurrentThread: Preloaded<typeof api.brain.getCurrentThread>;
}

const AskAiSidebar = ({ preloadedCurrentThread }: Props) => {
  const {
    isOpen,
    close,
    currentThreadId,
    setThreadId,
    selectedContext,
    closeRecentThreads,
    toggleRecentThreads,
  } = useAskAIStore();

  const { spaces } = useSpaces();

  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState<MessageStatus>("ready");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasInitialized = useRef(false);

  const sendMessageMutation = useMutation(
    api.brain.sendMessage,
  ).withOptimisticUpdate((store, args) => {
    if (!args.threadId) return;
    optimisticallySendMessage(api.brain.listMessages)(store, {
      threadId: args.threadId,
      prompt: args.prompt,
    });
  });

  const currentThreadFromDb = usePreloadedQuery(preloadedCurrentThread);

  useEffect(() => {
    if (isOpen && currentThreadFromDb && !hasInitialized.current) {
      setThreadId(currentThreadFromDb);
      hasInitialized.current = true;
    }
  }, [isOpen, currentThreadFromDb, setThreadId]);

  const handleSendMessage = async (
    promptMessage: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!promptMessage.text.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setMessageStatus("submitted");

    try {
      setMessageStatus("streaming");

      const { threadId } = await sendMessageMutation({
        threadId: currentThreadId ?? undefined,
        prompt: promptMessage.text,
        spaceId: selectedContext.spaceId ?? undefined,
        listId: selectedContext.listId ?? undefined,
      });

      if (!currentThreadId && threadId) {
        setThreadId(threadId);
      }

      setMessage("");
    } catch {
      setMessageStatus("error");
      toast.error("Failed to send message");
      setTimeout(() => setMessageStatus("ready"), 2000);
    }
  };

  const handleNewThread = () => {
    setThreadId(null);
    closeRecentThreads();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  if (!isOpen) return null;

  const isDisabled =
    messageStatus === "streaming" || messageStatus === "submitted";

  return (
    <div className="relative flex size-full max-w-sm shrink-0 flex-col border rounded-lg bg-background">
      <div className="flex relative shrink-0 items-center justify-between px-4 py-3">
        <div className="flex  items-center gap-2">
          <Button
            variant={"ghost"}
            size={"icon"}
            className="size-8"
            onClick={toggleRecentThreads}
          >
            <Clock className="size-4" />
          </Button>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="size-8"
            onClick={handleNewThread}
          >
            <MessageSquarePlus className="size-4" />
          </Button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Image src={"/logo.svg"} alt="ClickUp Logo" width={16} height={16} />
          <span className="font-semibold text-sm">ClickUp Brain</span>
        </div>

        <Button
          variant={"ghost"}
          size={"icon"}
          className="size-8"
          onClick={close}
        >
          <X className="size-4" />
        </Button>
      </div>

      <ThreadListOverlay />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {currentThreadId ? (
          <MessagesView
            threadId={currentThreadId}
            onStatusChange={setMessageStatus}
          />
        ) : (
          <ChatEmptyState onSuggestionClick={handleSuggestionClick} />
        )}
      </div>

      <div className="shrink-0 p-4">
        <PromptInput onSubmit={handleSendMessage} className="w-full">
          <PromptInputTextarea
            ref={textareaRef}
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setMessage(e.target.value)
            }
            placeholder="Ask, create, search"
            disabled={isDisabled}
            className="min-h-20"
          />
          <PromptInputFooter>
            <PromptInputTools>
              <ResourcePicker spaces={spaces} />
            </PromptInputTools>

            <PromptInputTools>
              <PromptInputSubmit
                disabled={!message.trim() || isDisabled}
                status={messageStatus}
              />
            </PromptInputTools>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default AskAiSidebar;
