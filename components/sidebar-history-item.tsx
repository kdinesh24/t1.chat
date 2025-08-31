import type { Chat } from '@/lib/db/schema';
import { SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  CheckCircleFillIcon,
  GlobeIcon,
  LockIcon,
  ShareIcon,
  TrashIcon,
} from './icons';
import { memo, useState } from 'react';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { cn } from '@/lib/utils';

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibilityType: chat.visibility,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(chat.id);
  };

  return (
    <SidebarMenuItem className="group/menu-item relative">
      <div className="group/hover-container relative">
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={cn(
            'transition-all duration-200 ease-out',
            'group-hover/hover-container:!bg-[#251922] hover:!bg-[#251922]',
            (isActive || isDropdownOpen) && '!bg-[#251922]',
            '!text-white hover:!text-white',
          )}
        >
          <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
            <span className="truncate">{chat.title}</span>
          </Link>
        </SidebarMenuButton>

        {/* Background overlay for icons - solid background */}
        <div
          className={cn(
            'absolute right-0 top-0 h-full w-16 rounded-r-md pointer-events-none',
            'transition-all duration-200 ease-out',
            'opacity-0 group-hover/hover-container:opacity-100',
            'bg-[#251922]',
            isDropdownOpen && 'opacity-100',
          )}
        />

        {/* Left curved shadow fade effect - subtle C shape like reference */}
        <div
          className={cn(
            'absolute right-16 top-0 h-full w-20 pointer-events-none',
            'transition-all duration-200 ease-out',
            'opacity-0 group-hover/hover-container:opacity-100',
            isDropdownOpen && 'opacity-100',
          )}
          style={{
            background: `radial-gradient(ellipse 80px 120px at 100% 50%, 
              rgba(37, 25, 34, 0.80) 0%, 
              rgba(37, 25, 34, 0.60) 45%, 
              rgba(37, 25, 34, 0.30) 75%, 
              transparent 100%)`,
          }}
        />

        {/* Action buttons container - faster animations */}
        <div
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10',
            'transition-all duration-100 ease-out',
            'opacity-0 translate-x-3 scale-90',
            'group-hover/hover-container:opacity-100 group-hover/hover-container:translate-x-0 group-hover/hover-container:scale-100',
            isDropdownOpen && 'opacity-100 translate-x-0 scale-100',
          )}
        >
          {/* Share button with dropdown */}
          <DropdownMenu modal={true} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded',
                  'text-[#dfc9d6] hover:text-[#dfc9d6]/80',
                  'hover:!bg-[#251922] transition-all duration-150',
                  'focus:outline-none focus:ring-1 focus:ring-[#dfc9d6]/30',
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <ShareIcon size={12} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="bottom"
              align="end"
              className="shadow-xl border"
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <ShareIcon />
                  <span>Share</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      className="cursor-pointer flex-row justify-between"
                      onClick={() => {
                        setVisibilityType('private');
                      }}
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <LockIcon size={12} />
                        <span>Private</span>
                      </div>
                      {visibilityType === 'private' ? (
                        <CheckCircleFillIcon />
                      ) : null}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer flex-row justify-between"
                      onClick={() => {
                        setVisibilityType('public');
                      }}
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <GlobeIcon />
                        <span>Public</span>
                      </div>
                      {visibilityType === 'public' ? (
                        <CheckCircleFillIcon />
                      ) : null}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete button */}
          <button
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded',
              'text-[#dfc9d6] hover:text-[#dfc9d6]/80',
              'hover:!bg-[#251922] transition-all duration-150',
              'focus:outline-none focus:ring-1 focus:ring-[#dfc9d6]/30',
            )}
            onClick={handleDeleteClick}
          >
            <TrashIcon size={12} />
          </button>
        </div>

        {/* Invisible hover area that extends to cover potential gaps */}
        <div className="absolute inset-0 w-full h-full pointer-events-none" />
      </div>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});
