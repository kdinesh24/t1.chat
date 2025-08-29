import {
    customProvider,
    extractReasoningMiddleware,
    wrapLanguageModel,
  } from 'ai';
  import { google } from '@ai-sdk/google';
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
          // New Gemini models
          'gemini-2.0-flash-exp': google('gemini-2.0-flash-exp'),
          'gemini-2.5-pro': google('gemini-2.5-pro'),
          'gemini-1.5-flash': google('gemini-1.5-flash'),
          'gemini-2.0-flash-reasoning': wrapLanguageModel({
            model: google('gemini-2.0-flash-exp'),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          }),
          // Backward compatibility
          'chat-model': google('gemini-2.0-flash-exp'),
          'chat-model-reasoning': wrapLanguageModel({
            model: google('gemini-2.0-flash-exp'),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          }),
          'title-model': google('gemini-2.0-flash-exp'),
          'artifact-model': google('gemini-2.0-flash-exp'),
        },
      });