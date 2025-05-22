/**
 * This module contains advanced prompt engineering techniques to improve
 * RAG performance and result quality
 */

/**
 * Rerank the retrieved results based on relevance to the query
 * @param query The user query
 * @param results The retrieved results
 * @returns Reranked results
 */
export function rerankResults(query: string, results: any[]): any[] {
  if (!results || results.length <= 1) {
    return results;
  }

  // Simple reranking that moves exact matches to the top
  return [...results].sort((a, b) => {
    const aContent = a.content || '';
    const bContent = b.content || '';

    // Check if the content contains the exact query
    const aContainsQuery = aContent.toLowerCase().includes(query.toLowerCase());
    const bContainsQuery = bContent.toLowerCase().includes(query.toLowerCase());

    if (aContainsQuery && !bContainsQuery) return -1;
    if (!aContainsQuery && bContainsQuery) return 1;

    // Otherwise sort by score if available
    return (b.score || 0) - (a.score || 0);
  });
}

/**
 * Generate query-focused instructions for the LLM based on the query type
 * @param query The user query
 * @returns Specific instruction for handling this type of query
 */
export function generateQuerySpecificInstructions(query: string): string {
  // Detect query types and add specific instructions
  if (/compare|difference|similarities|versus|vs/i.test(query)) {
    return `
COMPARISON INSTRUCTIONS:
- Create a structured comparison between the items mentioned in the query
- Include key similarities and differences
- Use a table format when appropriate
- Present balanced information about all items being compared`;
  }

  if (/how to|steps|guide|tutorial|instructions/i.test(query)) {
    return `
INSTRUCTIONAL CONTENT GUIDELINES:
- Provide clear step-by-step instructions
- Number each step
- Include important cautions or warnings
- Add examples where helpful
- Consider both beginners and more experienced users`;
  }

  if (/code|function|program|implement|script/i.test(query)) {
    return `
CODE GENERATION GUIDELINES:
- Write clean, well-commented code
- Include explanations for complex logic
- Consider edge cases and error handling
- Optimize for readability and maintainability
- Provide usage examples where appropriate`;
  }

  if (/summarize|summary|overview|brief/i.test(query)) {
    return `
SUMMARIZATION GUIDELINES:
- Extract the key points from the context
- Be concise but comprehensive
- Structure the summary logically
- Maintain the original meaning and intent
- Highlight the most important information`;
  }

  // Default instructions
  return '';
}

/**
 * Generate a supplementary query to expand the original query
 * This is useful for retrieving more comprehensive context
 * @param originalQuery The original user query
 * @returns An expanded query to retrieve additional context
 */
export function generateExpansionQuery(originalQuery: string): string {
  // Simple query expansion logic
  const questionWords = ['what', 'when', 'where', 'why', 'who', 'how'];

  // If it's already a question, generate a related question
  if (
    questionWords.some((word) => originalQuery.toLowerCase().startsWith(word))
  ) {
    return `background information ${originalQuery.replace(/\?$/, '')}`;
  }

  // For non-questions, add a question prefix
  return `what is ${originalQuery}`;
}

/**
 * Combine multiple prompt engineering techniques into a single enhanced prompt
 * @param basePrompt The original system prompt
 * @param userQuery The user's query
 * @param retrievedContext The context retrieved from RAG
 * @returns A comprehensively engineered prompt
 */
export function createEnhancedRAGPrompt(
  basePrompt: string,
  userQuery: string,
  retrievedContext: string,
): string {
  const queryInstructions = generateQuerySpecificInstructions(userQuery);

  return `${basePrompt}

RETRIEVED CONTEXT:
${retrievedContext}

${queryInstructions}

INSTRUCTIONS FOR USING CONTEXT:
1. Use the retrieved context to provide accurate and informed responses
2. Prioritize information from the context when directly relevant to the query
3. Always evaluate the reliability and relevance of the context information
4. When citing information from the context, indicate the source if available
5. If the context is insufficient, use your general knowledge to supplement
6. Do not invent or hallucinate information that's not in the context or your knowledge
7. If asked about the source of information, be transparent about whether it came from the retrieved context

RESPONSE QUALITY GUIDELINES:
- Be thorough but concise
- Structure your response logically with appropriate headings if needed
- Use examples when they aid understanding
- Consider different perspectives when appropriate
- Focus on answering the user's actual needs, not just the literal query
- If the user's question is unclear, request clarification
`;
}
