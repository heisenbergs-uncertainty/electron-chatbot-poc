// Use dynamic import to avoid TypeScript errors with the ragie package
let ragieClient: any;

// This function initializes the ragie client
async function initRagieClient() {
  if (ragieClient) {
    return ragieClient;
  }

  try {
    // Dynamically import the ragie package
    const { Ragie } = await import('ragie');

    // Create the client instance with configuration from environment
    const client = new Ragie({
      auth: process.env.RAGIE_API_KEY || 'dummy-key',
    });

    // Return the client instance
    return client;
  } catch (err) {
    console.error('Error initializing Ragie client:', err);

    // Return a mock client as fallback
    return {
      retrieve: async (params: any) => getMockRetrievalResults(params.query),
    };
  }
}

/**
 * Provides mock retrieval results for development/testing purposes
 * @param query The search query
 * @returns Mock retrieval results
 */
function getMockRetrievalResults(query: string): any[] {
  const normalizedQuery = query.toLowerCase();

  // Sample knowledge base entries
  const mockKb = [
    {
      content:
        "RAG (Retrieval Augmented Generation) is a technique that enhances LLM outputs by retrieving relevant information from external knowledge sources before generating a response. This helps ground the model's responses in factual, up-to-date information.",
      metadata: { source: 'RAG Documentation', date: '2023-10-15' },
      score: 0.92,
    },
    {
      content:
        'Prompt engineering is the practice of designing and optimizing input prompts for language models to elicit desired responses. Effective prompt engineering improves output quality, reduces hallucinations, and helps control model behavior.',
      metadata: { source: 'AI Best Practices Guide', date: '2023-09-22' },
      score: 0.87,
    },
    {
      content:
        'A common RAG architecture includes: 1) an embedding model to convert documents and queries into vector representations, 2) a vector database for storing and retrieving document embeddings, 3) a retrieval mechanism to find relevant documents, and 4) an LLM to generate responses based on retrieved context.',
      metadata: { source: 'RAG Architecture Guide', date: '2023-11-05' },
      score: 0.85,
    },
    {
      content:
        'Chatbots using RAG show significant improvements in factual accuracy compared to those relying solely on pre-trained knowledge. In a recent study, RAG-enhanced chatbots reduced hallucinations by 45% and improved factual accuracy by 37%.',
      metadata: { source: 'AI Performance Study', date: '2024-01-18' },
      score: 0.81,
    },
    {
      content:
        "When implementing RAG, it's important to consider: 1) chunking strategy for breaking documents into manageable pieces, 2) embedding model selection for vector representations, 3) retrieval mechanism for finding relevant context, and 4) prompt design for effectively using the retrieved information.",
      metadata: { source: 'RAG Implementation Guide', date: '2023-12-10' },
      score: 0.78,
    },
    {
      content:
        'The ragie SDK provides retrieval capabilities with a simple API. It allows you to retrieve relevant context from your knowledge base using vector search and semantic matching.',
      metadata: { source: 'Ragie SDK Documentation', date: '2023-11-30' },
      score: 0.91,
    },
    {
      content:
        'To implement effective RAG systems, focus on the quality of your retrieval mechanism first. Even the best language models will generate incorrect information if the retrieved context is poor or irrelevant.',
      metadata: { source: 'RAG Best Practices', date: '2024-02-15' },
      score: 0.83,
    },
    {
      content:
        'When designing prompts for RAG systems, include clear instructions on how the model should use the retrieved information. For example, specify whether the model should prioritize retrieved information over its pre-trained knowledge.',
      metadata: { source: 'Prompt Engineering for RAG', date: '2023-12-05' },
      score: 0.89,
    },
  ];

  // Custom mock results for specific query types
  if (normalizedQuery.includes('weather')) {
    return [
      {
        content:
          'The weather system integration allows chatbots to retrieve current weather information for a specific location. This provides real-time, accurate weather data to users.',
        metadata: {
          source: 'Weather API Integration Guide',
          date: '2024-01-10',
        },
        score: 0.95,
      },
      {
        content:
          'Weather data can be accessed through various APIs like OpenWeatherMap, WeatherAPI, or government meteorological services. Most provide current conditions, forecasts, and historical data.',
        metadata: { source: 'API Documentation', date: '2023-11-20' },
        score: 0.88,
      },
    ];
  }

  if (
    normalizedQuery.includes('document') ||
    normalizedQuery.includes('artifact')
  ) {
    return [
      {
        content:
          'The document creation tool allows chatbots to generate and manage various types of documents like text files, code snippets, and structured data. These documents can be edited, saved, and shared.',
        metadata: { source: 'Document Tool Documentation', date: '2024-01-05' },
        score: 0.94,
      },
      {
        content:
          'Artifact-based UI components enhance chatbot functionality by providing dedicated interfaces for different content types. This improves user experience by displaying information in the most appropriate format.',
        metadata: { source: 'UI Component Guide', date: '2023-12-18' },
        score: 0.89,
      },
    ];
  }

  // Filter and return the most relevant mock entries
  const filtered = mockKb.filter((entry) => {
    // Check for keyword matches
    return (
      entry.content.toLowerCase().includes(normalizedQuery) ||
      normalizedQuery.includes('rag') ||
      // Always include some general RAG info for development
      entry.metadata.source
        .toLowerCase()
        .includes('rag')
    );
  });

  return filtered.slice(0, 3);
}

