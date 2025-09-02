'use client';

import { Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SettingsButton() {
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/settings')}
            className={`h-6 w-6 p-0 hover:bg-white/10 transition-colors rounded-md`}
            style={{
              backgroundColor: isCollapsed ? '#211c26' : undefined,
            }}
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
