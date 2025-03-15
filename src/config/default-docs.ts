/**
 * Default documentation sources with best practices and essential references
 */
import { DocSource } from '../types/index.js';

/**
 * Default documentation sources to initialize the server with
 */
export const defaultDocs: DocSource[] = [
  // Core Development Standards
  {
    name: 'SOLID Principles Guide',
    url: 'https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design',
    description: 'Comprehensive guide to SOLID principles in software development',
    category: 'Standards',
    tags: ['solid', 'oop', 'design-principles', 'best-practices'],
  },
  {
    name: 'Design Patterns Catalog',
    url: 'https://refactoring.guru/design-patterns/catalog',
    description: 'Comprehensive catalog of software design patterns with examples',
    category: 'Standards',
    tags: ['design-patterns', 'architecture', 'best-practices', 'oop'],
  },
  {
    name: 'Clean Code Principles',
    url: 'https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29',
    description: 'Universal Clean Code principles for any programming language',
    category: 'Standards',
    tags: ['clean-code', 'best-practices', 'code-quality'],
  },
  {
    name: 'Unit Testing Principles',
    url: 'https://martinfowler.com/bliki/UnitTest.html',
    description: "Martin Fowler's guide to unit testing principles and practices",
    category: 'Standards',
    tags: ['testing', 'unit-tests', 'best-practices', 'tdd'],
  },
  {
    name: 'OWASP Top Ten',
    url: 'https://owasp.org/www-project-top-ten/',
    description: 'Top 10 web application security risks and prevention',
    category: 'Standards',
    tags: ['security', 'web', 'owasp', 'best-practices'],
  },
  {
    name: 'Conventional Commits',
    url: 'https://www.conventionalcommits.org/',
    description: 'Specification for standardized commit messages',
    category: 'Standards',
    tags: ['git', 'commits', 'versioning', 'best-practices'],
  },
  {
    name: 'Semantic Versioning',
    url: 'https://semver.org/',
    description: 'Semantic Versioning Specification',
    category: 'Standards',
    tags: ['versioning', 'releases', 'best-practices'],
  },

  // Essential Tools
  {
    name: 'Git Workflow Guide',
    url: 'https://www.atlassian.com/git/tutorials/comparing-workflows',
    description: 'Comprehensive guide to Git workflows and team collaboration',
    category: 'Tools',
    tags: ['git', 'version-control', 'workflow', 'collaboration'],
  },
];