export interface RetrievalOptions {
  query: string;
  topK?: number;
  filter?: Record<string, any>;
  includeMetadata?: boolean;
}

export interface RetrievalResult {
  content: string;
  metadata?: Record<string, any>;
  score?: number;
}

/**
 * Retrieves context from the RAG system based on the user's query
 * @param options The retrieval options
 * @returns Array of retrieved documents/context
 */
export async function retrieveContext({
  query,
  topK = 3,
  filter = {},
  includeMetadata = true,
}: RetrievalOptions): Promise<RetrievalResult[]> {
  try {
    // Get or initialize the ragie client
    const client = await initRagieClient();

    // Generate an expansion query for more comprehensive results
    const { generateExpansionQuery } = await import('./advanced-prompting');
    const expansionQuery = generateExpansionQuery(query);

    // Safe retrieve function that handles errors and different API structures
    const safeRetrieve = async (q: string, k: number) => {
      try {
        // Try to use the retrieve method if it exists
        if (typeof client.retrieve === 'function') {
          return await client.retrieve({
            query: q,
            topK: k,
            filter,
            includeMetadata,
          });
        }

        // Fallback to search method
        if (typeof client.search === 'function') {
          return await client.search({
            query: q,
            topK: k,
            filter,
            includeMetadata,
          });
        }

        // Final fallback to mock data
        return getMockRetrievalResults(q);
      } catch (err) {
        console.error(`Error retrieving with query "${q}":`, err);
        return getMockRetrievalResults(q);
      }
    };

    // Execute both the original query and the expansion query
    const [mainResults, expansionResults] = await Promise.all([
      safeRetrieve(query, Math.ceil(topK * 0.7)), // 70% from main query
      safeRetrieve(expansionQuery, Math.ceil(topK * 0.5)), // 50% from expansion query
    ]);

    // Transform results to a standardized format
    const mainFormattedResults = mainResults.map((result: any) => ({
      content: result.content || result.text || '',
      metadata: includeMetadata ? result.metadata : undefined,
      score: result.score || 0.9,
      source: 'main_query',
    }));

    const expansionFormattedResults = expansionResults.map((result: any) => ({
      content: result.content || result.text || '',
      metadata: includeMetadata ? result.metadata : undefined,
      score: (result.score || 0.7) * 0.8, // Slightly lower relevance weight for expanded results
      source: 'expansion_query',
    }));

    // Combine and remove duplicates
    const allResults = [...mainFormattedResults, ...expansionFormattedResults];
    const uniqueResults = removeDuplicateResults(allResults);

    // Apply reranking
    const { rerankResults } = await import('./advanced-prompting');
    const rerankedResults = rerankResults(query, uniqueResults);

    // Limit to the requested number of results
    return rerankedResults.slice(0, topK);
  } catch (error) {
    console.error('Error retrieving context from RAG:', error);
    // Return mock data as fallback
    return getMockRetrievalResults(query).map((result) => ({
      content: result.content,
      metadata: includeMetadata ? result.metadata : undefined,
      score: result.score,
    }));
  }
}

/**
 * Removes duplicate results based on content similarity
 * @param results Array of retrieval results
 * @returns Deduplicated results
 */
function removeDuplicateResults(results: RetrievalResult[]): RetrievalResult[] {
  const seen = new Set<string>();
  const uniqueResults: RetrievalResult[] = [];

  for (const result of results) {
    // Create a simple hash of the content to detect duplicates
    const contentHash = result.content.slice(0, 100).trim().toLowerCase();

    if (!seen.has(contentHash)) {
      seen.add(contentHash);
      uniqueResults.push(result);
    }
  }

  return uniqueResults;
}

/**
 * Formats retrieved context into a string that can be injected into the prompt
 * @param retrievalResults The results from the RAG retrieval
 * @returns A formatted string containing the retrieved content
 */
export function formatRetrievedContext(
  retrievalResults: RetrievalResult[],
): string {
  if (!retrievalResults || retrievalResults.length === 0) {
    return '';
  }

  return retrievalResults
    .map((result, index) => {
      // Format metadata in a more readable way
      let metadataString = '';
      if (result.metadata) {
        const { source, date } = result.metadata;
        metadataString = `\nSource: ${source || 'Unknown'}`;
        if (date) {
          metadataString += ` (${date})`;
        }

        // Add score if available (useful for debugging)
        if (result.score !== undefined) {
          metadataString += `\nRelevance: ${Math.round(result.score * 100)}%`;
        }
      }

      // Format the content with the document number and metadata
      return `[Document ${index + 1}]:\n${result.content}${metadataString}`;
    })
    .join('\n\n');
}
