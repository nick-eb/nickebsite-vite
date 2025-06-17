import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardInteraction } from '../../hooks/useCardInteraction';

export interface BaseCardProps {
  className?: string;
  children: React.ReactNode;
  draggable?: boolean;
  onDragStart?: (startX: number, startY: number) => void;
  onDrag?: (deltaX: number, deltaY: number, currentX: number, currentY: number) => void;
  onDragEnd?: () => void;
}

export interface LinkCardProps extends BaseCardProps {
  variant: 'link';
  to: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface ExternalLinkCardProps extends BaseCardProps {
  variant: 'external';
  href: string;
  target?: string;
  rel?: string;
}

export interface ButtonCardProps extends BaseCardProps {
  variant: 'button';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface DivCardProps extends BaseCardProps {
  variant?: 'div' | undefined;
}

export type CardProps = LinkCardProps | ExternalLinkCardProps | ButtonCardProps | DivCardProps;

export interface CardImageProps {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export interface CardContentProps {
  children: React.ReactNode;
}

export interface CardTitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface CardDescriptionProps {
  children: React.ReactNode;
}

export interface CardMetaProps {
  children: React.ReactNode;
}
// Main Card component
export const Card: React.FC<CardProps> = (props) => {
  const { className = '', children, draggable = false, onDragStart, onDrag, onDragEnd } = props;
  const navigate = useNavigate();
  
  const cardClassName = `card ${className}`;

  if (props.variant === 'link') {
    const { to, onClick } = props;
    
    const { isDragging, isPressed, handlers } = useCardInteraction({
      onNavigate: () => navigate(to),
      ...(onDragStart && { onDragStart }),
      ...(onDrag && { onDrag }),
      ...(onDragEnd && { onDragEnd })
    });
    
    const finalClassName = `${cardClassName} ${isDragging ? 'card--dragging' : ''} ${isPressed ? 'card--pressed' : ''}`;
    
    return (
      <div
        className={finalClassName}
        draggable={draggable}
        {...handlers}
        onClick={(e) => {
          handlers.onClick(e);
          if (!isDragging) {
            onClick?.(e as any);
          }
        }}
      >
        {children}
      </div>
    );
  }

  if (props.variant === 'external') {
    const { href, target = '_blank', rel = 'noopener noreferrer' } = props;
    
    const { isDragging, isPressed, handlers } = useCardInteraction({
      onNavigate: () => window.open(href, target, rel ? `noreferrer=${rel}` : undefined),
      ...(onDragStart && { onDragStart }),
      ...(onDrag && { onDrag }),
      ...(onDragEnd && { onDragEnd })
    });
    
    const finalClassName = `${cardClassName} ${isDragging ? 'card--dragging' : ''} ${isPressed ? 'card--pressed' : ''}`;
    
    return (
      <div
        className={finalClassName}
        draggable={draggable}
        {...handlers}
      >
        {children}
      </div>
    );
  }

  if (props.variant === 'button') {
    const { onClick } = props;
    
    const { isDragging, isPressed, handlers } = useCardInteraction({
      onNavigate: () => onClick?.({} as any),
      ...(onDragStart && { onDragStart }),
      ...(onDrag && { onDrag }),
      ...(onDragEnd && { onDragEnd })
    });
    
    const finalClassName = `${cardClassName} ${isDragging ? 'card--dragging' : ''} ${isPressed ? 'card--pressed' : ''}`;
    
    return (
      <div
        className={finalClassName}
        draggable={draggable}
        {...handlers}
        onClick={(e) => {
          handlers.onClick(e);
          if (!isDragging) {
            onClick?.({} as any);
          }
        }}
      >
        {children}
      </div>
    );
  }

  // Default div variant
  return (
    <div className={cardClassName} draggable={draggable}>
      {children}
    </div>
  );
};

// Card sub-components
export const CardImage: React.FC<CardImageProps> = ({ 
  src, 
  alt, 
  loading = 'lazy', 
  onError 
}) => (
  <div className="card-image">
    <img 
      src={src}
      alt={alt}
      loading={loading}
      draggable="false"
      onError={onError}
    />
  </div>
);

export const CardContent: React.FC<CardContentProps> = ({ children }) => (
  <div className="card-content">
    {children}
  </div>
);

export const CardTitle: React.FC<CardTitleProps> = ({ children, level = 3 }) => {
  const headingProps = { className: "card-title" };
  
  switch (level) {
    case 1: return <h1 {...headingProps}>{children}</h1>;
    case 2: return <h2 {...headingProps}>{children}</h2>;
    case 3: return <h3 {...headingProps}>{children}</h3>;
    case 4: return <h4 {...headingProps}>{children}</h4>;
    case 5: return <h5 {...headingProps}>{children}</h5>;
    case 6: return <h6 {...headingProps}>{children}</h6>;
    default: return <h3 {...headingProps}>{children}</h3>;
  }
};

export const CardDescription: React.FC<CardDescriptionProps> = ({ children }) => (
  <p className="card-description">
    {children}
  </p>
);

export const CardMeta: React.FC<CardMetaProps> = ({ children }) => (
  <div className="card-meta">
    {children}
  </div>
);

// Blog-specific card variant
// Blog-specific card variant
export interface BlogCardProps {
  to: string;
  title: string;
  date: string;
  excerpt: string;
  thumbnail?: string | undefined;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onDragStart?: (startX: number, startY: number) => void;
  onDrag?: (deltaX: number, deltaY: number, currentX: number, currentY: number) => void;
  onDragEnd?: () => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  to,
  title,
  date,
  excerpt,
  thumbnail,
  onClick,
  className = '',
  onDragStart,
  onDrag,
  onDragEnd,
  ...props
}) => {
  const cardProps = {
    variant: 'link' as const,
    to,
    className: `${className} card--blog`,
    ...(onDragStart && { onDragStart }),
    ...(onDrag && { onDrag }),
    ...(onDragEnd && { onDragEnd }),
    ...props,
    ...(onClick && { onClick })
  };

  return (
    <Card {...cardProps}>
      <CardImage
        src={thumbnail || '/assets/img/logo.png'}
        alt={`${title} thumbnail`}
      />
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <time className="blog-date">
          {new Date(date).toLocaleDateString()}
        </time>
        <CardDescription>{excerpt}</CardDescription>
        <div className="read-more">Read more →</div>
      </CardContent>
    </Card>
  );
};
// Project-specific card variant
export interface ProjectCardProps {
  href: string;
  name: string;
  description: string;
  language?: string | undefined;
  languageColor?: string | undefined;
  stargazers_count: number;
  image?: string | undefined;
  homepage?: string | undefined;
  className?: string;
  onDragStart?: (startX: number, startY: number) => void;
  onDrag?: (deltaX: number, deltaY: number, currentX: number, currentY: number) => void;
  onDragEnd?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  href,
  name,
  description,
  language,
  languageColor,
  stargazers_count,
  image,
  homepage,
  className = '',
  onDragStart,
  onDrag,
  onDragEnd,
  ...props
}) => (
  <Card
    variant="external"
    href={href}
    className={`${className} card--project`}
    {...(onDragStart && { onDragStart })}
    {...(onDrag && { onDrag })}
    {...(onDragEnd && { onDragEnd })}
    {...props}
  >
    <CardImage
      src={image || '/assets/img/github-placeholder.png'}
      alt={`${name} preview`}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src.includes('github-placeholder')) return;
        img.src = '/assets/img/github-placeholder.png';
      }}
    />
    <CardContent>
      <CardTitle>{name}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <CardMeta>
        {language && (
          <span
            className="language"
            style={{ '--lang-color': languageColor } as React.CSSProperties}
          >
            <span className="lang-dot"></span>
            {language}
          </span>
        )}
        <span className="stars">⭐ {stargazers_count}</span>
      </CardMeta>
    </CardContent>
    {homepage && (
      <a
        href={homepage}
        target="_blank"
        rel="noopener noreferrer"
        className="demo-link"
      >
        View Demo →
      </a>
    )}
  </Card>
);

export default Card;