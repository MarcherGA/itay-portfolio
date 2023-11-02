import { ReactNode } from 'react';
import './SynthwaveBackground.css';

interface SynthwaveBackgroundProps {
    children: ReactNode;
  }
  

const SynthwaveBackground: React.FC<SynthwaveBackgroundProps> = ({ children }) => {
  return (
    <div className="animated-background">
      {children}
    </div>
  );
}

export default SynthwaveBackground;
