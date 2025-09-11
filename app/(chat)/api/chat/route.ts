import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import { type RequestHints, systemPrompt } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { createProviderWithApiKey } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import type { ResumableStreamContext } from 'resumable-stream';
// import { after } from 'next/server'; // Not available in this Next.js version
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import type { ChatModel } from '@/lib/ai/models';
import type { VisibilityType } from '@/components/visibility-selector';

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      // Temporarily disable resumable streams due to Next.js compatibility issues
      // globalStreamContext = createResumableStreamContext({
      //   waitUntil: after, // Not available in this Next.js version
      // });
      globalStreamContext = null;
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        // Resumable streams disabled due to missing REDIS_URL
      } else {
        // Error initializing stream context
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (error) {
    console.error('❌ Request parsing failed:', error);
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
      apiKey, // User's API key from the client
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel['id'];
      selectedVisibilityType: VisibilityType;
      apiKey?: string;
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    // Check if user has provided an API key
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            'API key not configured. Please add your Google API key in settings.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      try {
        const title = await generateTitleFromUserMessage({
          message,
        });

        await saveChat({
          id,
          userId: session.user.id,
          title,
          visibility: selectedVisibilityType,
        });
      } catch (error) {
        // Fallback: create chat with a simple title
        const fallbackTitle =
          message.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join(' ')
            .slice(0, 80) || 'New Chat';

        await saveChat({
          id,
          userId: session.user.id,
          title: fallbackTitle,
          visibility: selectedVisibilityType,
        });
      }
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    // Create provider with user's API key
    const userProvider = createProviderWithApiKey(apiKey);

    try {
      const modelInstance = userProvider.languageModel(selectedChatModel);
    } catch (modelError) {
      console.error('❌ Model creation failed:', modelError);
      throw modelError;
    }

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        try {
          const userMessageText = message.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join(' ');

          const result = streamText({
            model: userProvider.languageModel(selectedChatModel),
            system: systemPrompt({
              selectedChatModel,
              requestHints,
              userPrompt: userMessageText,
            }),
            messages: convertToModelMessages(uiMessages),
            stopWhen: stepCountIs(5),
            experimental_activeTools: [],
            experimental_transform: smoothStream({ chunking: 'word' }),
            tools:
              selectedChatModel === 'chat-model-reasoning' ||
              selectedChatModel === 'gemini-2.0-flash-reasoning'
                ? {
                    getWeather,
                    requestSuggestions: requestSuggestions({
                      session,
                      dataStream,
                    }),
                  }
                : {
                    getWeather,
                    createDocument: createDocument({ session, dataStream }),
                    updateDocument: updateDocument({ session, dataStream }),
                    requestSuggestions: requestSuggestions({
                      session,
                      dataStream,
                    }),
                  },
            experimental_telemetry: {
              isEnabled: isProductionEnvironment,
              functionId: 'stream-text',
            },
          });

          // Handle stream consumption with error handling
          try {
            result.consumeStream();
            dataStream.merge(
              result.toUIMessageStream({
                sendReasoning: true,
              }),
            );
          } catch (streamError) {
            console.error('❌ Stream consumption error:', streamError);
            throw streamError;
          }
        } catch (error) {
          console.error('❌ Stream creation error:', error);
          console.error('❌ Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          // Re-throw to be handled by onError
          throw error;
        }
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });
      },
      onError: (error) => {
        console.error('❌ UI Message Stream error:', error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Handle rate limit errors
        if (
          errorMessage.includes('Rate limit reached') ||
          errorMessage.includes('rate_limit_exceeded')
        ) {
          return "I apologize, but I've reached the rate limit for API requests. Please wait a moment and try again, or the request will automatically retry.";
        }

        // Handle network connectivity errors
        if (
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('generativelanguage.googleapis.com')
        ) {
          return "I apologize, but I'm having trouble connecting to the AI service right now. This might be due to a network connectivity issue. Please check your internet connection and try again in a few moments.";
        }

        // Handle generic API errors
        if (errorMessage.includes('Failed after 3 attempts')) {
          return 'I encountered an issue while processing your request. Please try again in a moment.';
        }

        return 'Oops, an error occurred! Please try again.';
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream()),
        ),
      );
    } else {
      return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    }
  } catch (error) {
    console.error('❌ Chat API Error:', error);
    // Check if it's a specific API connection error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('generativelanguage.googleapis.com') ||
      errorMessage.includes('Failed after 3 attempts')
    ) {
      return new Response(
        JSON.stringify({
          error:
            'Network connectivity issue. Please check your internet connection and try again.',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    // Return a generic error for unexpected issues
    return new ChatSDKError('bad_request:api').toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if (!chat) {
    // Return success even if chat doesn't exist to handle race conditions
    return Response.json(
      { id, message: 'Chat already deleted' },
      { status: 200 },
    );
  }

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  try {
    // Perform synchronous deletion to ensure it completes before returning
    await deleteChatById({ id });

    return Response.json(
      { id, message: 'Chat deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Failed to delete chat:', error);
    return Response.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
