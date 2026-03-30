"use client";

import React, { useEffect, useMemo } from "react";
import { MessageStatus } from "../lib/types";
import {
  UIMessage,
  useSmoothText,
  useUIMessages,
} from "@convex-dev/agent/react";
import { api } from "../../../../convex/_generated/api";
import { PER_PAGE } from "@/lib/constants";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import InfiniteScroll from "@/components/infinite-scroll";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import ChatToolResults from "./chat-tool-results";

interface Props {
  threadId: string;
  onStatusChange: (status: MessageStatus) => void;
}
const MessagesView = ({ threadId, onStatusChange }: Props) => {
  const {
    results: messages,
    status,
    isLoading,
    loadMore,
  } = useUIMessages(
    api.brain.listMessages,
    { threadId },
    { initialNumItems: PER_PAGE, stream: true },
  );

  const isStreaming = useMemo(
    () => messages.some((m) => m.status === "streaming"),
    [messages],
  );

  useEffect(() => {
    onStatusChange(isStreaming ? "streaming" : "ready");
  }, [isStreaming, onStatusChange]);

  return (
    <Conversation className="siez-full">
      <ConversationContent className="px-4 py-6">
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
  );
};

export default MessagesView;

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

      {message.role === "assistant" && !isStreaming && (
        <ChatToolResults parts={message.parts} />
      )}
    </Message>
  );
}
