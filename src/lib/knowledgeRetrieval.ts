import { KnowledgeItem } from '../types';

export interface RetrievedChunk {
  id: string;
  knowledgeId: string;
  title: string;
  category: string;
  snippet: string;
  fullContent: string;
  score: number;
}

// Tokenize text into normalized lowercase word terms
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

// Split large text into manageable knowledge chunks with overlap
export function chunkText(rawText: string, chunkSize = 350, overlap = 50): string[] {
  // If text already has double newlines (paragraphs), split by paragraphs first
  const paragraphs = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  
  if (paragraphs.length > 1 && paragraphs.every(p => p.length < chunkSize * 2)) {
    return paragraphs;
  }

  const words = rawText.split(/\s+/);
  if (words.length <= chunkSize) {
    return [rawText.trim()];
  }

  const chunks: string[] = [];
  let index = 0;
  while (index < words.length) {
    const chunkWords = words.slice(index, index + chunkSize);
    chunks.push(chunkWords.join(' '));
    index += (chunkSize - overlap);
  }

  return chunks;
}

/**
 * Retrieve top K most relevant knowledge items based on incoming email query.
 * Implements a term-frequency TF-IDF similarity matcher with category & title weighting.
 */
export function retrieveRelevantKnowledge(
  query: string,
  knowledgeList: KnowledgeItem[],
  topK = 3,
  minThreshold = 0.15
): RetrievedChunk[] {
  const enabledItems = knowledgeList.filter(item => item.isEnabled);
  if (enabledItems.length === 0 || !query.trim()) {
    return [];
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const results: RetrievedChunk[] = [];

  for (const item of enabledItems) {
    const titleTokens = tokenize(item.title);
    const categoryTokens = tokenize(item.category);
    const contentTokens = tokenize(item.content);

    let matchScore = 0;
    const matchedTerms = new Set<string>();

    for (const qToken of queryTokens) {
      // Direct title match gets high priority
      if (titleTokens.includes(qToken)) {
        matchScore += 3.5;
        matchedTerms.add(qToken);
      }
      // Direct category match (e.g. "pricing", "refund")
      if (categoryTokens.includes(qToken)) {
        matchScore += 2.8;
        matchedTerms.add(qToken);
      }
      // Content occurrence frequency
      const occurrences = contentTokens.filter(t => t === qToken || t.startsWith(qToken) || qToken.startsWith(t)).length;
      if (occurrences > 0) {
        matchScore += Math.min(occurrences * 0.8, 3.2);
        matchedTerms.add(qToken);
      }
    }

    // Boost score if multiple unique query keywords matched
    const termCoverageRatio = matchedTerms.size / Math.min(queryTokens.length, 5);
    const normalizedScore = (matchScore / (queryTokens.length * 2.5)) * (1 + termCoverageRatio);
    const boundedScore = Math.min(Math.round(normalizedScore * 100) / 100, 0.99);

    if (boundedScore >= minThreshold) {
      // Find the most relevant snippet excerpt containing matched words
      const snippet = extractSnippet(item.content, Array.from(matchedTerms));

      results.push({
        id: `chunk-${item.id}`,
        knowledgeId: item.id,
        title: item.title,
        category: item.category,
        snippet,
        fullContent: item.content,
        score: boundedScore,
      });
    }
  }

  // Sort descending by relevance score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}

function extractSnippet(content: string, terms: string[]): string {
  if (terms.length === 0) {
    return content.slice(0, 180) + (content.length > 180 ? '...' : '');
  }

  const lower = content.toLowerCase();
  let bestIdx = -1;

  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx !== -1) {
      bestIdx = idx;
      break;
    }
  }

  if (bestIdx === -1) {
    return content.slice(0, 180) + (content.length > 180 ? '...' : '');
  }

  const start = Math.max(0, bestIdx - 60);
  const end = Math.min(content.length, bestIdx + 140);
  const snippet = content.slice(start, end).trim();

  return (start > 0 ? '...' : '') + snippet + (end < content.length ? '...' : '');
}
