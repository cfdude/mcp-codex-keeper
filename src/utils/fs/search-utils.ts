/**
 * Search utilities for documentation content
 */
import fs from 'fs/promises';
import { DocSource } from '../../types/index.js';
import { FileManager } from './file-manager.js';
import { FileSystemError } from './index.js';

/**
 * Search result with score and matches
 */
export interface SearchResult {
  score: number;
  matches: string[];
}

/**
 * Provides search functionality for documentation content
 */
export class SearchUtils {
  private fileManager: FileManager;

  /**
   * Creates a new SearchUtils instance
   * @param fileManager - FileManager instance
   */
  constructor(fileManager: FileManager) {
    this.fileManager = fileManager;
  }

  /**
   * Searches for text in cached documentation with advanced scoring
   * @param name - Documentation name
   * @param searchQuery - Text to search for
   * @param doc - Optional document metadata for scoring
   * @returns Score object with match details or null if no match
   */
  async searchInDocumentation(
    name: string,
    searchQuery: string,
    doc?: DocSource
  ): Promise<SearchResult | null> {
    try {
      const filePath = this.fileManager.getDocumentationPath(name);

      // Split search query into keywords
      const keywords = searchQuery.toLowerCase()
        .split(/\s+/)
        .filter(kw => kw.length > 1); // Filter out single-character words
      
      if (keywords.length === 0) {
        return null;
      }

      // Check if file exists
      let fileExists = false;
      try {
        await fs.access(filePath);
        fileExists = true;
      } catch {
        // File doesn't exist, but we'll still check metadata
        fileExists = false;
      }

      let totalScore = 0;
      const matches: string[] = [];
      
      // If file exists, search content
      if (fileExists) {
        try {
          // Read content
          const content = await fs.readFile(filePath, 'utf-8');
          const contentLower = content.toLowerCase();
          
          const matchedKeywords = new Set<string>();
          
          // Check for exact phrase match first (highest score)
          const exactPhraseScore = 100;
          if (contentLower.includes(searchQuery.toLowerCase())) {
            totalScore += exactPhraseScore;
            
            // Extract context around the exact match
            const matchIndex = contentLower.indexOf(searchQuery.toLowerCase());
            const contextStart = Math.max(0, matchIndex - 50);
            const contextEnd = Math.min(content.length, matchIndex + searchQuery.length + 50);
            const matchContext = content.substring(contextStart, contextEnd).trim();
            
            matches.push(`Exact match: "${matchContext}"`);
          }
          
          // Check for individual keyword matches
          for (const keyword of keywords) {
            if (contentLower.includes(keyword)) {
              matchedKeywords.add(keyword);
              
              // Find a representative match for this keyword
              const matchIndex = contentLower.indexOf(keyword);
              const contextStart = Math.max(0, matchIndex - 30);
              const contextEnd = Math.min(content.length, matchIndex + keyword.length + 30);
              const matchContext = content.substring(contextStart, contextEnd).trim();
              
              if (!matches.some(m => m.includes(matchContext))) {
                matches.push(`Keyword match (${keyword}): "${matchContext}"`);
              }
            }
          }
          
          // Calculate keyword match score
          const keywordMatchScore = (matchedKeywords.size / keywords.length) * 50;
          totalScore += keywordMatchScore;
        } catch (readError) {
          console.error(`Error reading file ${filePath}:`, readError);
          // Continue to metadata matching even if file read fails
        }
      }
      
      // Add metadata matching score if document metadata is provided
      if (doc) {
        let metadataScore = 0;
        const metadataMatches: string[] = [];
        
        // Check name (higher weight than before)
        if (doc.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          metadataScore += 50;
          metadataMatches.push(`Name match: "${doc.name}"`);
        }
        
        // Check description (higher weight than before)
        if (doc.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          metadataScore += 40;
          metadataMatches.push(`Description match: "${doc.description}"`);
        }
        
        // Check category
        if (doc.category.toLowerCase().includes(searchQuery.toLowerCase())) {
          metadataScore += 20;
          metadataMatches.push(`Category match: "${doc.category}"`);
        }
        
        // Check tags (higher weight for tags)
        if (doc.tags) {
          // Check for exact tag matches
          for (const tag of doc.tags) {
            // Check if any keyword is part of the tag
            for (const keyword of keywords) {
              if (tag.toLowerCase().includes(keyword)) {
                metadataScore += 33.33;
                metadataMatches.push(`Tag match: "${tag}" contains "${keyword}"`);
                break;
              }
            }
            
            // Check if the tag is a hyphenated version of the search query
            // e.g., "vector database" matches "vector-database"
            const normalizedTag = tag.toLowerCase().replace(/-/g, ' ');
            if (normalizedTag.includes(searchQuery.toLowerCase())) {
              metadataScore += 50;
              metadataMatches.push(`Tag normalized match: "${tag}" matches "${searchQuery}"`);
            }
          }
        }
        
        totalScore += metadataScore;
        matches.push(...metadataMatches);
      }
      
      // Return null if no matches found
      if (totalScore === 0) {
        return null;
      }
      
      return {
        score: totalScore,
        matches: matches
      };
    } catch (error) {
      console.error(`Error in searchInDocumentation for ${name}:`, error);
      
      // Even if there's an error, still try to match metadata if document is provided
      if (doc) {
        const metadataScore = this.calculateMetadataOnlyScore(doc, searchQuery);
        if (metadataScore > 0) {
          return {
            score: metadataScore,
            matches: this.generateMetadataOnlyMatches(doc, searchQuery)
          };
        }
      }
      
      return null;
    }
  }
  
