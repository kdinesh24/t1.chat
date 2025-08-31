import { motion } from 'framer-motion';
import { SuggestedActions } from './suggested-actions';
import { CreateIcon, ExploreIcon, CodeIcon, LearnIcon } from './icons';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import type { ChatMessage } from '@/lib/types';

interface GreetingProps {
  chatId?: string;
  sendMessage?: UseChatHelpers<ChatMessage>['sendMessage'];
  selectedVisibilityType?: VisibilityType;
}

export const Greeting = ({
  chatId,
  sendMessage,
  selectedVisibilityType,
}: GreetingProps) => {
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
        className="text-3xl font-semibold text-left mb-8 ml-8"
      >
        How can I help you, Dinesh?
      </motion.div>

      {/* Icon buttons */}
      <div className="flex gap-3 ml-8 mb-4">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.6 }}
          onClick={() => handleSuggestionClick('Create a new project')}
          className="flex items-center gap-2 px-4 py-2 rounded-3xl border transition-all duration-200 hover:text-white disabled:opacity-50"
          style={{
            backgroundColor: '#28222d',
            borderColor: '#2f2836',
            color: 'hsl(270, 30%, 83%)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#362d3d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#28222d';
          }}
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
          className="flex items-center gap-2 px-4 py-2 rounded-3xl border transition-all duration-200 hover:text-white disabled:opacity-50"
          style={{
            backgroundColor: '#28222d',
            borderColor: '#2f2836',
            color: 'hsl(270, 30%, 83%)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#362d3d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#28222d';
          }}
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
          className="flex items-center gap-2 px-4 py-2 rounded-3xl border transition-all duration-200 hover:text-white disabled:opacity-50"
          style={{
            backgroundColor: '#28222d',
            borderColor: '#2f2836',
            color: 'hsl(270, 30%, 83%)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#362d3d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#28222d';
          }}
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
          className="flex items-center gap-2 px-4 py-2 rounded-3xl border transition-all duration-200 hover:text-white disabled:opacity-50"
          style={{
            backgroundColor: '#28222d',
            borderColor: '#2f2836',
            color: 'hsl(270, 30%, 83%)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#362d3d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#28222d';
          }}
          disabled={!chatId || !sendMessage}
        >
          <LearnIcon size={16} />
          <span className="text-sm font-medium">Learn</span>
        </motion.button>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-md ml-8 mt-2">
        {suggestions.map((suggestion, index) => (
          <div key={`suggestion-container-${index}`} className="flex flex-col">
            {index > 0 && (
              <div
                className="h-px mb-1"
                style={{ backgroundColor: '#2a232f' }}
              />
            )}
            <motion.button
              key={`suggestion-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-left transition-colors duration-200 p-2 rounded-lg disabled:opacity-50"
              style={{
                color: 'hsl(270, 30%, 83%)',
                transition: 'background-color 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.backgroundColor = '#2c2532';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'hsl(270, 30%, 83%)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
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
