import { marked } from 'marked';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

// Import all blog posts using Vite's import.meta.glob
const blogPosts = import.meta.glob('/src/blogs/*.md', {
  eager: true,
  as: 'raw',
});

export async function loadBlogPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];

  for (const path in blogPosts) {
    const content = blogPosts[path] as string;
    const slug = path.split('/').pop()?.replace('.md', '') || '';
    
    // Extract front matter
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    const frontMatter = frontMatterMatch ? frontMatterMatch[1] : '';
    const mainContent = content.replace(/^---\n[\s\S]*?\n---/, '').trim();
    
    // Parse front matter
    const titleMatch = frontMatter.match(/title:\s*(.+)/);
    const dateMatch = frontMatter.match(/date:\s*(.+)/);
    const excerptMatch = frontMatter.match(/excerpt:\s*(.+)/);
    
    posts.push({
      slug,
      title: titleMatch ? titleMatch[1].trim() : slug,
      date: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
      excerpt: excerptMatch ? excerptMatch[1].trim() : '',
      content: mainContent
    });
  }

  // Sort by date, newest first
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const posts = await loadBlogPosts();
    const post = posts.find(p => p.slug === slug);
    
    if (!post) return null;
    
    // Parse markdown content
    post.content = marked(post.content);
    return post;
  } catch (error) {
    console.error('Error loading blog post:', error);
    return null;
  }
}
