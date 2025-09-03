'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';

interface ApiKeys {
  google: string;
}

const DEFAULT_API_KEYS: ApiKeys = {
  google: '',
};

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>(
    'api-keys',
    DEFAULT_API_KEYS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsLoading(false);
  }, []);

  const updateApiKey = useCallback(
    async (provider: keyof ApiKeys, key: string) => {
      setApiKeys((prev) => ({
        ...prev,
        [provider]: key,
      }));
    },
    [setApiKeys],
  );

  const isValidKey = useCallback(
    (provider: keyof ApiKeys): boolean => {
      if (!isClient) return false;
      const key = apiKeys[provider];
      if (!key) return false;

      switch (provider) {
        case 'google':
          return key.startsWith('AI') && key.length > 20;
        default:
          return false;
      }
    },
    [apiKeys, isClient],
  );

  const hasValidApiKey = useCallback((): boolean => {
    if (!isClient) return false;
    return isValidKey('google');
  }, [isValidKey, isClient]);

  // Helper function to get API key value directly for use in API calls
  const getApiKey = useCallback(
    (provider: keyof ApiKeys): string => {
      return apiKeys[provider] || '';
    },
    [apiKeys],
  );

  // Helper function to check if API key exists (useful for UI logic)
  const hasApiKey = useCallback(
    (provider: keyof ApiKeys): boolean => {
      const key = apiKeys[provider];
      return !!(key && key.trim().length > 0);
    },
    [apiKeys],
  );

  return {
    apiKeys,
    updateApiKey,
    isValidKey,
    hasValidApiKey,
    isLoading,
    isClient,
    getApiKey,
    hasApiKey,
  };
}
