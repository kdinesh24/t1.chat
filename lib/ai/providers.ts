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
          'chat-model': groq('openai/gpt-oss-120b'),
          'chat-model-reasoning': wrapLanguageModel({
            model: groq('openai/gpt-oss-120b'),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          }),
          'title-model': google('gemini-2.5-flash'),
          'artifact-model': groq('openai/gpt-oss-120b'),
        },
        // imageModels: {
        //   'small-model': google('gemini-2.5-flash'),
        // },
      });