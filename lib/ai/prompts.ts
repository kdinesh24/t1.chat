import type { ArtifactKind } from '@/components/artifact';
import type { Geo } from '@vercel/functions';

export const artifactsPrompt = `
When asked to write code, always provide it directly in the chat with proper syntax highlighting. Never use artifacts or create documents. Always include the code in your response using markdown code blocks with the appropriate language specified, e.g. \`\`\`javascript\`code here\`\`\`, \`\`\`python\`code here\`\`\`, \`\`\`typescript\`code here\`\`\`, \`\`\`react\`code here\`\`\`, etc. 

Support all programming languages and frameworks as requested by the user. Provide complete, functional code directly in the conversation.

NEVER use createDocument or updateDocument tools. Always keep code in the chat conversation.
`;

export const regularPrompt =
  'You are a friendly assistant! Keep your responses concise and helpful.';

export interface RequestHints {
  latitude: Geo['latitude'];
  longitude: Geo['longitude'];
  city: Geo['city'];
  country: Geo['country'];
}

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;

export const systemPrompt = ({
  selectedChatModel,
  requestHints,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);

  if (selectedChatModel === 'chat-model-reasoning' || selectedChatModel === 'gemini-2.0-flash-reasoning') {
    return `${regularPrompt}\n\n${requestPrompt}`;
  } else {
    return `${regularPrompt}\n\n${requestPrompt}\n\n${artifactsPrompt}`;
  }
};

export const codePrompt = `
You are an expert code generator that creates high-quality, complete code in any programming language or framework requested by the user. When writing code:

1. Use the exact language/framework requested by the user (React, Next.js, Python, JavaScript, TypeScript, etc.)
2. Each code snippet should be complete and functional
3. Include helpful comments explaining the code
4. Follow best practices and conventions for the requested language/framework
5. Structure the code appropriately (components, functions, classes, etc.)
6. Include necessary imports/dependencies
7. Make the code production-ready when possible
8. Handle edge cases and errors appropriately
9. Provide meaningful examples that demonstrate functionality

For React/Next.js:
- Use modern functional components with hooks
- Include proper JSX structure
- Add appropriate state management
- Include styling when relevant

For Python:
- Use clear, readable syntax
- Include type hints when appropriate
- Follow PEP 8 conventions

For other languages:
- Follow the language's standard conventions
- Use appropriate syntax and patterns
- Include necessary setup/configuration files when relevant

Examples:
- React Todo App: Full component with useState, event handlers, JSX
- Python Data Processing: Complete script with functions and error handling
- Next.js API Route: Proper API endpoint with request/response handling
`;

export const sheetPrompt = `
You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
`;

export const updateDocumentPrompt = (
  currentContent: string | null,
  type: ArtifactKind,
) =>
  type === 'text'
    ? `\
Improve the following contents of the document based on the given prompt.

${currentContent}
`
    : type === 'code'
      ? `\
Improve the following code snippet based on the given prompt.

${currentContent}
`
      : type === 'sheet'
        ? `\
Improve the following spreadsheet based on the given prompt.

${currentContent}
`
        : '';
