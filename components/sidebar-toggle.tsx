import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

import { SidebarLeftIcon } from './icons';
import { Button } from './ui/button';

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Button
      data-testid="sidebar-toggle-button"
      onClick={toggleSidebar}
      variant="ghost"
      className="md:px-2 md:h-fit sidebar-toggle-button border-0"
    >
      <SidebarLeftIcon size={16} />
    </Button>
  );
}
