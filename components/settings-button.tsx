'use client';

import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function SettingsButton() {
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleClick = useCallback(() => {
    router.push('/settings');
  }, [router]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${isCollapsed ? 'rounded-md p-1' : ''}`}
            style={{
              backgroundColor: isCollapsed
                ? 'var(--floating-container-bg)'
                : 'transparent',
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClick}
              className={`h-6 w-6 p-0 transition-colors rounded-md ${
                isCollapsed
                  ? 'floating-sidebar-button border-0'
                  : 'settings-theme-button'
              } ${isCollapsed ? 'sidebar-collapsed' : ''}`}
            >
              <Settings2 className="h-3 w-3 text-[#af1f6e] dark:text-[#e7d0dd]" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 tooltip-light">
          <p className="text-xs">Settings</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
