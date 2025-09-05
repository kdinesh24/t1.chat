'use client';

import { SidebarLeftIcon, PlusIcon } from './icons';
import { Button } from './ui/button';
import { useSidebar } from './ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';

export function FloatingSidebarToggle() {
  const { open, toggleSidebar } = useSidebar();
  const router = useRouter();

  // Only show when sidebar is closed
  if (open) return null;

  return (
    <div
      className="fixed top-4 left-4 z-50 flex gap-1 rounded-md p-1"
      style={{
        backgroundColor: 'var(--floating-container-bg)',
      }}
    >
      {/* Sidebar Toggle Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-testid="floating-sidebar-toggle"
            onClick={toggleSidebar}
            variant="outline"
            size="sm"
            className="size-8 p-0 floating-sidebar-button border-0"
          >
            <SidebarLeftIcon size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="tooltip-light" side="bottom">
          Open Sidebar
        </TooltipContent>
      </Tooltip>

      {/* New Chat Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-testid="floating-new-chat"
            onClick={() => {
              router.push('/');
              router.refresh();
            }}
            variant="outline"
            size="sm"
            className="size-8 p-0 floating-sidebar-button border-0"
          >
            <PlusIcon size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="tooltip-light" side="bottom">
          New Chat
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
