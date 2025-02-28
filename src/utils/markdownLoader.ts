import { marked } from 'marked';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  thumbnail?: string;
}

// Fix the typing for import.meta.glob
const blogPosts: Record<string, string> = import.meta.glob('/src/blogs/*.md', {
  eager: true,
  as: 'raw',
}) as Record<string, string>;

export async function loadBlogPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];

  for (const path in blogPosts) {
    try {
      const content = blogPosts[path];
      const slug = path.split('/').pop()?.replace('.md', '') || '';
      
      // Normalize line endings
      const normalizedContent = content.replace(/\r\n/g, '\n');
      
      // Extract front matter with more robust regex
      const frontMatterMatch = normalizedContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
      const frontMatter = frontMatterMatch ? frontMatterMatch[1] : '';
      const mainContent = normalizedContent.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '').trim();
      
      // Improved front matter parsing with optional whitespace
      const getFrontMatterValue = (key: string): string => {
        const match = frontMatter.match(new RegExp(`${key}:\\s*(.+?)\\s*(?:\\n|$)`));
        return match ? match[1].trim() : '';
      };

      const post: BlogPost = {
        slug,
        title: getFrontMatterValue('title') || slug,
        date: getFrontMatterValue('date') || new Date().toISOString(),
        excerpt: getFrontMatterValue('excerpt') || '',
        thumbnail: getFrontMatterValue('thumbnail') || undefined,
        content: mainContent
      };

      // Debug logging
      console.debug(`Parsed post "${path}":`, {
        slug: post.slug,
        title: post.title,
        hasContent: !!post.content,
        frontMatter: !!frontMatter
      });

      posts.push(post);
    } catch (error) {
      console.error(`Error parsing blog post ${path}:`, error);
    }
  }

  // Sort by date, newest first
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const posts = await loadBlogPosts();
    const post = posts.find(p => p.slug === slug);
    
    if (!post) return null;
    
    post.content = await marked(post.content);
    return post;
  } catch (error) {
    console.error('Error loading blog post:', error);
    return null;
  }
}
