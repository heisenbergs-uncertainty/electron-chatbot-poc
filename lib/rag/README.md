# RAG Integration for AI Chatbot

This implementation enhances the AI chatbot with Retrieval Augmented Generation (RAG) capabilities to provide more accurate, contextually relevant responses by retrieving information from external knowledge sources.

## Overview

RAG improves the chatbot by:
1. Retrieving relevant information from a knowledge base based on user queries
2. Incorporating this retrieved context into prompts for the language model
3. Ensuring responses are grounded in accurate, up-to-date information
4. Reducing hallucinations and improving factual accuracy

## Implementation Details

### Components

- **ragie-client.ts**: Handles communication with the RAG service, including retrieving relevant documents and formatting results.
- **config.ts**: Contains configuration options and query classification logic to customize RAG behavior for different types of queries.
- **advanced-prompting.ts**: Implements advanced prompt engineering techniques, including result reranking and query-specific instructions.
- **prompt-engineering.ts**: Integrates all RAG components to enhance system prompts with retrieved context.

### Key Features

1. **Dynamic Query Processing**:
   - Analyzes query type and adjusts retrieval parameters accordingly
   - Uses query expansion for more comprehensive context retrieval

2. **Advanced Result Processing**:
   - Deduplicates and reranks retrieved results for relevance
   - Combines results from original and expanded queries

3. **Context-Aware Prompt Engineering**:
   - Adds query-specific instructions based on query type
   - Provides clear guidelines on how to use retrieved context
   - Optimizes response structure for different query types

4. **Graceful Fallbacks**:
   - Uses mock data if retrieval service is unavailable
   - Handles API inconsistencies across different ragie versions
   - Provides meaningful responses even with limited context

## Setup

1. Set the following environment variables:
   ```
   RAGIE_API_KEY=your_api_key
   RAGIE_ENDPOINT_URL=https://api.ragie.com/v1
   ```

2. The system will automatically integrate RAG into responses without additional configuration.

## Usage

RAG integration happens automatically in the chatbot. The system:

1. Analyzes each user query to determine the appropriate RAG strategy
2. Retrieves relevant context from the knowledge base
3. Enhances the system prompt with retrieved information
4. Instructs the model on how to effectively use the retrieved context

## Customization

To customize RAG behavior:

1. Adjust query classification in `config.ts` to change how different query types are handled
2. Modify the prompt templates in `advanced-prompting.ts` to change how context is presented
3. Update the mock data in `ragie-client.ts` for testing specific knowledge domains

## Monitoring and Debugging

- Relevance scores are included in the formatted context (visible only to the LLM)
- Source metadata helps track where information is coming from
- The system has logging for retrieval errors and fallbacks
