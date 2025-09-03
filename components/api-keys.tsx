'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApiKeys } from '@/hooks/use-api-keys';
import { ExternalLink, CheckCircle } from 'lucide-react';

export function ApiKeys() {
  const { apiKeys, updateApiKey, isValidKey } = useApiKeys();
  const [localKeys, setLocalKeys] = useState({
    google: apiKeys.google || '',
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [successStates, setSuccessStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Sync local keys with api keys when they change
  useEffect(() => {
    setLocalKeys({
      google: apiKeys.google || '',
    });
  }, [apiKeys]);

  // Clear success state when user starts editing
  useEffect(() => {
    if (localKeys.google !== apiKeys.google) {
      setSuccessStates((prev) => ({ ...prev, google: false }));
    }
  }, [localKeys.google, apiKeys.google]);

  const handleSave = async (provider: 'google') => {
    setSaving(provider);
    try {
      await updateApiKey(provider, localKeys[provider]);
      setSuccessStates((prev) => ({ ...prev, [provider]: true }));
      setTimeout(() => setSaving(null), 1000);
    } catch (error) {
      console.error('Failed to save API key:', error);
      setSaving(null);
    }
  };

  const handleInputChange = (provider: 'google', value: string) => {
    setLocalKeys((prev) => ({ ...prev, [provider]: value }));
    // Clear success state when user types
    setSuccessStates((prev) => ({ ...prev, [provider]: false }));
  };

  const isKeyValid = isValidKey('google');
  const hasChanges = localKeys.google !== apiKeys.google;
  const showSaveButton = hasChanges && localKeys.google.length > 0;
  const showSuccessMessage =
    isKeyValid && !hasChanges && apiKeys.google.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
      </div>

      <p className="text-zinc-400 text-sm">
        Use your own API keys to bypass premium credit limits. Keys are stored
        locally in your browser and are never synced.
      </p>

      <div className="space-y-8">
        {/* Google API Key Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <h3 className="text-white font-medium">Google API Key</h3>
          </div>

          <p className="text-sm text-zinc-400">
            Used for the following models:
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-[#322028] rounded-full text-xs text-zinc-300">
              Gemini 2.0 Flash
            </span>
            <span className="px-3 py-1 bg-[#322028] rounded-full text-xs text-zinc-300">
              Gemini 2.5 Pro
            </span>
            <span className="px-3 py-1 bg-[#322028] rounded-full text-xs text-zinc-300">
              Gemini 1.5 Flash
            </span>
            <span className="px-3 py-1 bg-[#322028] rounded-full text-xs text-zinc-300">
              Gemini 2.0 Flash (Reasoning)
            </span>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="AIza..."
              value={localKeys.google}
              onChange={(e) => handleInputChange('google', e.target.value)}
              className="bg-[#322028] border-[#4a404d] text-white placeholder:text-zinc-500 focus:border-[#6b5b73]"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span>Get your API key from</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Google AI Studio
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="flex items-center gap-3">
                {showSuccessMessage && (
                  <div
                    className="flex items-center gap-2 text-sm"
                    style={{ color: '#a4044c' }}
                  >
                    <CheckCircle size={16} />
                    <span>API key configured successfully</span>
                  </div>
                )}

                {showSaveButton && (
                  <Button
                    onClick={() => handleSave('google')}
                    disabled={saving === 'google'}
                    className="bg-[#af1f6e] hover:bg-[#8f1a5a] text-white px-6"
                  >
                    {saving === 'google' ? 'Saving...' : 'Save'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
