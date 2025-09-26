import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'chat-model', 
      'chat-model-reasoning'
    ],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [
      'gemini-2.0-flash-exp',
      'gemini-2.5-pro',
      'gemini-1.5-flash',
      'gemini-2.0-flash-reasoning',
      // Backward compatibility
      'chat-model',
      'chat-model-reasoning'
    ],
  },
};
