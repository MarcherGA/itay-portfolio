import Stats from 'stats.js';
import { useEffect } from 'react';

export function useStatsOverlay() {
  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(0); // 0 = FPS
    document.body.appendChild(stats.dom);

    const animate = () => {
      stats.begin();
      stats.end();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    return () => {
      document.body.removeChild(stats.dom);
    };
  }, []);
}
