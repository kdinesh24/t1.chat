'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';

import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { SidebarToggle } from '@/components/sidebar-toggle';
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
          <div className="flex flex-row items-center mb-3 mt-2">
            <SidebarToggle />
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center ml-12"
            >
              <span className="text-lg font-bold px-2 rounded-md cursor-pointer t1-chat-text">
                T1.chat
              </span>
            </Link>
          </div>

          {/* New Chat Button - Full Width Purple */}
          <div className="mx-2">
            <div className="p-[1.1px] rounded-[10px] custom-gradient transition-colors duration-200 w-[225px]">
              <button
                type="button"
                onClick={() => {
                  setOpenMobile(false);
                  router.push('/');
                  router.refresh();
                }}
                className="bg-[#a4406c] hover:bg-[#d76a9d] dark:bg-gradient-to-b dark:from-[#3c1126] dark:via-[#401329]/90 dark:to-[#3c1126] dark:hover:bg-gradient-to-b dark:hover:from-[#7a1941] dark:hover:via-[#7a1941] dark:hover:to-[#7a1941] text-white dark:text-[#e7b7d0] text-sm font-medium rounded-[10px] transition-colors duration-200 cursor-pointer w-full h-[32px] flex items-center justify-center"
              >
                New Chat
              </button>
            </div>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
