'use client';

import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const handleClick = useCallback(() => {
    router.push('/settings');
  }, [router]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className="h-6 w-6 p-0 hover:bg-white/10 transition-colors rounded-md"
          >
            <Settings2 className="h-3 w-3" style={{ color: '#e7d0dd' }} />
            <span className="sr-only">Settings</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1">
          <p className="text-xs">Settings</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
