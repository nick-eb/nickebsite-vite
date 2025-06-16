import { marked } from 'marked';
import type { BlogPost, MDXPost, MarkdownPost, BlogLoadError } from '../types/blog.types';

// Raw markdown content for .md files
const rawMdPosts: Record<string, string> = import.meta.glob('/src/blogs/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

/**
 * Load MDX files using Vite's import system
 */
export async function loadMDXPosts(): Promise<MDXPost[]> {
  const posts: MDXPost[] = [];
  
  try {
    // Import MDX files directly - Vite will handle the compilation
    const modules = import.meta.glob('/src/blogs/*.mdx', { eager: true });
    
    console.log('MDX modules found:', Object.keys(modules));
    
    for (const [path, module] of Object.entries(modules)) {
      try {
        const slug = path.replace('/src/blogs/', '').replace('.mdx', '');
        const mdxModule = module as any;
        
        console.log(`Processing MDX module: ${slug}`, mdxModule);
        
        // Check if this is a valid MDX module
        if (mdxModule.default && typeof mdxModule.default === 'function') {
          const post: MDXPost = {
            slug,
            title: mdxModule.title || mdxModule.default.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            date: mdxModule.date || mdxModule.default.date || new Date().toISOString().split('T')[0],
            excerpt: mdxModule.excerpt || mdxModule.default.excerpt || '',
            thumbnail: mdxModule.thumbnail || mdxModule.default.thumbnail,
            content: mdxModule.default,
            type: 'mdx'
          };
          
          console.log(`Created MDX post:`, post);
          posts.push(post);
        } else {
          console.warn(`MDX module at ${path} does not have a valid default export`, mdxModule);
        }
      } catch (error) {
        const loadError: BlogLoadError = new Error(`Error processing MDX file ${path}`) as BlogLoadError;
        loadError.slug = path.replace('/src/blogs/', '').replace('.mdx', '');
        loadError.path = path;
        loadError.type = 'compile';
        loadError.cause = error;
        
        console.error('MDX processing error:', loadError);
      }
    }
  } catch (error) {
    const loadError: BlogLoadError = new Error('Error loading MDX files') as BlogLoadError;
    loadError.type = 'load';
    loadError.cause = error;
    
    console.error('MDX loading error:', loadError);
  }
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Load markdown posts from .md files
 */
export async function loadMarkdownPosts(): Promise<MarkdownPost[]> {
  const posts: MarkdownPost[] = [];

  try {
    // Process markdown files
    for (const path in rawMdPosts) {
      try {
        const raw = rawMdPosts[path];
        if (!raw) {
          throw new Error(`No content found for ${path}`);
        }
        const filename = path.split('/').pop() || '';
        const slug = filename.replace(/\.md$/, '');
        
        // Normalize line endings
        const normalizedContent = raw.replace(/\r\n/g, '\n');
        
        // Extract front matter with more robust regex
        const frontMatterMatch = normalizedContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
        const frontMatter = frontMatterMatch ? frontMatterMatch[1] : '';
        const mainContent = normalizedContent.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '').trim();
        
        // Improved front matter parsing with optional whitespace
        const getFrontMatterValue = (key: string): string => {
          if (!frontMatter) return '';
          const match = frontMatter.match(new RegExp(`${key}:\\s*(.+?)\\s*(?:\\n|$)`));
          return match?.[1]?.trim() || '';
        };

        const dateValue = getFrontMatterValue('date');
        const thumbnailValue = getFrontMatterValue('thumbnail');
        const post: MarkdownPost = {
          slug,
          title: getFrontMatterValue('title') || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          date: dateValue || new Date().toISOString().split('T')[0]!,
          excerpt: getFrontMatterValue('excerpt') || '',
          ...(thumbnailValue && { thumbnail: thumbnailValue }),
          content: mainContent,
          type: 'md',
        };

        console.debug(`Parsed markdown post "${path}"`, post);
        posts.push(post);
      } catch (error) {
        const loadError: BlogLoadError = new Error(`Error parsing MD post ${path}`) as BlogLoadError;
        const filename = path.split('/').pop();
        if (filename) {
          loadError.slug = filename.replace(/\.md$/, '');
        }
        loadError.path = path;
        loadError.type = 'parse';
        loadError.cause = error;
        
        console.error('Markdown parsing error:', loadError);
      }
    }
  } catch (error) {
    const loadError: BlogLoadError = new Error('Error loading markdown files') as BlogLoadError;
    loadError.type = 'load';
    loadError.cause = error;
    
    console.error('Markdown loading error:', loadError);
  }

  // Sort by date, newest first
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Combined function to load all posts (MDX + Markdown)
 */
export async function loadAllPosts(): Promise<BlogPost[]> {
  console.log('Loading all posts...');
  
  const [mdxPosts, markdownPosts] = await Promise.all([
    loadMDXPosts(),
    loadMarkdownPosts()
  ]);
  
  console.log(`Loaded ${mdxPosts.length} MDX posts and ${markdownPosts.length} markdown posts`);
  
  // Remove duplicates by slug (MDX takes precedence over MD)
  const allPosts = [...mdxPosts, ...markdownPosts];
  const uniquePosts = allPosts.filter((post, index, arr) =>
    arr.findIndex(p => p.slug === post.slug) === index
  );
  
  const sortedPosts = uniquePosts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  console.log('All posts (deduplicated):', sortedPosts);
  
  return sortedPosts;
}

/**
 * Function to get a specific post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  console.log(`Getting post by slug: ${slug}`);
  
  try {
    const allPosts = await loadAllPosts();
    const post = allPosts.find(post => post.slug === slug) || null;
    
    if (post && post.type === 'md') {
      // Transform image paths and convert markdown to HTML
      const transformedContent = (post.content as string).replace(
        /!\[(.*?)\]\((?!http|\/)(.*?)\)/g,
        (_m, alt, img) => `![${alt}](/assets/img/blog-post-imgs/${post.slug}/${img})`
      );
      
      // Convert markdown to HTML for display
      const htmlContent = await marked(transformedContent);
      (post as MarkdownPost).content = htmlContent;
    }
    
    console.log(`Found post:`, post);
    return post;
  } catch (error) {
    const loadError: BlogLoadError = new Error(`Error getting post by slug: ${slug}`) as BlogLoadError;
    loadError.slug = slug;
    loadError.type = 'load';
    loadError.cause = error;
    
    console.error('Get post error:', loadError);
    return null;
  }
}

/**
 * Search posts by title, excerpt, or content
 */
export async function searchPosts(query: string): Promise<BlogPost[]> {
  if (!query.trim()) return [];
  
  try {
    const allPosts = await loadAllPosts();
    const searchTerm = query.toLowerCase();
    
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      (post.type === 'md' && (post.content as string).toLowerCase().includes(searchTerm))
    );
  } catch (error) {
    console.error('Search posts error:', error);
    return [];
  }
}

/**
 * Get posts by date range
 */
export async function getPostsByDateRange(startDate: string, endDate: string): Promise<BlogPost[]> {
  try {
    const allPosts = await loadAllPosts();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return allPosts.filter(post => {
      const postDate = new Date(post.date);
      return postDate >= start && postDate <= end;
    });
  } catch (error) {
    console.error('Get posts by date range error:', error);
    return [];
  }
}

// Export types for backward compatibility
export type { BlogPost, MDXPost, MarkdownPost };

// Re-export for backward compatibility with existing imports
export { loadAllPosts as loadBlogPosts };