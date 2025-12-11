import { Info, Heart } from 'lucide-react';
import './Footer.css';

interface FooterProps {
  onAboutClick: () => void;
}

export function Footer({ onAboutClick }: FooterProps) {
  return (
    <footer className="app-footer">
      <button
        className="footer-button footer-button-about"
        onClick={onAboutClick}
        aria-label="About The Spellbookery"
      >
        <Info size={20} />
        <span>About</span>
      </button>
      <a
        href="https://ko-fi.com/iantheguy"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-button footer-button-donate"
        aria-label="Support on Ko-fi"
      >
        <Heart size={20} />
        <span>Donate</span>
      </a>
    </footer>
  );
}
