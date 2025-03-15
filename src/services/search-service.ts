/**
 * Search service for documentation content
 */
import { DocSource, DocCategory } from '../types/index.js';
import { FileSystemManager } from '../utils/fs/index.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Search result interface
 */
export interface FormattedSearchResult {
  name: string;
  url: string;
  category: DocCategory;
  description: string;
  tags?: string[];
  relevance_score: number;
  match_highlights: string[];
}

/**
 * Service for searching documentation content
 */
export class SearchService {
  private fsManager: FileSystemManager;

  /**
   * Creates a new SearchService instance
   * @param fsManager - FileSystemManager instance
   */
  constructor(fsManager: FileSystemManager) {
    this.fsManager = fsManager;
  }

  /**
   * Searches through documentation content with improved scoring
   * @param docs - All documentation sources
   * @param query - Search query
   * @param category - Optional category filter
   * @param tag - Optional tag filter
   * @returns Formatted search results
   */
  async searchDocumentation(
    docs: DocSource[],
    args: { query: string; category?: DocCategory; tag?: string }
  ): Promise<FormattedSearchResult[]> {
    const { query, category, tag } = args;
    let searchResults = [];

    try {
      // Filter docs based on category and tag first
      let filteredDocs = docs;
      
      if (category) {
        filteredDocs = filteredDocs.filter(doc => doc.category === category);
      }
      
      if (tag) {
        filteredDocs = filteredDocs.filter(doc => doc.tags?.includes(tag));
      }
      
      // Split query into keywords for better matching
      const queryLower = query.toLowerCase();
      const keywords = queryLower.split(/\s+/).filter(kw => kw.length > 1);
      
      // Process each document in the filtered list
      for (const doc of filteredDocs) {
        // Try to search in the document content if it's cached
        const searchResult = await this.fsManager.searchInDocumentation(doc.name, query, doc);
        
        if (searchResult) {
          searchResults.push({
            doc: {
              name: doc.name,
              url: doc.url,
              category: doc.category,
              description: doc.description,
              tags: doc.tags,
              lastUpdated: doc.lastUpdated,
            },
            score: searchResult.score,
            matches: searchResult.matches.slice(0, 3) // Limit to top 3 matches for readability
          });
        } else {
          // If document isn't cached or no content match, still check metadata
          // This ensures newly added documents appear in search results
          const metadataScore = this.fsManager.calculateMetadataScore(doc, query);
          
          if (metadataScore > 0) {
            searchResults.push({
              doc: {
                name: doc.name,
                url: doc.url,
                category: doc.category,
                description: doc.description,
                tags: doc.tags,
                lastUpdated: doc.lastUpdated,
              },
              score: metadataScore,
              matches: this.fsManager.generateMetadataMatches(doc, query)
            });
          }
        }
      }

      // Sort results by score (highest first)
      searchResults.sort((a, b) => b.score - a.score);
      
      // Format results for display
      return searchResults.map(result => ({
        name: result.doc.name,
        url: result.doc.url,
        category: result.doc.category,
        description: result.doc.description,
        tags: result.doc.tags,
        relevance_score: result.score,
        match_highlights: result.matches
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new McpError(ErrorCode.InternalError, `Search failed: ${errorMessage}`);
    }
  }
}