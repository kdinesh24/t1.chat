'use client';

import { ChevronUp } from 'lucide-react';
import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { toast } from './toast';
import { LoaderIcon, GlobeIcon, LockIcon } from './icons';
import { guestRegex } from '@/lib/constants';
import { useChatVisibility } from '@/hooks/use-chat-visibility';

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const params = useParams();

  const isGuest = guestRegex.test(data?.user?.email ?? '');

  const chatId = typeof params?.id === 'string' ? params.id : null;

  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chatId || '',
    initialVisibilityType: 'private',
  });

  const showVisibilityControls = chatId && !isGuest;

  const getUserName = (email: string | null | undefined): string => {
    if (!email) return 'User';
    if (isGuest) return 'Guest';

    const namePart = email.split('@')[0];
    // Replace dots and underscores with spaces, then capitalize each word
    return namePart
      .replace(/[._]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="h-[60px]">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {status === 'loading' ? (
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12 justify-between hover:bg-white/50 rounded-lg bg-[#ecd4ee] dark:bg-[#1a2929]">
                  <div className="flex flex-row gap-3 items-center">
                    <div className="size-8 rounded-full animate-pulse bg-[#ecd4ee] dark:bg-[#1a2929]" />
                    <div className="flex flex-col">
                      <span className="bg-background text-transparent rounded-md animate-pulse text-sm font-medium">
                        Loading...
                      </span>
                      <span className="bg-background text-transparent rounded-md animate-pulse text-xs">
                        Free
                      </span>
                    </div>
                  </div>
                  <div className="animate-spin text-zinc-500">
                    <LoaderIcon />
                  </div>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  data-testid="user-nav-button"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12 hover:bg-white/50 rounded-lg bg-[#ecd4ee] dark:bg-[#1a2929]"
                >
                  <div className="flex flex-row gap-3 items-center">
                    <Image
                      src={`https://avatar.vercel.sh/${user.email}`}
                      alt={user.email ?? 'User Avatar'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="flex flex-col text-left">
                      <span
                        data-testid="user-name"
                        className="truncate text-sm font-semibold text-[#602b62] dark:text-white"
                      >
                        {getUserName(user?.email)}
                      </span>
                      <span className="text-xs text-zinc-400">Free</span>
                    </div>
                  </div>
                  <ChevronUp className="ml-auto text-zinc-400" />
                </SidebarMenuButton>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              data-testid="user-nav-menu"
              side="top"
              className="w-[--radix-popper-anchor-width]"
            >
              {showVisibilityControls && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onSelect={() => setVisibilityType('private')}
                  >
                    <LockIcon />
                    <div className="flex flex-col">
                      <span>Private</span>
                      <span className="text-xs text-muted-foreground">
                        Only you can access this chat
                      </span>
                    </div>
                    {visibilityType === 'private' && (
                      <span className="ml-auto">✓</span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onSelect={() => setVisibilityType('public')}
                  >
                    <GlobeIcon />
                    <div className="flex flex-col">
                      <span>Public</span>
                      <span className="text-xs text-muted-foreground">
                        Anyone with the link can access this chat
                      </span>
                    </div>
                    {visibilityType === 'public' && (
                      <span className="ml-auto">✓</span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild data-testid="user-nav-item-auth">
                <button
                  type="button"
                  className="w-full cursor-pointer"
                  onClick={() => {
                    if (status === 'loading') {
                      toast({
                        type: 'error',
                        description:
                          'Checking authentication status, please try again!',
                      });

                      return;
                    }

                    if (isGuest) {
                      router.push('/login');
                    } else {
                      signOut({
                        redirectTo: '/',
                      });
                    }
                  }}
                >
                  {isGuest ? 'Login to your account' : 'Sign out'}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
