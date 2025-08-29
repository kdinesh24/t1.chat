'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';

import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-center items-center mb-3 mt-4">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span
                className="text-lg font-bold px-2 hover:bg-muted rounded-md cursor-pointer"
                style={{ color: '#e3bad1' }}
              >
                T2.chat
              </span>
            </Link>
          </div>

          {/* New Chat Button - Full Width Purple */}
          <Button
            onClick={() => {
              setOpenMobile(false);
              router.push('/');
              router.refresh();
            }}
            className="mx-2 h-10 text-white font-medium rounded-lg transition-all duration-200 border-0 relative overflow-hidden group new-chat-button"
            style={{
              backgroundColor: '#411329',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            New Chat
          </Button>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
