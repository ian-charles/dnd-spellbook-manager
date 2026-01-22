import { useState, useEffect } from 'react';
import './ViewportToggle.css';

export function ViewportToggle() {
  const [forceMobile, setForceMobile] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (forceMobile) {
      root.classList.add('force-mobile-view');
    } else {
      root.classList.remove('force-mobile-view');
    }
  }, [forceMobile]);

  return (
    <div className="viewport-toggle">
      <button
        onClick={() => setForceMobile(!forceMobile)}
        className={`viewport-toggle-btn ${forceMobile ? 'active' : ''}`}
        title="Toggle mobile/desktop view for testing"
      >
        {forceMobile ? '📱 Mobile' : '🖥️ Desktop'}
      </button>
    </div>
  );
}
