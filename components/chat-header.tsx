'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import type { Session } from 'next-auth';

function PureChatHeader({
  chatId,
  isReadonly,
  session,
}: {
  chatId: string;
  isReadonly: boolean;
  session: Session;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

 
  if (!open) return null;

  return (
    <header className="flex sticky top-0 py-1.5 items-center px-2 md:px-2 gap-2 bg-[#1a1419] z-50">
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, () => true);
