'use client';

import type { UIMessage } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import { PaperclipIcon, ChevronDown } from 'lucide-react';
import { ArrowUpIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ModelSelector } from './model-selector';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import type { VisibilityType } from './visibility-selector';
import type { Attachment, ChatMessage } from '@/lib/types';
import type { Session } from 'next-auth';
import { useApiKeys } from '@/hooks/use-api-keys';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedVisibilityType,
  selectedModelId,
  session,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  className?: string;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
  session: Session;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const {
    apiKeys,
    hasValidApiKey,
    isClient,
    getApiKey,
    hasApiKey: hasApiKeyFn,
  } = useApiKeys();

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

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '120px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    console.log('📤 Submitting message:', input);
    window.history.replaceState({}, '', `/chat/${chatId}`);

    sendMessage({
      role: 'user',
      parts: [
        ...attachments.map((attachment) => ({
          type: 'file' as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: 'text',
          text: input,
        },
      ],
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();
    setInput('');

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    sendMessage,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  // Prevent hydration mismatch by using consistent server/client state
  const hasApiKey = isClient ? hasValidApiKey() : false;
  const placeholderText =
    isClient && hasApiKey
      ? 'Send a message...'
      : 'Add your API key in settings to start chatting';
  const isInputDisabled = isClient ? !hasApiKey : true;
  const shouldAutoFocus = isClient ? hasApiKey : false;

  return (
    <div className="relative w-full flex flex-col gap-4">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute left-[40%] bottom-32 -translate-x-1/2 z-50"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              variant="outline"
              size="sm"
              className="scroll-to-bottom-btn flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <span>Scroll to bottom</span>
              <ChevronDown size={12} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row gap-2 overflow-x-scroll items-end"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <Textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder={placeholderText}
        value={input}
        onChange={handleInput}
        disabled={isInputDisabled}
        className={cx(
          'min-h-[70px] max-h-[calc(80dvh)] overflow-hidden resize-none rounded-t-2xl !text-base pt-4 px-4 border-t-8 border-l-8 border-r-8 border-[#fae0fc] dark:border-[#261f2a] shadow-sm bg-[#faf5fa] dark:bg-[#2a232f] w-full focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 selection:bg-[#efbdeb] dark:selection:bg-[#3d334a] selection:text-black dark:selection:text-white',
          hasApiKey
            ? 'placeholder:text-[#8b5a8f] dark:placeholder:text-[#786e81] text-black dark:text-white'
            : 'placeholder:text-[#a59ba8] dark:placeholder:text-[#5a5461] text-[#a59ba8] dark:text-[#5a5461] cursor-not-allowed',
          className,
        )}
        rows={4}
        autoFocus={shouldAutoFocus}
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();

            if (!hasApiKey) {
              toast.error('Please add your Google API key in settings first!');
              return;
            }

            if (status !== 'ready') {
              console.log('⚠️ Model not ready, current status:', status);
              toast.error('Please wait for the model to finish its response!');
            } else {
              console.log('✅ Submitting form via enter key');
              submitForm();
            }
          }
        }}
      />

      <div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start gap-1 ml-3">
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          className="h-8 text-sm px-3"
        />
        <AttachmentsButton fileInputRef={fileInputRef} status={status} />
      </div>

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {status === 'submitted' ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            uploadQueue={uploadQueue}
            hasValidApiKey={() => hasApiKey}
          />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;
    if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;

    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<ChatMessage>['status'];
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="rounded-lg p-[7px] h-fit border border-[#fae0fc] dark:border-[#302a37] bg-[#faf5fa] dark:bg-[#28222e] hover:bg-[#f5edf6] dark:hover:bg-white/50 transition-colors"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== 'ready'}
      variant="ghost"
    >
      <PaperclipIcon size={14} className="text-[#ac1668] dark:text-[#e7d0dd]" />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="border-reflect rounded-md p-1.5 h-fit hover:bg-muted transition-colors mr-2 bg-[#ce98b1] dark:bg-[#372132] text-white dark:text-[#8d808b]"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
  hasValidApiKey,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
  hasValidApiKey: () => boolean;
}) {
  const isDisabled =
    input.length === 0 || uploadQueue.length > 0 || !hasValidApiKey();

  return (
    <Button
      data-testid="send-button"
      className="border-reflect rounded-md p-1.5 h-fit hover:bg-muted transition-colors mr-2 bg-[#ce98b1] dark:bg-[#372132] text-white dark:text-[#8d808b]"
      onClick={(event) => {
        event.preventDefault();

        if (!hasValidApiKey()) {
          return; // Don't submit if no API key
        }

        console.log(
          '🔘 Send button clicked, input length:',
          input.length,
          'uploadQueue length:',
          uploadQueue.length,
        );
        submitForm();
      }}
      disabled={isDisabled}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.hasValidApiKey() !== nextProps.hasValidApiKey()) return false;
  return true;
});
