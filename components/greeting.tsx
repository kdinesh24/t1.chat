import { motion } from 'framer-motion';
import { CreateIcon, ExploreIcon, CodeIcon, LearnIcon } from './icons';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import type { ChatMessage } from '@/lib/types';
import type { Session } from 'next-auth';

interface GreetingProps {
  chatId?: string;
  sendMessage?: UseChatHelpers<ChatMessage>['sendMessage'];
  selectedVisibilityType?: VisibilityType;
  session?: Session;
}

export const Greeting = ({
  chatId,
  sendMessage,
  selectedVisibilityType,
  session,
}: GreetingProps) => {
  const getUserDisplayName = () => {
    if (!session?.user) return 'there';

    if (session.user.type === 'guest') {
      return 'there';
    }

    if (session.user.email) {
      const emailPart = session.user.email.split('@')[0];
      // Capitalize first letter and handle common email patterns
      const name = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
      return name;
    }

    return 'there';
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (!chatId || !sendMessage) {
      console.warn('Missing required props for suggestion click');
      return;
    }

    try {
      window.history.replaceState({}, '', `/chat/${chatId}`);
      await sendMessage({
        role: 'user',
        parts: [{ type: 'text', text: suggestion }],
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const suggestions = [
    'How does AI work?',
    'Are black holes real?',
    'How many Rs are in the word "strawberry"?',
    'What is the meaning of life?',
  ];

  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto pt-32 md:pt-40 px-8 w-full flex flex-col"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-semibold text-left mb-8 ml-8 greeting-title"
      >
        How can I help you, {getUserDisplayName()}?
      </motion.div>

      {/* Icon buttons */}
      <div className="flex gap-3 ml-8 mb-4">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.6 }}
          onClick={() => handleSuggestionClick('Create a new project')}
          className="flex items-center gap-2 px-4 py-2 rounded-3xl border transition-all duration-200 hover:text-white disabled:opacity-50 greeting-button"
          disabled={!chatId || !sendMessage}
        >
          <CreateIcon size={16} />
          <span className="text-sm font-medium">Create</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.7 }}
          onClick={() => handleSuggestionClick('Explore existing code')}
          className="flex items-center gap-2 px-4 py-2 rounded-3xl border transition-all duration-200 hover:text-white disabled:opacity-50 greeting-button"
          disabled={!chatId || !sendMessage}
        >
          <ExploreIcon size={16} />
          <span className="text-sm font-medium">Explore</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.8 }}
          onClick={() => handleSuggestionClick('Write code')}
          className="flex items-center gap-2 px-4 py-2 rounded-3xl border transition-all duration-200 hover:text-white disabled:opacity-50 greeting-button"
          disabled={!chatId || !sendMessage}
        >
          <CodeIcon size={16} />
          <span className="text-sm font-medium">Code</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.9 }}
          onClick={() => handleSuggestionClick('Learn something new')}
          className="flex items-center gap-2 px-4 py-2 rounded-3xl border transition-all duration-200 hover:text-white disabled:opacity-50 greeting-button"
          disabled={!chatId || !sendMessage}
        >
          <LearnIcon size={16} />
          <span className="text-sm font-medium">Learn</span>
        </motion.button>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-md ml-8 mt-2">
        {suggestions.map((suggestion, index) => (
          <div key={`suggestion-container-${index}`} className="flex flex-col">
            {/* Use global CSS class for separator - only shows in dark mode */}
            {index > 0 && (
              <div
                className="h-px mb-1 suggestion-separator"
                style={{ backgroundColor: 'var(--separator-color)' }}
              />
            )}
            <motion.button
              key={`suggestion-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-left text-sm transition-colors duration-200 p-2 rounded-lg disabled:opacity-50 suggestion-text hover:bg-[#f8f0f8] dark:hover:bg-[#2c2532]"
              disabled={!chatId || !sendMessage}
            >
              {suggestion}
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
};
