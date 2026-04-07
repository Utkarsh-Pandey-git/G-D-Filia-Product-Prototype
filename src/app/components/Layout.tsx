import { Outlet } from 'react-router';
import { DebugPanel } from './DebugPanel';
import { useState, useEffect } from 'react';

export const Layout = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      // 812px phone height + 52px for label + 8px padding
      const available = window.innerHeight - 60;
      setScale(Math.min(1, available / 812));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col items-center justify-center gap-2 px-4 py-3">
      {/* Label above phone */}
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-2 flex-shrink-0">
        G+D Filia - Product Prototype
      </p>

      {/* Scaled phone wrapper - outer div reserves the scaled height/width so layout doesn't collapse */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: `${390 * scale}px`,
          height: `${812 * scale}px`,
        }}
      >
        {/* Actual phone frame - fixed 390×812, scaled via transform */}
        <div
          className="absolute top-0 left-0 rounded-[2.5rem] shadow-2xl overflow-hidden"
          style={{
            width: '390px',
            height: '812px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50" />
          {/* Content - fixed height so h-full works in children */}
          <div className="w-full h-full overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>

      <DebugPanel />
    </div>
  );
};
