import { motion, useScroll, useTransform } from 'framer-motion';

function NameBanner() {
    const { scrollYProgress } = useScroll();
          const xProgress = useTransform(
    scrollYProgress,
    [0, 0.35],
    ["-5%", "-100%"]
  );
  return (
    <div className='retro-banner w-full h-full'>
<div className="lines"></div>
<h1 className='retro-text1'>
  <span>Itay Levy</span>
  <span>Itay Levy</span>
</h1>
<h2 className='neon-text'>Fullstack Developer</h2>
</div>
  );
}

export default NameBanner;
