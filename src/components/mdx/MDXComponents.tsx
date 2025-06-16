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

// Under Construction Notice component
export const UnderConstructionNotice: React.FC = () => (
  <div className="under-construction-notice">
    <span className="construction-icon">🚧</span>
    <div className="construction-content">
      <h2 className="construction-title">Under Construction</h2>
      <p className="construction-text">
        This post is not ready yet. Check back later 😉
      </p>
    </div>
  </div>
);

// Pong Game component
export const PongGame: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const gameStateRef = React.useRef({
    ball: { x: 400, y: 300, dx: 2, dy: 2, radius: 8 },
    leftPaddle: { x: 20, y: 250, width: 12, height: 100, dy: 0 },
    rightPaddle: { x: 768, y: 250, width: 12, height: 100, dy: 0 },
    score: { left: 0, right: 0 },
    gameRunning: false,
    keys: { w: false, s: false, up: false, down: false },
    touches: { left: 0, right: 0 },
    rallies: 0, // Track number of paddle hits for speed progression
    baseSpeed: 2 // Starting ball speed
  });
  
  const animationFrameRef = React.useRef<number | null>(null);
  const [gameStarted, setGameStarted] = React.useState(false);
  const [gameRunning, setGameRunning] = React.useState(false);
  const [score, setScore] = React.useState({ left: 0, right: 0 });

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDLE_SPEED = 6;
  const resetBall = React.useCallback(() => {
    const game = gameStateRef.current;
    game.ball.x = CANVAS_WIDTH / 2;
    game.ball.y = CANVAS_HEIGHT / 2;
    game.ball.dx = Math.random() > 0.5 ? game.baseSpeed : -game.baseSpeed;
    game.ball.dy = (Math.random() - 0.5) * game.baseSpeed;
    game.rallies = 0; // Reset rally counter
  }, []);

  const updateGame = React.useCallback(() => {
    const game = gameStateRef.current;
    const { ball, leftPaddle, rightPaddle } = game;

    // Player paddle controls (both W/S and arrow keys control the left paddle)
    if ((game.keys.w || game.keys.up) && leftPaddle.y > 0) leftPaddle.y -= PADDLE_SPEED;
    if ((game.keys.s || game.keys.down) && leftPaddle.y < CANVAS_HEIGHT - leftPaddle.height) leftPaddle.y += PADDLE_SPEED;

    // Touch controls for player paddle (left side only)
    if (game.touches.left !== 0) {
      const targetY = game.touches.left - leftPaddle.height / 2;
      if (targetY > 0 && targetY < CANVAS_HEIGHT - leftPaddle.height) {
        leftPaddle.y = targetY;
      }
    }

    // AI paddle (right paddle) - follows the ball with some lag for difficulty
    const ballCenterY = ball.y;
    const paddleCenterY = rightPaddle.y + rightPaddle.height / 2;
    const aiSpeed = PADDLE_SPEED * 0.7; // Make AI slightly slower than player
    const aiReactionZone = CANVAS_WIDTH * 0.6; // AI only reacts when ball is past 60% of screen
    
    if (ball.x > aiReactionZone && ball.dx > 0) { // Only move when ball is coming towards AI
      if (ballCenterY < paddleCenterY - 10) { // Add some dead zone to make AI less perfect
        rightPaddle.y = Math.max(0, rightPaddle.y - aiSpeed);
      } else if (ballCenterY > paddleCenterY + 10) {
        rightPaddle.y = Math.min(CANVAS_HEIGHT - rightPaddle.height, rightPaddle.y + aiSpeed);
      }
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top/bottom
    if (ball.y <= ball.radius || ball.y >= CANVAS_HEIGHT - ball.radius) {
      ball.dy = -ball.dy;
    }

    // Ball collision with paddles
    if (ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
        ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + leftPaddle.height) {
      ball.dx = Math.abs(ball.dx);
      ball.dy += (ball.y - (leftPaddle.y + leftPaddle.height / 2)) * 0.1;
      
      // Increase speed after paddle hit
      game.rallies++;
      const speedMultiplier = 1 + (game.rallies * 0.05); // Increase by 5% per rally
      const maxSpeed = game.baseSpeed * 2.5; // Cap at 2.5x base speed
      
      ball.dx = Math.min(Math.abs(ball.dx) * speedMultiplier, maxSpeed) * Math.sign(ball.dx);
      ball.dy = ball.dy * speedMultiplier;
      if (Math.abs(ball.dy) > maxSpeed) {
        ball.dy = maxSpeed * Math.sign(ball.dy);
      }
    }

    if (ball.x + ball.radius >= rightPaddle.x &&
        ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + rightPaddle.height) {
      ball.dx = -Math.abs(ball.dx);
      ball.dy += (ball.y - (rightPaddle.y + rightPaddle.height / 2)) * 0.1;
      
      // Increase speed after paddle hit
      game.rallies++;
      const speedMultiplier = 1 + (game.rallies * 0.05); // Increase by 5% per rally
      const maxSpeed = game.baseSpeed * 2.5; // Cap at 2.5x base speed
      
      ball.dx = -Math.min(Math.abs(ball.dx) * speedMultiplier, maxSpeed);
      ball.dy = ball.dy * speedMultiplier;
      if (Math.abs(ball.dy) > maxSpeed) {
        ball.dy = maxSpeed * Math.sign(ball.dy);
      }
    }

    // Score
    if (ball.x < 0) {
      game.score.right++;
      resetBall();
      setScore({ ...game.score });
    } else if (ball.x > CANVAS_WIDTH) {
      game.score.left++;
      resetBall();
      setScore({ ...game.score });
    }
  }, [resetBall]);

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();

    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(game.leftPaddle.x, game.leftPaddle.y, game.leftPaddle.width, game.leftPaddle.height);
    ctx.fillRect(game.rightPaddle.x, game.rightPaddle.y, game.rightPaddle.width, game.rightPaddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw score
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(game.score.left.toString(), CANVAS_WIDTH / 4, 60);
    ctx.fillText(game.score.right.toString(), (3 * CANVAS_WIDTH) / 4, 60);
  }, []);

  const gameLoop = React.useCallback(() => {
    if (gameStateRef.current.gameRunning) {
      updateGame();
      draw();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [updateGame, draw]);

  const startGame = React.useCallback(() => {
    gameStateRef.current.gameRunning = true;
    setGameStarted(true);
    setGameRunning(true);
    resetBall();
    gameLoop();
  }, [gameLoop, resetBall]);

  const togglePause = React.useCallback(() => {
    if (gameStateRef.current.gameRunning) {
      // Pause the game
      gameStateRef.current.gameRunning = false;
      setGameRunning(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      // Resume the game
      gameStateRef.current.gameRunning = true;
      setGameRunning(true);
      gameLoop();
    }
  }, [gameLoop]);

  const stopGame = React.useCallback(() => {
    gameStateRef.current.gameRunning = false;
    setGameRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const resetGame = React.useCallback(() => {
    stopGame();
    gameStateRef.current.score = { left: 0, right: 0 };
    setScore({ left: 0, right: 0 });
    setGameStarted(false);
    setGameRunning(false);
    resetBall();
    draw();
  }, [stopGame, resetBall, draw]);

  // Keyboard event handlers
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const game = gameStateRef.current;
      const key = e.key.toLowerCase();
      
      // Only handle game keys when game is started
      if (gameStarted && ['w', 's', 'arrowup', 'arrowdown'].includes(key)) {
        e.preventDefault(); // Prevent page scroll when playing
        
        switch (key) {
          case 'w': game.keys.w = true; break;
          case 's': game.keys.s = true; break;
          case 'arrowup': game.keys.up = true; break;
          case 'arrowdown': game.keys.down = true; break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const game = gameStateRef.current;
      const key = e.key.toLowerCase();
      
      // Only handle game keys when game is started
      if (gameStarted && ['w', 's', 'arrowup', 'arrowdown'].includes(key)) {
        e.preventDefault(); // Prevent page scroll when playing
        
        switch (key) {
          case 'w': game.keys.w = false; break;
          case 's': game.keys.s = false; break;
          case 'arrowup': game.keys.up = false; break;
          case 'arrowdown': game.keys.down = false; break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted]);

  // Touch event handlers
  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      if (!touch) continue;
      
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      // Only allow touch control on the left side (player side)
      if (x < CANVAS_WIDTH / 2) {
        gameStateRef.current.touches.left = y;
      }
    }
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    gameStateRef.current.touches.left = 0;
    gameStateRef.current.touches.right = 0;
  }, []);

  // Initialize canvas
  React.useEffect(() => {
    draw();
  }, [draw]);

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="pong-game-container">
      <div className="pong-game-header">
        <h3>🏓 Pong vs AI</h3>
        <div className="pong-score">
          Player: {score.left} | AI: {score.right}
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="pong-canvas"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchMove}
      />
      
      <div className="pong-controls">
        <div className="pong-buttons">
          {!gameStarted ? (
            <button onClick={startGame} className="pong-btn pong-btn-start">
              Start Game
            </button>
          ) : (
            <button onClick={togglePause} className="pong-btn pong-btn-pause">
              {gameRunning ? 'Pause' : 'Resume'}
            </button>
          )}
          <button onClick={resetGame} className="pong-btn pong-btn-reset">
            Reset
          </button>
        </div>
        
        <div className="pong-instructions">
          <div className="desktop-controls">
            <strong>Desktop:</strong> Use W/S keys or ↑/↓ arrow keys to move your paddle
          </div>
          <div className="mobile-controls">
            <strong>Mobile:</strong> Touch the left side of the game area to control your paddle
          </div>
        </div>
      </div>
    </div>
  );
};

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
  UnderConstructionNotice,
  PongGame,
};