  /**
   * Calculate metadata-only score for a document
   * Used as a fallback when file access fails
   */
  private calculateMetadataOnlyScore(doc: DocSource, searchQuery: string): number {
    const queryLower = searchQuery.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter(kw => kw.length > 1);
    let score = 0;
    
    // Check name
    if (doc.name.toLowerCase().includes(queryLower)) {
      score += 50;
    }
    
    // Check description
    if (doc.description.toLowerCase().includes(queryLower)) {
      score += 40;
    }
    
    // Check category
    if (doc.category.toLowerCase().includes(queryLower)) {
      score += 20;
    }
    
    // Check tags
    if (doc.tags) {
      for (const tag of doc.tags) {
        if (tag.toLowerCase().includes(queryLower) ||
            tag.toLowerCase().replace(/-/g, ' ').includes(queryLower)) {
          score += 50;
        }
        
        for (const keyword of keywords) {
          if (tag.toLowerCase().includes(keyword)) {
            score += 25;
          }
        }
      }
    }
    
    return score;
  }
  
  /**
   * Generate metadata-only matches for search results
   * Used as a fallback when file access fails
   */
  private generateMetadataOnlyMatches(doc: DocSource, searchQuery: string): string[] {
    const queryLower = searchQuery.toLowerCase();
    const matches: string[] = [];
    
    // Check name
    if (doc.name.toLowerCase().includes(queryLower)) {
      matches.push(`Name match: "${doc.name}"`);
    }
    
    // Check description
    if (doc.description.toLowerCase().includes(queryLower)) {
      matches.push(`Description match: "${doc.description}"`);
    }
    
    // Check category
    if (doc.category.toLowerCase().includes(queryLower)) {
      matches.push(`Category match: "${doc.category}"`);
    }
    
    // Check tags
    if (doc.tags) {
      for (const tag of doc.tags) {
        if (tag.toLowerCase().includes(queryLower) ||
            tag.toLowerCase().replace(/-/g, ' ').includes(queryLower)) {
          matches.push(`Tag match: "${tag}"`);
        }
      }
    }
    
    return matches;
  }

