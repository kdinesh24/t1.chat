import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface UserSettings {
  name: string;
  occupation: string;
  traits: string[];
  additionalInfo: string;
  disableExternalLinkWarning: boolean;
}

export function useUserSettings() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    occupation: '',
    traits: [],
    additionalInfo: '',
    disableExternalLinkWarning: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadSettings();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const loadSettings = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          name: data.name || '',
          occupation: data.occupation || '',
          traits: data.traits || [],
          additionalInfo: data.additionalInfo || '',
          disableExternalLinkWarning: data.disableExternalLinkWarning || false,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!session?.user?.id) return;

    try {
      setIsSaving(true);
      const updatedSettings = { ...settings, ...newSettings };

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      if (response.ok) {
        setSettings(updatedSettings);
        setLastSaved(new Date());
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Debounced auto-save after 1 second
    if (typeof window !== 'undefined') {
      clearTimeout((window as any).settingsTimeout);
      (window as any).settingsTimeout = setTimeout(() => {
        saveSettings({ [key]: value });
      }, 1000);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    lastSaved,
    updateSetting,
    saveSettings,
    loadSettings,
  };
}
