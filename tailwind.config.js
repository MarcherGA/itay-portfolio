/** @type {import('tailwindcss').Config} */

const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roadRage: ["Road Rage", "sans-serif"],
        exo: ["Exo", "sans-serif"],
      },
      cursor: {
        default: 'url(http://www.rw-designer.com/cursor-extern.php?id=173118), default',
        pointer: 'url(http://www.rw-designer.com/cursor-extern.php?id=173157), pointer',
      },
      screens: {
      '3xl': '1920px',
      '4xl': '2560px',
    },
    colors: {
      c1: 'hsl(219, 79%, 66%)',
      c2: 'hsl(319, 100%, 60%)',
      c3: 'hsl(266, 49%, 25%)',
      c4: 'hsl(60, 82%, 58%)',
      c5: 'hsl(0, 67%, 55%)',
      c6: 'hsl(213, 96%, 11%)',
    },
    keyframes: {
      outrun: {
        to: { '--outrun': '1' },
      },
    },
    animation: {
      outrun: 'outrun 0.6s linear infinite',
    },
    backgroundImage: {
      mtn: "url('../../assets/peak.png')",
      mtn2: "url('../../assets/mountains.png')",
      'lg-depth': "url('data:image/svg+xml;utf8,<svg width=\"1808\" height=\"230\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M904 -46 L-3616 230 M904 -46 L-3254.4 230 M904 -46 L-2892.8 230 M904 -46 L-2531.2000000000003 230 M904 -46 L-2169.6000000000004 230 M904 -46 L-1808 230 M904 -46 L-1446.4 230 M904 -46 L-1084.8000000000002 230 M904 -46 L-723.2 230 M904 -46 L-361.6 230 M904 -46 L0 230 M904 -46 L361.6 230 M904 -46 L723.2 230 M904 -46 L1084.8000000000002 230 M904 -46 L1446.4 230 M904 -46 L1808 230 M904 -46 L2169.6000000000004 230 M904 -46 L2531.2000000000003 230 M904 -46 L2892.8 230 M904 -46 L3254.4 230 M904 -46 L3616 230 M904 -46 L3977.6000000000004 230 M904 -46 L4339.200000000001 230 M904 -46 L4700.8 230 M904 -46 L5062.400000000001 230 M904 -46 L5424 230\" stroke=\"cornflowerblue\" stroke-width=\"2\" vector-effect=\"non-scaling-stroke\" /></svg>')",
    },
    },
  },
  plugins: [],
}
)
