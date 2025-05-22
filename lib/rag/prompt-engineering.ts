import {
  retrieveContext,
  formatRetrievedContext,
  type RetrievalOptions,
} from './ragie-client';
import type { RequestHints } from '../ai/prompts';
import type { UIMessage } from 'ai';
import { getRagConfig } from './config';

/**
 * Extracts the text from a user message, handling different message formats
 * @param message The user message
 * @returns Text content from the message
 */
function extractQueryFromMessage(message: UIMessage): string {
  if (typeof message.content === 'string') {
    return message.content;
  }

  if (message.parts) {
    // Find text parts in the message
    const textParts = message.parts.filter((part) => part.type === 'text');
    if (textParts.length > 0) {
      return textParts.map((part) => part.text).join(' ');
    }
  }

  return '';
}

/**
 * Enhances the system prompt with retrieved context from the RAG system
 * @param systemPromptText The original system prompt
 * @param messages The conversation history
 * @param requestHints Additional hints about the request
 * @returns An enhanced system prompt with RAG context
 */
export async function enhancePromptWithRAG(
  systemPromptText: string,
  messages: UIMessage[],
  requestHints: RequestHints,
  selectedChatModel = 'chat-model',
): Promise<string> {
  // Get the most recent user message
  const userMessage = messages.filter((msg) => msg.role === 'user').pop();

  if (!userMessage) {
    return systemPromptText;
  }

  // Extract query text from the message
  const queryText = extractQueryFromMessage(userMessage);

  if (!queryText) {
    return systemPromptText;
  }

  // Get RAG configuration for this query type
  const ragConfig = getRagConfig(queryText, selectedChatModel);

  // If RAG is disabled for this query type, return the original prompt
  if (!ragConfig.enabled) {
    return systemPromptText;
  }

  // Prepare retrieval options based on config
  const retrievalOptions: RetrievalOptions = {
    query: queryText,
    topK: ragConfig.topK,
    filter: ragConfig.filter,
    includeMetadata: ragConfig.includeMetadata,
  };

  // Retrieve context based on the user's query
  const retrievedResults = await retrieveContext(retrievalOptions);

  // If no results were returned, return the original prompt
  if (!retrievedResults || retrievedResults.length === 0) {
    return systemPromptText;
  }

  // Format the retrieved context
  const formattedContext = formatRetrievedContext(retrievedResults);

  if (!formattedContext) {
    return systemPromptText;
  }

  // Import advanced prompting techniques
  const { createEnhancedRAGPrompt } = await import('./advanced-prompting');

  // Create an enhanced prompt using advanced techniques
  const enhancedPrompt = createEnhancedRAGPrompt(
    systemPromptText,
    queryText,
    formattedContext,
  );

  return enhancedPrompt;
}
