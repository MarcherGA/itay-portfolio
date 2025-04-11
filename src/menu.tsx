import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";


function Menu()
{
    const { scrollYProgress } = useScroll();

    const [selectedTab, setSelectedTab] = useState(0);
    useMotionValueEvent(scrollYProgress, "change", () => {
    if(scrollYProgress.get() >= 0 && scrollYProgress.get() <= 0.25 && selectedTab !== 0)
    {
        setSelectedTab(0)
    }
    if(scrollYProgress.get() >= 0.4 && scrollYProgress.get() <= 0.7 && selectedTab !== 1)
    {
        setSelectedTab(1)
    }
  })

  const onClick = (selectedTab: number) => {
    setSelectedTab(selectedTab);
  };
  
    return (
  <div className="fixed z-40 rounded-3xl border border-blue-900 bg-[#172554]  bg-opacity-85 p-2 space-y-5 top-4 left-5 right-0 w-fit min-w-[20%] font-exo">
    <ul className="flex items-center gap-1 text-base font-medium">
      <li className="flex-1">
        <a //todo add animation
          href="#section1"
          className={(selectedTab === 0 ? ' bg-yellow-200 shadow, text-black ' : 'text-gray-500 ') + " flex items-center justify-center rounded-2xl px-2 py-2 cursor-pointer hover:bg-yellow-200 hover:text-gray-700 hover:shadow"}
          onClick={() => onClick(0)}
        >
          About</a>
      </li>
      <li className="flex-1">
        <a
          href="#section2"
          className={(selectedTab === 1 ? ' bg-yellow-200 shadow, text-black ' : 'text-gray-500 ') + " flex items-center justify-center rounded-2xl px-2 py-2 cursor-pointer hover:bg-yellow-200 hover:text-gray-700 hover:shadow"}
          onClick={() => onClick(1)}
        >
          Projects</a>
      </li>
    </ul>
  </div>
    );
}

export default Menu;