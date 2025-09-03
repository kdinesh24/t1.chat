'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import type { Session } from 'next-auth';
import { useApiKeys } from '@/hooks/use-api-keys';

export function ModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: Session;
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);
  const {
    hasValidApiKey,
    isClient,
    getApiKey,
    hasApiKey: hasApiKeyFn,
  } = useApiKeys();

  const userType = session.user.type;
  const { availableChatModelIds } = entitlementsByUserType[userType];

  const availableChatModels = chatModels.filter((chatModel) =>
    availableChatModelIds.includes(chatModel.id),
  );

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId,
      ),
    [optimisticModelId, availableChatModels],
  );

  // Prevent hydration mismatch by using consistent server/client state
  const hasApiKey = isClient ? hasValidApiKey() : false;
  const buttonText =
    isClient && hasApiKey
      ? selectedChatModel?.name
      : 'Add your API key in settings';
  const isButtonDisabled = isClient ? !hasApiKey : true;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="model-selector"
          variant="ghost"
          className={cn(
            'md:px-2 md:h-[34px] hover:bg-[#332c38] border-none',
            hasApiKey ? 'text-[#e0cad7]' : 'text-[#786e81]',
          )}
          style={{ backgroundColor: '#2a232f' }}
          disabled={isButtonDisabled}
        >
          {buttonText}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[300px] bg-[#0e080d]/80 backdrop-blur-sm border-[#1e1922] text-[#e0cad7]"
      >
        {hasApiKey ? (
          availableChatModels.map((chatModel) => {
            const { id } = chatModel;

            return (
              <DropdownMenuItem
                data-testid={`model-selector-item-${id}`}
                key={id}
                onSelect={() => {
                  setOpen(false);

                  startTransition(() => {
                    setOptimisticModelId(id);
                    saveChatModelAsCookie(id);
                  });
                }}
                data-active={id === optimisticModelId}
                asChild
              >
                <button
                  type="button"
                  className="gap-4 group/item flex flex-row justify-between items-center w-full"
                >
                  <div className="flex items-center gap-2">
                    <span>{chatModel.name}</span>
                  </div>

                  <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                    <CheckCircleFillIcon />
                  </div>
                </button>
              </DropdownMenuItem>
            );
          })
        ) : (
          <DropdownMenuItem disabled>
            <div className="text-zinc-400 p-2 text-center w-full">
              Please add your Google API key in settings to use the models
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
