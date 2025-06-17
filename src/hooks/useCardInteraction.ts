import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCardInteractionOptions {
  onNavigate?: () => void;
  dragThreshold?: number;
  timeThreshold?: number;
  onDragStart?: (startX: number, startY: number) => void;
  onDrag?: (deltaX: number, deltaY: number, currentX: number, currentY: number) => void;
  onDragEnd?: () => void;
}

interface CardInteractionState {
  isDragging: boolean;
  isPressed: boolean;
  startPosition: { x: number; y: number } | null;
  startTime: number | null;
}

export const useCardInteraction = (options: UseCardInteractionOptions = {}) => {
  const {
    onNavigate,
    dragThreshold = 8,
    timeThreshold = 200,
    onDragStart,
    onDrag,
    onDragEnd
  } = options;

  const [state, setState] = useState<CardInteractionState>({
    isDragging: false,
    isPressed: false,
    startPosition: null,
    startTime: null
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setState({
      isDragging: false,
      isPressed: true,
      startPosition: { x: clientX, y: clientY },
      startTime: Date.now()
    });

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    setState(prevState => {
      if (!prevState.isPressed || !prevState.startPosition) return prevState;

      const deltaX = clientX - prevState.startPosition.x;
      const deltaY = clientY - prevState.startPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If movement exceeds threshold, consider it a drag
      if (distance > dragThreshold) {
        // Call drag start callback if this is the first drag movement
        if (!prevState.isDragging) {
          onDragStart?.(prevState.startPosition.x, prevState.startPosition.y);
        }
        
        // Call drag callback with delta and current position
        onDrag?.(deltaX, deltaY, clientX, clientY);
        
        return {
          ...prevState,
          isDragging: true
        };
      }

      return prevState;
    });
  }, [dragThreshold, onDragStart, onDrag]);

  const handleEnd = useCallback(() => {
    setState(prevState => {
      const wasPressed = prevState.isPressed;
      const wasDragging = prevState.isDragging;
      const timeDiff = prevState.startTime ? Date.now() - prevState.startTime : 0;

      // Call drag end callback if we were dragging
      if (wasDragging) {
        onDragEnd?.();
      }

      // Reset state
      const newState: CardInteractionState = {
        isDragging: false,
        isPressed: false,
        startPosition: null,
        startTime: null
      };

      // If it was a press without dragging and within time threshold, treat as click
      if (wasPressed && !wasDragging && timeDiff <= timeThreshold && onNavigate) {
        // Delay navigation slightly to ensure smooth interaction
        timeoutRef.current = setTimeout(() => {
          onNavigate();
          timeoutRef.current = null;
        }, 50);
      }

      return newState;
    });
  }, [onNavigate, timeThreshold, onDragEnd]);

  const handleCancel = useCallback(() => {
    setState(prevState => {
      // Call drag end callback if we were dragging
      if (prevState.isDragging) {
        onDragEnd?.();
      }
      
      return {
        isDragging: false,
        isPressed: false,
        startPosition: null,
        startTime: null
      };
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [onDragEnd]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
    
    // Add global mouse event listeners for drag detection
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    
    const handleGlobalMouseUp = () => {
      handleEnd();
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  }, [handleStart, handleMove, handleEnd]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // This is now handled globally, but we keep it for compatibility
    if (state.isPressed) {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    }
  }, [handleMove, state.isPressed]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (touch) {
        handleStart(touch.clientX, touch.clientY);
      }
    }
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
        
        // Prevent default scrolling if we're dragging
        if (state.isDragging) {
          e.preventDefault();
        }
      }
    }
  }, [handleMove, state.isDragging]);

  const handleTouchEnd = useCallback((_e: React.TouchEvent) => {
    handleEnd();
  }, [handleEnd]);

  const handleTouchCancel = useCallback((_e: React.TouchEvent) => {
    handleCancel();
  }, [handleCancel]);

  // Click handler to prevent navigation during drag
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (state.isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [state.isDragging]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return {
    isDragging: state.isDragging,
    isPressed: state.isPressed,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      onClick: handleClick
    }
  };
};