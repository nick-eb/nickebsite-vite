import React from 'react';

// Define proper interfaces for HTML element props
interface HTMLElementProps extends React.HTMLAttributes<HTMLElement> {}
interface HTMLHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface HTMLParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface HTMLAnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}
interface HTMLListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {}
interface HTMLListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {}
interface HTMLBlockquoteProps extends React.BlockquoteHTMLAttributes<HTMLQuoteElement> {}
interface HTMLImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}
interface HTMLTableProps extends React.TableHTMLAttributes<HTMLTableElement> {}
interface HTMLTableSectionProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface HTMLTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
interface HTMLTableCellProps extends React.TdHTMLAttributes<HTMLTableDataCellElement> {}
interface HTMLTableHeaderProps extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {}

// Custom CodeBlock component with syntax highlighting
export const CodeBlock: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  title?: string;
}> = ({ children, className, title }) => {
  const isInline = !className;
  
  if (isInline) {
    return (
      <code className="inline-code">
        {children}
      </code>
    );
  }

  // const language = className?.replace('language-', '') || '';
  
  return (
    <div className="code-block-container">
      {title && (
        <div className="code-block-title">
          {title}
        </div>
      )}
      <pre className={`code-block ${className || ''}`}>
        <code className={className}>
          {children}
        </code>
      </pre>
    </div>
  );
};

// Custom Alert/Callout component
export const Alert: React.FC<{
  type?: 'info' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
}> = ({ type = 'info', children }) => (
  <div className={`alert alert-${type}`}>
    {children}
  </div>
);

// Image carousel component for MDX
export const ImageCarousel: React.FC<{
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
}> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="mdx-image-carousel">
      <div className="carousel-container">
        <div className="carousel-slides">
          {images.map((image, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="carousel-image"
              />
            </div>
          ))}
        </div>
        
        {images.length > 1 && (
          <>
            <button 
              className="carousel-button prev" 
              onClick={prevImage}
              aria-label="Previous image"
            >
              ←
            </button>
            <button 
              className="carousel-button next" 
              onClick={nextImage}
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}
      </div>
      
      {images[currentIndex]?.caption && (
        <div className="image-caption">
          {images[currentIndex].caption}
        </div>
      )}
      
      {images.length > 1 && (
        <div className="carousel-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Custom components mapping for MDX
export const mdxComponents = {
  // Override default elements
  h1: (props: HTMLHeadingProps) => <h1 className="mdx-h1" {...props} />,
  h2: (props: HTMLHeadingProps) => <h2 className="mdx-h2" {...props} />,
  h3: (props: HTMLHeadingProps) => <h3 className="mdx-h3" {...props} />,
  h4: (props: HTMLHeadingProps) => <h4 className="mdx-h4" {...props} />,
  h5: (props: HTMLHeadingProps) => <h5 className="mdx-h5" {...props} />,
  h6: (props: HTMLHeadingProps) => <h6 className="mdx-h6" {...props} />,
  p: (props: HTMLParagraphProps) => <p className="mdx-paragraph" {...props} />,
  a: (props: HTMLAnchorProps) => <a className="mdx-link" {...props} />,
  ul: (props: HTMLListProps) => <ul className="mdx-list" {...props} />,
  ol: (props: HTMLListProps) => <ol className="mdx-ordered-list" {...props} />,
  li: (props: HTMLListItemProps) => <li className="mdx-list-item" {...props} />,
  blockquote: (props: HTMLBlockquoteProps) => <blockquote className="mdx-blockquote" {...props} />,
  img: (props: HTMLImageProps) => <img className="mdx-image" {...props} />,
  table: (props: HTMLTableProps) => <table className="mdx-table" {...props} />,
  thead: (props: HTMLTableSectionProps) => <thead className="mdx-table-head" {...props} />,
  tbody: (props: HTMLTableSectionProps) => <tbody className="mdx-table-body" {...props} />,
  tr: (props: HTMLTableRowProps) => <tr className="mdx-table-row" {...props} />,
  th: (props: HTMLTableHeaderProps) => <th className="mdx-table-header" {...props} />,
  td: (props: HTMLTableCellProps) => <td className="mdx-table-cell" {...props} />,
  code: CodeBlock,
  pre: (props: HTMLElementProps) => <div {...props} />, // Pre is handled by CodeBlock
  
  // Custom components
  Alert,
  ImageCarousel,
};