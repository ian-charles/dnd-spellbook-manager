import { useEffect, useRef } from 'react';
import { Coffee } from 'lucide-react';
import './AboutModal.css';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      if (modalRef.current) {
        modalRef.current.focus();
      }

      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="about-modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className="about-modal"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        <div className="about-modal-header">
          <h2 id="about-modal-title">About The Spellbookery</h2>
          <button
            className="about-modal-close"
            onClick={onClose}
            aria-label="Close about dialog"
          >
            ×
          </button>
        </div>
        <div className="about-modal-body">
          <div className="about-links">
            <a
              href="https://github.com/ian-charles/dnd-spellbook-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/ianbcharles/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>LinkedIn</span>
            </a>
            <a
              href="https://ko-fi.com/iantheguy"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link-button about-link-kofi"
            >
              <Coffee size={20} />
              <span>Ko-fi</span>
            </a>
          </div>
          <div className="about-avatar">
            <img src="/pixel-ian.png" alt="Pixel art of Ian waving hello" className="about-avatar-img" />
          </div>
          <p>
            Hey! My name's Ian, and thanks for checking out my little app!
          </p>
          <p>
            As a Dungeon Master and (currently funemployed) Product Manager, I put this tool together for a number of reasons:
          </p>
          <p className="about-reasons">
            …to learn more about web development in general<br />
            …to see what AI coding agents are really capable of doing<br />
            …to build my portfolio as a PM and prove that I actually have product vision<br />
            …and to have something better than the existing tools out there for DnD spellbook management, which I've found pretty frustrating to use as a DM.
          </p>
          <p>
            So if you're here as a fellow DM or player, welcome! And if you're here as a hiring manager, I'm available!
          </p>
          <p>
            But whoever you are, feel free to send me some feedback, check out the code, buy me a coffee, whatever!
          </p>
          <p className="about-signature">
            –Ian
          </p>
        </div>
        <div className="about-modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
