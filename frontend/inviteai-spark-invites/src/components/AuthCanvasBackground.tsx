import { useEffect, useRef } from 'react';

const AuthCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Responsive resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    // Animation state
    const dots: { x: number; y: number; r: number; dx: number; dy: number; color: string }[] = [];
    const colors = [
      '#6366f1', '#8b5cf6', '#f472b6', '#38bdf8', '#facc15', '#34d399', '#f87171', '#fbbf24', '#a3e635', '#f472b6'
    ];
    const DOTS_COUNT = Math.floor((width * height) / 9000);
    for (let i = 0; i < DOTS_COUNT; i++) {
      const r = Math.random() * 32 + 16;
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r,
        dx: (Math.random() - 0.5) * 0.7,
        dy: (Math.random() - 0.5) * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Animation loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const dot of dots) {
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.shadowColor = dot.color;
        ctx.shadowBlur = 32;
        ctx.fill();
        ctx.restore();
        // Move
        dot.x += dot.dx;
        dot.y += dot.dy;
        // Bounce
        if (dot.x < -dot.r) dot.x = width + dot.r;
        if (dot.x > width + dot.r) dot.x = -dot.r;
        if (dot.y < -dot.r) dot.y = height + dot.r;
        if (dot.y > height + dot.r) dot.y = -dot.r;
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
};

export default AuthCanvasBackground; 