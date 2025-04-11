import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import content from './content.json'
import './synthwaveText.css'

function AboutModal() {
    const { scrollYProgress } = useScroll();
          const xProgress = useTransform(
    scrollYProgress,
    [0, 0.35],
    ["0%", "-150%"]
  );

  const contentRef = useRef(content)

  return (
    <motion.div style={{x: (xProgress) }}
    className="fixed flex items-center justify-center left-[10%] md:left-[15%] w-[55%] sm:w-1/2 h-3/5 top-[20%] -translate-y-1/2 z-20">
      <div className="card w-full h-full z-30 align-middle bg-black bg-opacity-80 place-content-center rounded-3xl text-center px-4 border-4 border-pink-800">
        <header className="block top-0">
          <div className='retro-banner'>
            <h1 className='retro-text1 text-3xl sm:text-5xl md:text-6xl xl:text-8xl 3xl:text-9xl'>
              <span>Itay Levy</span>
              <span>Itay Levy</span>
            </h1>
            <h2 className='neon-text text-xl sm:text-2xl md:text-3xl xl:text-5xl 3xl:text-6xl pt-5'>Fullstack & Game Developer</h2>
          </div>
        </header>

        <section className="text-base  font-exo pt-10 px-1 sm:px-4 text-white font-medium">
          <p>{contentRef.current.About}</p>
        </section>


        {/* <footer className="App-footer">
          <p>&copy; 2023 Itay Levi. All rights reserved.</p>
        </footer> */}
      </div>
    </motion.div>
  );
}

export default AboutModal;
