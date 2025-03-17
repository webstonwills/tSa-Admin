import React, { useState, useEffect } from 'react';

interface PerformanceStats {
  fps: number;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  } | null;
  lastRenderTime: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const PerformanceMonitor: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    memory: null,
    lastRenderTime: performance.now(),
  });

  useEffect(() => {
    if (!visible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const updateStats = () => {
      const now = performance.now();
      frameCount++;

      // Update FPS every second
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        
        // Get memory info if available
        const memory = (window.performance as any).memory 
          ? {
              usedJSHeapSize: (window.performance as any).memory.usedJSHeapSize,
              totalJSHeapSize: (window.performance as any).memory.totalJSHeapSize,
            }
          : null;

        setStats({
          fps,
          memory,
          lastRenderTime: now - stats.lastRenderTime,
        });

        frameCount = 0;
        lastTime = now;
      }

      rafId = requestAnimationFrame(updateStats);
    };

    rafId = requestAnimationFrame(updateStats);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [visible, stats.lastRenderTime]);

  if (!visible) return null;

  // Memory percentage calculation
  const memoryPercentage = stats.memory 
    ? Math.round((stats.memory.usedJSHeapSize / stats.memory.totalJSHeapSize) * 100) 
    : 0;

  // Determine color based on performance
  const getFpsColor = (fps: number) => {
    if (fps >= 50) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (percentage: number) => {
    if (percentage <= 70) return 'text-green-500';
    if (percentage <= 85) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 bg-black/80 text-white p-2 text-xs font-mono rounded-tr-md">
      <div className="grid grid-cols-2 gap-x-4">
        <span>FPS:</span> 
        <span className={getFpsColor(stats.fps)}>{stats.fps}</span>
        
        {stats.memory && (
          <>
            <span>Memory:</span>
            <span className={getMemoryColor(memoryPercentage)}>
              {formatBytes(stats.memory.usedJSHeapSize)} / {formatBytes(stats.memory.totalJSHeapSize)}
            </span>
          </>
        )}
        
        <span>Render Time:</span>
        <span>{stats.lastRenderTime.toFixed(2)}ms</span>
      </div>
      <div className="mt-1 text-[10px] text-gray-400">
        Press Alt+P to toggle
      </div>
    </div>
  );
};

export default PerformanceMonitor;

// Toggle component that can be added to App.tsx
export const PerformanceMonitorToggle: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+P to toggle visibility
      if (e.altKey && e.key === 'p') {
        setVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <PerformanceMonitor visible={visible} />;
}; 