  /**
   * Calculate metadata score for a document based on search query
   * This is used when document content isn't cached yet
   */
  calculateMetadataScore(doc: DocSource, query: string): number {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter(kw => kw.length > 1);
    let score = 0;
    
    // Calculate exact phrase match score
    // Exact phrase matches are highly valuable
    if (doc.name.toLowerCase().includes(queryLower)) {
      score += 150; // Exact name match is extremely relevant
    }
    
    if (doc.description.toLowerCase().includes(queryLower)) {
      score += 100; // Exact description match is very relevant
    }
    
    // Calculate keyword match scores
    // This helps with partial matches and multi-word queries
    for (const keyword of keywords) {
      // Name keyword matches (high priority)
      if (doc.name.toLowerCase().includes(keyword)) {
        // Word boundary match is better than substring match
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (wordBoundaryRegex.test(doc.name)) {
          score += 75; // Word boundary match in name
        } else {
          score += 50; // Substring match in name
        }
      }
      
      // Description keyword matches
      if (doc.description.toLowerCase().includes(keyword)) {
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (wordBoundaryRegex.test(doc.description)) {
          score += 40; // Word boundary match in description
        } else {
          score += 25; // Substring match in description
        }
      }
      
      // Category keyword matches
      if (doc.category.toLowerCase().includes(keyword)) {
        score += 30;
      }
    }
    
    // Check tags (very important for relevance)
    if (doc.tags) {
      // Calculate how many query words match across all tags
      const queryWords = new Set(queryLower.split(/\s+/).filter(w => w.length > 1));
      let matchedQueryWords = 0;
      
      for (const tag of doc.tags) {
        // Direct tag match with full query
        if (tag.toLowerCase() === queryLower) {
          score += 200; // Exact tag match is extremely relevant
        }
        
        // Tag contains full query
        else if (tag.toLowerCase().includes(queryLower)) {
          score += 150;
        }
        
        // Normalized tag match (e.g., "vector-database" matches "vector database")
        else if (tag.toLowerCase().replace(/-/g, ' ').includes(queryLower)) {
          score += 150;
        }
        
        // Check for individual query words in tags
        for (const word of queryWords) {
          if (tag.toLowerCase().includes(word) ||
              tag.toLowerCase().replace(/-/g, ' ').includes(word)) {
            matchedQueryWords++;
            break; // Count each query word only once
          }
        }
      }
      
      // Add score based on percentage of query words matched in tags
      if (queryWords.size > 0) {
        const matchPercentage = matchedQueryWords / queryWords.size;
        score += matchPercentage * 100;
      }
    }
    
    return score;
  }
  
  /**
   * Generate metadata match highlights for search results
   */
  generateMetadataMatches(doc: DocSource, query: string): string[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter(kw => kw.length > 1);
    const matches: string[] = [];
    
    // Check name for exact phrase match
    if (doc.name.toLowerCase().includes(queryLower)) {
      matches.push(`Name match: "${doc.name}"`);
    } else {
      // Check for keyword matches in name
      const nameMatches = keywords
        .filter(keyword => doc.name.toLowerCase().includes(keyword))
        .map(keyword => `Name contains "${keyword}"`);
      
      if (nameMatches.length > 0) {
        matches.push(nameMatches[0]); // Add the first keyword match
      }
    }
    
    // Check description for exact phrase match
    if (doc.description.toLowerCase().includes(queryLower)) {
      // Get context around the match
      const matchIndex = doc.description.toLowerCase().indexOf(queryLower);
      const contextStart = Math.max(0, matchIndex - 20);
      const contextEnd = Math.min(doc.description.length, matchIndex + queryLower.length + 20);
      const context = doc.description.substring(contextStart, contextEnd);
      
      matches.push(`Description match: "...${context}..."`);
    } else {
      // Check for keyword matches in description
      for (const keyword of keywords) {
        if (doc.description.toLowerCase().includes(keyword)) {
          const matchIndex = doc.description.toLowerCase().indexOf(keyword);
          const contextStart = Math.max(0, matchIndex - 15);
          const contextEnd = Math.min(doc.description.length, matchIndex + keyword.length + 15);
          const context = doc.description.substring(contextStart, contextEnd);
          
          matches.push(`Description contains "${keyword}": "...${context}..."`);
          break;
        }
      }
    }
    
    // Check tags
    if (doc.tags) {
      // Check for exact query match in tags
      const exactTagMatches = doc.tags.filter(tag =>
        tag.toLowerCase() === queryLower ||
        tag.toLowerCase().replace(/-/g, ' ') === queryLower
      );
      
      if (exactTagMatches.length > 0) {
        matches.push(`Tag exact match: "${exactTagMatches[0]}"`);
      } else {
        // Check for tags containing the query
        const containsTagMatches = doc.tags.filter(tag =>
          tag.toLowerCase().includes(queryLower) ||
          tag.toLowerCase().replace(/-/g, ' ').includes(queryLower)
        );
        
        if (containsTagMatches.length > 0) {
          matches.push(`Tag match: "${containsTagMatches[0]}" contains "${query}"`);
        } else {
          // Check for keyword matches in tags
          for (const tag of doc.tags) {
            for (const keyword of keywords) {
              if (tag.toLowerCase().includes(keyword) ||
                  tag.toLowerCase().replace(/-/g, ' ').includes(keyword)) {
                matches.push(`Tag contains keyword: "${tag}" contains "${keyword}"`);
                break;
              }
            }
          }
        }
      }
    }
    
    return matches;
  }
}