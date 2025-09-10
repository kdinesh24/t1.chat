'use client';

import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState, } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote, Chat } from '@/lib/db/schema';
import { fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import {
  getChatHistoryPaginationKey,
} from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError, type ErrorCode } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';
import { useRouter } from 'next/navigation';
import CornerDecoration from './corner-decoration';
import { ThemeToggle } from './theme-toggle';
import { SettingsButton } from './settings-button';
import { useSidebar } from '@/components/ui/sidebar';
import { useApiKeys } from '@/hooks/use-api-keys';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { apiKeys, hasValidApiKey, getApiKey, hasApiKey } = useApiKeys();

  const [input, setInput] = useState<string>('');

  // Generate a title for new chats based on the user's first message
  const generateChatTitle = (message: ChatMessage): string => {
    const textParts = message.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join(' ');

    return textParts.slice(0, 80) || 'New Chat';
  };

  // Function to optimistically add new chat to sidebar
  const addNewChatToSidebar = (title: string) => {
    const newChat: Chat = {
      id,
      title,
      userId: session.user.id,
      visibility: visibilityType,
      createdAt: new Date(),
    };

    // Update all history cache entries to include the new chat at the top
    mutate(
      (key) => typeof key === 'string' && key.includes('/api/history'),
      (data: any) => {
        if (!data || !data.chats) return data;

        // Check if chat already exists to avoid duplicates
        const chatExists = data.chats.some((chat: Chat) => chat.id === id);
        if (chatExists) return data;

        return {
          ...data,
          chats: [newChat, ...data.chats],
        };
      },
      { revalidate: false },
    );
  };

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }) {
        const apiKey = getApiKey('google');
        if (!apiKey || apiKey.trim().length === 0) {
          throw new Error(
            'API key not configured. Please add your Google API key in settings.',
          );
        }
        if (!apiKey.startsWith('AI') || apiKey.length <= 20) {
          throw new Error(
            'Invalid API key format. Please check your Google API key in settings.',
          );
        }


        if (initialMessages.length === 0 && messages.length === 1) {
          const firstMessage = messages[0];
          const title = generateChatTitle(firstMessage);
          addNewChatToSidebar(title);
        }

        return {
          body: {
            id,
            message: messages.at(-1),
            selectedChatModel: initialChatModel,
            selectedVisibilityType: visibilityType,
            apiKey: apiKey, // Include user's API key
            ...body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: () => {
      // Update sidebar history immediately for all chats
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      console.error('Chat error:', error);

      if (error instanceof ChatSDKError) {
        toast({
          type: 'error',
          description: error.message,
        });
      } else if (error instanceof Error) {
        // Handle specific error messages
        if (error.message.includes('API key not configured')) {
          toast({
            type: 'error',
            description:
              'Please add your Google API key in settings to continue.',
          });
        } else if (error.message.includes('Invalid API key format')) {
          toast({
            type: 'error',
            description:
              'Invalid API key format. Please check your Google API key in settings.',
          });
        } else {
          toast({
            type: 'error',
            description:
              error.message ||
              'An unexpected error occurred. Please try again.',
          });
        }
      } else {
        toast({
          type: 'error',
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  // Custom fetcher for votes that handles deleted chats gracefully
  const votesFetcher = async (url: string) => {
    try {
      const response = await fetch(url);
      if (response.status === 404) {
        // Chat was deleted, redirect to home page immediately
        window.location.href = '/';
        return [];
      }
      if (!response.ok) {
        const { code, cause } = await response.json();
        throw new ChatSDKError(code as ErrorCode, cause);
      }
      return response.json();
    } catch (error) {
      // If fetch fails (e.g., network error), return empty votes
      return [];
    }
  };

  const { data: votes, error: votesError } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    votesFetcher,
  );

  // Handle votes error - if chat is deleted, redirect immediately
  useEffect(() => {
    if (votesError?.message?.includes('not_found:chat')) {
      window.location.href = '/';
    }
  }, [votesError]);

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      <ChatHeader chatId={id} isReadonly={isReadonly} session={session} />
      <CornerDecoration />
      <div className="fixed top-3 right-3 flex gap-2 z-30">
        <SettingsButton />
        <ThemeToggle />
      </div>
      <div className="flex flex-col min-w-0 flex-1 text-foreground border-t border-l border-[#322028] rounded-xl relative overflow-hidden">
        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          sendMessage={sendMessage}
          selectedVisibilityType={visibilityType}
          session={session}
          selectedModelId={initialChatModel}
        />

        <div className="flex mx-auto px-4 gap-2 w-full md:max-w-3xl bg-background shrink-0 border-t border-[#322028]/20">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              sendMessage={sendMessage}
              selectedVisibilityType={visibilityType}
              selectedModelId={initialChatModel}
              session={session}
            />
          )}
        </div>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
        selectedModelId={initialChatModel}
        session={session}
      />
    </div>
  );
}
