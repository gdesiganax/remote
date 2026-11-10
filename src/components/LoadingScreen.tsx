import { useEffect, useState } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Awakening the spirit...');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const statuses = [
      'Awakening the spirit...',
      'Sharpening the blade...',
      'Focusing the mind...',
      'Entering the dojo...',
      'Ready for battle...',
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 12 + 4;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setStatus('道 — The Way is open');
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 700);
        }, 600);
      }
      setProgress(Math.min(current, 100));
      const idx = Math.min(Math.floor(current / 20), statuses.length - 1);
      setStatus(statuses[idx]);
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-bg" />
      
      {/* Decorative corner marks */}
      <div className="corner top-left" />
      <div className="corner top-right" />
      <div className="corner bottom-left" />
      <div className="corner bottom-right" />

      <div className="loading-content">
        {/* Ninja / Katana SVG icon */}
        <div className="katana-wrapper">
          <svg
            className="katana-svg"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Circle */}
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="var(--crimson)"
              strokeWidth="1.5"
              strokeDasharray="8 6"
              className="orbit"
            />
            {/* Blade */}
            <path
              d="M30 75 L85 30"
              stroke="var(--ink)"
              strokeWidth="3"
              strokeLinecap="round"
              className="blade"
            />
            {/* Guard */}
            <path
              d="M28 72 L38 82"
              stroke="var(--gold)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Handle */}
            <path
              d="M25 78 L18 90"
              stroke="var(--crimson)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Tip glow */}
            <circle cx="85" cy="30" r="3" fill="var(--crimson)" className="tip" />
          </svg>
        </div>

        <h1 className="loading-title">侍</h1>
        <p className="loading-romaji">AFEEZ LUKMON</p>

        <div className="progress-container">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-meta">
            <span className="progress-status">{status}</span>
            <span className="progress-percent">{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Slash effect on exit */}
      {fadeOut && <div className="exit-slash" />}
    </div>
  );
}
