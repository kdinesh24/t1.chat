'use client';

import { Button } from './ui/button';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Textarea } from './ui/textarea';
import { deleteTrailingMessages } from '@/app/(chat)/actions';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessage } from '@/lib/types';
import { getTextFromMessage } from '@/lib/utils';
import { ModelSelector } from './model-selector';
import type { Session } from 'next-auth';
import { PencilOff } from 'lucide-react';
import { ArrowUpIcon } from './icons';

export type MessageEditorProps = {
  message: ChatMessage;
  setMode: Dispatch<SetStateAction<'view' | 'edit'>>;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  session?: Session;
  selectedModelId?: string;
};

export function MessageEditor({
  message,
  setMode,
  setMessages,
  regenerate,
  session,
  selectedModelId,
}: MessageEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [draftContent, setDraftContent] = useState<string>(
    getTextFromMessage(message),
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event.target.value);
    adjustHeight();
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Text area container with embedded controls */}
      <div
        className="relative rounded-xl"
        style={{
          backgroundColor: '#1d171f',
          borderColor: '#29252c',
          border: '1px solid #29252c',
        }}
      >
        <Textarea
          data-testid="message-editor"
          ref={textareaRef}
          className="outline-none overflow-hidden resize-none !text-base rounded-xl w-full !border-0 text-white placeholder:text-zinc-400 pb-14 focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#1d171f] border border-[#29252c]"
          value={draftContent}
          onChange={handleInput}
          placeholder="Edit your message..."
        />

        {/* Bottom controls overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          {/* Model selector on the left */}
          <div className="flex items-center">
            {session && selectedModelId && (
              <ModelSelector
                session={session}
                selectedModelId={selectedModelId}
                className="text-sm bg-transparent border-none hover:bg-zinc-800/50 rounded-md"
              />
            )}
          </div>

          {/* Send button on the right */}
          <div className="flex flex-row gap-2">
            <Button
              data-testid="message-editor-send-button"
              className="border-reflect rounded-md p-1.5 h-fit hover:bg-muted transition-colors mr-2"
              style={{
                backgroundColor:'#372132',
                color: draftContent.trim().length > 0 ? '#b8a8b3' : '#8d808b',
              }}
              disabled={isSubmitting || draftContent.trim().length === 0}
              onClick={async () => {
                setIsSubmitting(true);

                await deleteTrailingMessages({
                  id: message.id,
                });

                setMessages((messages) => {
                  const index = messages.findIndex((m) => m.id === message.id);

                  if (index !== -1) {
                    const updatedMessage: ChatMessage = {
                      ...message,
                      parts: [{ type: 'text', text: draftContent }],
                    };

                    return [...messages.slice(0, index), updatedMessage];
                  }

                  return messages;
                });

                setMode('view');
                regenerate();
              }}
            >
              <ArrowUpIcon size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Cancel button outside */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-zinc-300 hover:bg-zinc-700 hover:text-white border-0"
          onClick={() => {
            setMode('view');
          }}
        >
          <PencilOff className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
