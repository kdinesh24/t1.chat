'use client';

import { useEffect } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessage } from '@/lib/types';
import { useDataStream } from '@/components/data-stream-provider';

export interface UseAutoResumeParams {
  autoResume: boolean;
  initialMessages: ChatMessage[];
  resumeStream: UseChatHelpers<ChatMessage>['resumeStream'];
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
}

export function useAutoResume({
  autoResume,
  initialMessages,
  resumeStream,
  setMessages,
}: UseAutoResumeParams) {
  const { dataStream } = useDataStream();

  useEffect(() => {
    if (!autoResume) return;

    // Don't auto-resume if we have no messages
    if (initialMessages.length === 0) return;

    const mostRecentMessage = initialMessages[initialMessages.length - 1];

    // If the most recent message is from assistant, the conversation is already complete
    if (mostRecentMessage?.role === 'assistant') {
      return;
    }

    // Only consider resuming if the last message is from user (they're waiting for response)
    if (mostRecentMessage?.role === 'user') {
      // Check if there's a recent assistant message that suggests completion
      if (initialMessages.length >= 2) {
        const secondToLastMessage = initialMessages[initialMessages.length - 2];

        if (secondToLastMessage?.role === 'assistant') {
          const assistantCreatedAt = secondToLastMessage.metadata?.createdAt;
          const userCreatedAt = mostRecentMessage.metadata?.createdAt;

          if (assistantCreatedAt && userCreatedAt) {
            const assistantMessageTime = new Date(assistantCreatedAt);
            const userMessageTime = new Date(userCreatedAt);
            const timeDiffSeconds =
              (userMessageTime.getTime() - assistantMessageTime.getTime()) /
              1000;

            // If user sent a message more than 30 seconds after assistant response,
            // this is likely a new conversation, not a resume
            if (timeDiffSeconds > 30) {
              return;
            }

            // Also check if assistant message has substantial content
            const assistantContent =
              secondToLastMessage.parts
                ?.filter((part) => part.type === 'text')
                ?.map((part) => part.text || '')
                ?.join('') || '';

            if (assistantContent.trim().length > 50) {
              return;
            }
          }
        }
      }

      // Additional check: only resume if the user message is very recent (within 2 minutes)
      // This prevents resuming old conversations when user reloads the page
      const userCreatedAt = mostRecentMessage.metadata?.createdAt;
      if (userCreatedAt) {
        const userMessageTime = new Date(userCreatedAt);
        const now = new Date();
        const userMessageAge =
          (now.getTime() - userMessageTime.getTime()) / 1000;

        if (userMessageAge > 120) {
          // 2 minutes
          return;
        }
      }

      // If we get here, it's likely an incomplete conversation that needs resuming
      resumeStream();
    }

    // we intentionally run this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!dataStream) return;
    if (dataStream.length === 0) return;

    const dataPart = dataStream[0];

    if (dataPart.type === 'data-appendMessage') {
      const message = JSON.parse(dataPart.data);
      setMessages([...initialMessages, message]);
    }
  }, [dataStream, initialMessages, setMessages]);
}
