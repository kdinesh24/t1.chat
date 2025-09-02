'use client';

import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUserSettings } from '@/hooks/use-user-settings';
import {
  SettingsField,
  TraitInput,
  Toggle,
  CharacterCountInput,
  CharacterCountTextarea,
} from '@/components/settings-form-components';
import { Skeleton } from '@/components/ui/skeleton';
import { memo } from 'react';

const SettingsContent = memo(function SettingsContent() {
  const { settings, isLoading, isSaving, lastSaved, updateSetting } =
    useUserSettings();

  const traitOptions = [
    'friendly',
    'witty',
    'concise',
    'curious',
    'empathetic',
    'creative',
    'patient',
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64 bg-[#322028]" />
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-[#322028]" />
            <Skeleton className="h-10 w-full bg-[#322028]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 bg-[#322028]" />
            <Skeleton className="h-10 w-full bg-[#322028]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-56 bg-[#322028]" />
            <Skeleton className="h-10 w-full bg-[#322028]" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-8 w-20 bg-[#322028] rounded-full"
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-72 bg-[#322028]" />
            <Skeleton className="h-32 w-full bg-[#322028]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Customize T3 Chat</h1>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          {isSaving && (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          )}
          {lastSaved && !isSaving && (
            <>
              <Check className="size-4 text-green-500" />
              Saved {lastSaved.toLocaleTimeString()}
            </>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <SettingsField label="What should T3 Chat call you?">
          <CharacterCountInput
            value={settings.name}
            onChange={(value) => updateSetting('name', value)}
            placeholder="Enter your name"
            maxLength={50}
          />
        </SettingsField>

        <SettingsField label="What do you do?">
          <CharacterCountInput
            value={settings.occupation}
            onChange={(value) => updateSetting('occupation', value)}
            placeholder="Engineer, student, etc."
            maxLength={100}
          />
        </SettingsField>

        <SettingsField
          label="What traits should T3 Chat have?"
          description="up to 50 traits, max 100 chars each"
        >
          <TraitInput
            value={settings.traits}
            onChange={(traits) => updateSetting('traits', traits)}
            suggestions={traitOptions}
          />
        </SettingsField>

        <SettingsField label="Anything else T3 Chat should know about you?">
          <CharacterCountTextarea
            value={settings.additionalInfo}
            onChange={(value) => updateSetting('additionalInfo', value)}
            placeholder="Interests, values, or preferences to keep in mind"
            maxLength={3000}
          />
        </SettingsField>

        <div className="pt-8">
          <h2 className="text-xl font-bold text-white mb-6">
            Behavior Options
          </h2>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="max-w-3xl">
                <h3 className="text-white font-medium mb-1">
                  Disable External Link Warning
                </h3>
                <p className="text-sm text-zinc-400">
                  Skip the confirmation dialog when clicking external links.
                  Note: We cannot guarantee the safety of external links, use
                  this option at your own risk.
                </p>
              </div>
              <div className="flex items-center ml-4">
                <Toggle
                  checked={settings.disableExternalLinkWarning}
                  onChange={(checked) =>
                    updateSetting('disableExternalLinkWarning', checked)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Extract name from email
  const getUserName = (email: string | null | undefined): string => {
    if (!email) return 'User';
    const namePart = email.split('@')[0];
    return namePart
      .replace(/[._]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1319] to-[#0f0a0d] text-foreground">
      <div className="flex justify-center ml-32">
        {/* Sidebar */}
        <div className="w-72 min-h-screen p-6">
          {/* Back to Chat Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-white/10 text-white"
            >
              <ArrowLeft className="size-4" />
              Back to Chat
            </Button>
          </div>

          {/* Sign Out Button */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ redirectTo: '/' })}
              className="flex items-center gap-2 hover:bg-white/10 text-white"
            >
              Sign out
            </Button>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center mb-8 mt-16">
            <div className="size-32 rounded-full mb-4 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
              <div className="w-30 h-30 rounded-full bg-gradient-to-br from-green-300 via-blue-400 to-blue-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-1">
              {getUserName(session?.user?.email)}
            </h2>
            <p className="text-zinc-400 mb-2">{session?.user?.email}</p>
            <span className="px-3 py-1 bg-[#322028] rounded-full text-xs text-zinc-300">
              Free Plan
            </span>
          </div>

          {/* Usage Section */}
          <div className="mb-8">
            <h3 className="text-white font-medium mb-2">Message Usage</h3>
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
                ></div>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Feature under development
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl p-8 pt-20">
          {/* Navigation Tabs */}
          <div className="flex gap-6 mb-8 border-b border-[#322028] justify-between items-center my-8">
            <div className="flex gap-6">
              <button className="pb-3 text-zinc-400 hover:text-white">
                Account
              </button>
              <button className="pb-3 border-b-2 border-white text-white font-medium">
                Customization
              </button>
              <button className="pb-3 text-zinc-400 hover:text-white">
                History & Sync
              </button>
              <button className="pb-3 text-zinc-400 hover:text-white">
                Models
              </button>
              <button className="pb-3 text-zinc-400 hover:text-white">
                API Keys
              </button>
              <button className="pb-3 text-zinc-400 hover:text-white">
                Attachments
              </button>
              <button className="pb-3 text-zinc-400 hover:text-white">
                Contact Us
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="pb-3">
              <ThemeToggle />
            </div>
          </div>

          {/* Customization Content */}
          <div className="max-w-3xl mx-auto">
            <SettingsContent />
          </div>
        </div>
      </div>
    </div>
  );
}
