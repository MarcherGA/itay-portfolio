import { useState, useEffect } from 'react';
import { useThemeStore } from '../hooks/useThemeStore';

interface LoadingScreenProps {
  loading: boolean;
  progress?: number;
}

const FUNNY_MESSAGES = [
  "Teaching pixels to behave...",
  "Convincing 3D models to cooperate...",
  "Bribing the GPU with coffee...",
  "Downloading more RAM... just kidding!",
  "Asking nicely for assets to load...",
  "Summoning the digital spirits...",
  "Calibrating the magic crystals...",
  "Negotiating with stubborn vertices...",
  "Waiting for the island to float properly...",
  "Teaching avatars how to wave...",
  "Polishing virtual dust particles...",
  "Convincing textures they look good...",
  "Herding digital cats...",
  "Waiting for WebGL to wake up...",
  "Debugging reality.exe...",
  "Installing patience drivers...",
  "Feeding the render pipeline...",
  "Optimizing quantum flux capacitors...",
  "Reticulating 3D splines...",
  "Calculating the meaning of life... 42%"
];

const randomMessageIndex = Math.floor(Math.random() * FUNNY_MESSAGES.length);

export function LoadingScreen({ loading }: LoadingScreenProps) {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';
  const [currentMessageIndex, setCurrentMessageIndex] = useState(randomMessageIndex);
  const [fadeClass, setFadeClass] = useState('fade-in');

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setFadeClass('fade-out');
      
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % FUNNY_MESSAGES.length);
        setFadeClass('fade-in');
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [loading]);

  if (!loading) return null;

  const backgroundStyle = isDark 
    ? { background: 'black' }
    : {
        background: 'linear-gradient(#0747ab, #a7b9c7)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite'
      };

  const textColor = isDark ? '#ffffff' : '#1a365d';

  return (
    <>
      <style>{`
        .loading-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 3vh;
          justify-content: center;
          align-items: center;
          z-index: 1;
          font-family: 'Arial', sans-serif;
        }

        .island-container {
          margin-bottom: -20px;
          animation: floatAndTilt 6s ease-in-out infinite;
        }

        .island-icon {
          width: 140px;
          height: auto;
          display: block;
        }

        /* Combined float and tilt animation */
        @keyframes floatAndTilt {
          0% { 
            transform: translateY(0px) rotate(0deg); 
          }
          25% { 
            transform: translateY(-8px) rotate(1deg); 
          }
          50% { 
            transform: translateY(-15px) rotate(0deg); 
          }
          75% { 
            transform: translateY(-8px) rotate(-1deg); 
          }
          100% { 
            transform: translateY(0px) rotate(0deg); 
          }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @font-face {
          font-family: MedievalSharp;
          src: url("/fonts/MedievalSharp-Regular.ttf") format("truetype");
        }

        .funny-message {
          color: ${textColor};
          font-family: 'MedievalSharp', Arial, sans-serif;
          font-style: italic;
          font-size: 20px;
          font-weight: 500;
          white-space: nowrap;
          text-align: center;
          transition: opacity 0.3s ease;
          text-shadow: ${isDark ? '0 2px 4px rgba(0,0,0,0.8)' : '0 2px 4px rgba(0,0,0,0.2)'};
          padding: 15px 30px;
          backdrop-filter: blur(10px);
        }

        .progress-container {
          width: 300px;
          height: 6px;
          background-color: ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
          border-radius: 3px;
          overflow: hidden;
          margin-top: 20px;
        }

        .progress-text {
          color: ${textColor};
          font-family: 'Arial', sans-serif;
          font-size: 14px;
          margin-top: 10px;
          opacity: 0.8;
        }

        .fade-in {
          opacity: 1;
        }

        .fade-out {
          opacity: 0;
        }

      `}</style>
      
      <div className="loading-container" style={backgroundStyle}>

        
        {/* Island icon with combined animation */}
        <div className="island-container">
          <img 
            src="/icons/floating-island-200.png" 
            alt="Island Icon" 
            className="island-icon"
            onError={(e) => {
              // Fallback to emoji if image doesn't load
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.innerHTML = '🏝️';
              fallback.style.fontSize = '140px';
              fallback.style.textAlign = 'center';
              e.currentTarget.parentNode?.appendChild(fallback);
            }}
          />
        </div>
        
        <div className={`funny-message ${fadeClass}`}>
          {FUNNY_MESSAGES[currentMessageIndex]}
        </div>

      </div>
    </>
  );
}