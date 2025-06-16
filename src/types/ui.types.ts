import React from 'react';

export interface SliderState {
  isStart: boolean;
  isEnd: boolean;
  currentSlide: number;
  isDragging: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  closeOnClick?: boolean;
}

export interface TabsProps {
  defaultTab?: string;
  children: React.ReactNode;
  onTabChange?: (tabId: string) => void;
}

export interface TabProps {
  id: string;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  allowMultiple?: boolean;
  defaultOpenItems?: string[];
  children: React.ReactNode;
}

export interface AccordionItemProps {
  id: string;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  debounceMs?: number;
}

export interface FilterProps<T = any> {
  filters: T;
  onFiltersChange: (filters: T) => void;
  onReset?: () => void;
}

export interface SortProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{
    value: T;
    label: string;
  }>;
}

export interface ThemeContextValue {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  isDark: boolean;
}

export interface BreakpointContextValue {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  width: number;
  height: number;
}

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface IntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

export interface KeyboardShortcut {
  key: string;
  modifiers?: Array<'ctrl' | 'alt' | 'shift' | 'meta'>;
  action: () => void;
  description?: string;
  disabled?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}