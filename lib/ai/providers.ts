import {
    customProvider,
    extractReasoningMiddleware,
    wrapLanguageModel,
  } from 'ai';
  import { google } from '@ai-sdk/google';
  import { groq } from '@ai-sdk/groq';
  import {
    artifactModel,
    chatModel,
    reasoningModel,
    titleModel,
  } from './models.test';
  import { isTestEnvironment } from '../constants';
  
  export const myProvider = isTestEnvironment
    ? customProvider({
        languageModels: {
          'chat-model': chatModel,
          'chat-model-reasoning': reasoningModel,
          'title-model': titleModel,
          'artifact-model': artifactModel,
        },
      })
    : customProvider({
        languageModels: {
          'chat-model': groq('llama-3.3-70b-versatile'),
          'chat-model-reasoning': wrapLanguageModel({
            model: groq('llama-3.3-70b-versatile'),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          }),
          'title-model': groq('llama-3.3-70b-versatile'), // Changed from google to groq for better reliability
          'artifact-model': groq('llama-3.3-70b-versatile'),
        },
        // imageModels: {
        //   'small-model': google('gemini-2.5-flash'),
        // },
      });