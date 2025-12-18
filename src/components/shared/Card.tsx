import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface BaseCardProps {
  className?: string;
  children: React.ReactNode;
  // Legacy props support to avoid breaking existing calls immediately
  draggable?: boolean;
  onDragStart?: any;
  onDrag?: any;
  onDragEnd?: any;
}

export interface LinkCardProps extends BaseCardProps {
  variant: 'link';
  to: string;
  onClick?: ((e: React.MouseEvent<HTMLAnchorElement>) => void) | undefined;
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
  const { className = '', children } = props;
  const navigate = useNavigate();

  const cardClassName = `card ${className}`;

  if (props.variant === 'link') {
    const { to, onClick } = props;
    return (
      <a
        className={cardClassName}
        onClick={(e) => {
          e.preventDefault();
          onClick?.(e);
          navigate(to);
        }}
        href={to}
        role="link"
      >
        {children}
      </a>
    );
  }

  if (props.variant === 'external') {
    const { href, target = '_blank', rel = 'noopener noreferrer' } = props;
    return (
      <a
        className={cardClassName}
        href={href}
        target={target}
        rel={rel}
      >
        {children}
      </a>
    );
  }

  if (props.variant === 'button') {
    const { onClick, type = 'button' } = props;
    return (
      <button
        className={cardClassName}
        onClick={onClick}
        type={type}
      >
        {children}
      </button>
    );
  }

  // Default div variant
  return (
    <div className={cardClassName}>
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
  // Use a div purely for styling if the semantics are handled elsewhere or strict structure is needed.
  // Although keeping standard headings is good for accessibility.
  const Tag = `h${level}` as React.ElementType;
  return <Tag className="card-title">{children}</Tag>;
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
export interface BlogCardProps {
  to: string;
  title: string;
  date: string;
  excerpt: string;
  thumbnail?: string | undefined;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  // Legacy props
  onDragStart?: any;
  onDrag?: any;
  onDragEnd?: any;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  to,
  title,
  date,
  excerpt,
  thumbnail,
  onClick,
  className = '',
}) => {
  return (
    <Card
      variant="link"
      to={to}
      className={`${className} card--blog`}
      onClick={onClick}
    >
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
  onDragStart?: any;
  onDrag?: any;
  onDragEnd?: any;
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
}) => (
  <Card
    variant="external"
    href={href}
    className={`${className} card--project`}
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
        onClick={(e) => e.stopPropagation()} // Prevent card click
      >
        View Demo →
      </a>
    )}
  </Card>
);

export default Card;