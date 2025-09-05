'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

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
              onClick={() =>
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
              }
              className={`h-6 w-6 p-0 transition-colors rounded-md ${
                isCollapsed
                  ? 'floating-sidebar-button border-0'
                  : 'settings-theme-button'
              } ${isCollapsed ? 'sidebar-collapsed' : ''}`}
            >
              {/* Sun icon - visible in dark mode */}
              <Sun
                className="h-3 w-3 transition-all dark:rotate-0 dark:scale-100 rotate-90 scale-0"
                style={{ color: '#e7d0dd' }}
              />
              {/* Moon icon - visible in light mode */}
              <Moon
                className="absolute h-3 w-3 transition-all dark:rotate-90 dark:scale-0 rotate-0 scale-100"
                style={{ color: '#af1f6e' }}
              />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 tooltip-light">
          <p className="text-xs">Theme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
