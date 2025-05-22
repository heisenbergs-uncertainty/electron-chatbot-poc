/**
 * Configuration options for the RAG system
 */
export interface RAGConfig {
  /**
   * Whether to enable RAG retrieval for this query
   */
  enabled: boolean;

  /**
   * The maximum number of documents to retrieve
   */
  topK: number;

  /**
   * Whether to include metadata in the retrievals
   */
  includeMetadata: boolean;

  /**
   * Any filters to apply to the retrieval
   */
  filter?: Record<string, any>;

  /**
   * How to format the retrieved context (templates, etc)
   */
  formatOptions?: {
    template?: string;
    maxCharsPerDoc?: number;
    hideSource?: boolean;
  };
}

/**
 * Default configuration for RAG retrievals
 */
export const DEFAULT_RAG_CONFIG: RAGConfig = {
  enabled: true,
  topK: 3,
  includeMetadata: true,
  formatOptions: {
    maxCharsPerDoc: 1500,
    hideSource: false,
  },
};

/**
 * Determines if a query should use RAG and with what parameters
 * This allows customizing RAG behavior for different types of queries
 *
 * @param query The user's query text
 * @param selectedChatModel The selected chat model
 * @returns A RAG configuration object
 */
export function getRagConfig(
  query: string,
  selectedChatModel: string,
): RAGConfig {
  // Simple query classification
  const isConversational = /^(hi|hello|hey|what's up|how are you)/i.test(query);
  const isFactual = /(what is|who is|when did|where is|why is|how does)/i.test(
    query,
  );
  const isInstructional =
    /(write|generate|create|build|implement|code|develop)/i.test(query);

  // Customize RAG behavior based on query type
  if (isConversational) {
    // Simple greetings don't need RAG context
    return {
      ...DEFAULT_RAG_CONFIG,
      enabled: false,
    };
  }

  if (isFactual) {
    // Factual queries benefit from more context
    return {
      ...DEFAULT_RAG_CONFIG,
      topK: 5,
    };
  }

  if (isInstructional) {
    // For coding/creation tasks, get more comprehensive context
    return {
      ...DEFAULT_RAG_CONFIG,
      topK: 4,
      formatOptions: {
        ...DEFAULT_RAG_CONFIG.formatOptions,
        maxCharsPerDoc: 2000,
      },
    };
  }

  // For reasoning models, we might want different behavior
  if (selectedChatModel === 'chat-model-reasoning') {
    return {
      ...DEFAULT_RAG_CONFIG,
      includeMetadata: true,
      formatOptions: {
        ...DEFAULT_RAG_CONFIG.formatOptions,
        hideSource: false,
      },
    };
  }

  // Default to the standard config
  return DEFAULT_RAG_CONFIG;
}
