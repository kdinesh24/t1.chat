'use client';

import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { ApiKeys } from '@/components/api-keys';
import { useState, useCallback, memo, useEffect } from 'react';
import Link from 'next/link';

type TabType =
  | 'account'
  | 'customization'
  | 'history'
  | 'models'
  | 'apiKeys'
  | 'attachments'
  | 'contact';

const UnderDevelopment = memo(({ title }: { title: string }) => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
    </div>
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-xl font-semibold text-white mb-2">
        Under Development
      </h2>
      <p className="text-zinc-400 text-center max-w-md">
        This feature is currently being developed. Check back soon for updates!
      </p>
    </div>
  </div>
));

UnderDevelopment.displayName = 'UnderDevelopment';

const CustomizationContent = memo(() => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-white">Customization</h1>
    </div>
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-6xl mb-4">🎨</div>
      <h2 className="text-xl font-semibold text-white mb-2">
        Customization Options
      </h2>
      <p className="text-zinc-400 text-center max-w-md">
        Personalization features will be available here soon. Stay tuned!
      </p>
    </div>
  </div>
));

CustomizationContent.displayName = 'CustomizationContent';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('customization');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push(
        `/api/auth/guest?redirectUrl=${encodeURIComponent(window.location.href)}`,
      );
      return;
    }
  }, [session, status, router]);

  // Memoized navigation handlers for better performance
  const handleSignOut = useCallback(() => {
    signOut({ redirectTo: '/' });
  }, []);

  const handleThemeToggle = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [setTheme, resolvedTheme]);

  const handleTabChange = useCallback((tabId: TabType) => {
    setActiveTab(tabId);
  }, []);

  // Extract name from email
  const getUserName = useCallback(
    (email: string | null | undefined): string => {
      if (!email) return 'User';
      const namePart = email.split('@')[0];
      return namePart
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
    },
    [],
  );

  const SimpleThemeToggle = memo(() => (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleThemeToggle}
      className="h-6 w-6 p-0 hover:bg-white/10 transition-colors rounded-md"
    >
      <Sun
        className="h-3 w-3 transition-all dark:rotate-0 dark:scale-100 rotate-90 scale-0"
        style={{ color: '#e7d0dd' }}
      />
      <Moon
        className="absolute h-3 w-3 transition-all dark:rotate-90 dark:scale-0 rotate-0 scale-100"
        style={{ color: '#af1f6e' }}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  ));

  SimpleThemeToggle.displayName = 'SimpleThemeToggle';

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'account':
        return <UnderDevelopment title="Account" />;
      case 'customization':
        return <CustomizationContent />;
      case 'history':
        return <UnderDevelopment title="History & Sync" />;
      case 'models':
        return <UnderDevelopment title="Models" />;
      case 'apiKeys':
        return <ApiKeys />;
      case 'attachments':
        return <UnderDevelopment title="Attachments" />;
      case 'contact':
        return <UnderDevelopment title="Contact Us" />;
      default:
        return <CustomizationContent />;
    }
  }, [activeTab]);

  // Don't render anything while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#211b21] to-[#0f0a0d] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen)
  if (!session) {
    return null;
  }

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'customization', label: 'Customization' },
    { id: 'history', label: 'History & Sync' },
    { id: 'models', label: 'Models' },
    { id: 'apiKeys', label: 'API Keys' },
    { id: 'attachments', label: 'Attachments' },
    { id: 'contact', label: 'Contact Us' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#211b21] to-[#0f0a0d] text-foreground">
      <div className="flex justify-center">
        {/* Sidebar */}
        <div className="w-72 min-h-screen p-6 flex flex-col">
          {/* Back to Chat Button */}
          <div className="mb-8">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 hover:bg-white/10 text-white"
              >
                <ArrowLeft className="size-4" />
                Back to Chat
              </Button>
            </Link>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center mb-12">
            <div className="size-32 rounded-full mb-6 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
              <div className="w-30 h-30 rounded-full bg-gradient-to-br from-green-300 via-blue-400 to-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {getUserName(session?.user?.email)}
            </h2>
            <p className="text-zinc-400 mb-3">{session?.user?.email}</p>
            <span className="px-3 py-1 bg-[#322028] rounded-full text-xs text-zinc-300">
              {session?.user?.type === 'guest' ? 'Guest' : 'Free Plan'}
            </span>
          </div>

          {/* Usage Section */}
          <div className="mb-8">
            <h3 className="text-white font-medium mb-3">Message Usage</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Resets tomorrow at 5:29 AM
            </p>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Under Progress</span>
                <span className="text-white">--/--</span>
              </div>
              <div className="w-full bg-[#322028] rounded-full h-2 mb-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full animate-pulse"
                  style={{ width: '0%' }}
                />
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Feature under development
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl p-8 pt-20 relative">
          {/* Top Right Controls */}
          <div className="absolute top-6 right-8 flex items-center gap-3">
            <SimpleThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2 hover:bg-white/10 text-white"
            >
              Sign out
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 mb-12 bg-[#1a1319] p-1 rounded-lg max-w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#322028] text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-[#2a1d26]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-3xl mx-auto">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
