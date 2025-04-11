import { ReactNode, useRef, useState } from 'react';
import './SynthwaveBackground.css';
import { motion, useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion';

interface SynthwaveBackgroundProps {
    children: ReactNode;
  }
  

const SynthwaveBackground: React.FC<SynthwaveBackgroundProps> = ({ children }) => {

  const [isOn, setIsOn] = useState(false);
  const [isUp, setIsUp] = useState(false);
  let lastScroll = useRef(0);

  const {scrollYProgress} = useScroll()
  useMotionValueEvent(scrollYProgress, 'change', (currentValue) => {
    if(!isOn)
    {
      //document.getElementById('background')?.style.setProperty('--outrun', '0')
      setIsOn(true)
    }
    if(lastScroll.current < currentValue) {
      setIsUp(true)
    }
    else {
      setIsUp(false)
    }
    lastScroll.current = currentValue
  })

  return (
    <motion.div id='background' className="animated-background flex flex-col h-full w-full overflow-x-hidden">
      {children}
    </motion.div>
  );
}

export default SynthwaveBackground;
