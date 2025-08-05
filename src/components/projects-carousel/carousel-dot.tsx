import { Text } from '@react-three/drei';
import { useState } from 'react';
import { useSpring, animated, SpringValue, to } from '@react-spring/three';
import { useHoverPointer } from '../../hooks/useHoverPointer';

const AnimatedText = animated(Text);

type CarouselDotProps = {
  index: number;
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  position: [number, number, number];
  opacity?: SpringValue<number> | number;
};

export function CarouselDot({
  index,
  currentIndex,
  setCurrentIndex,
  position,
  opacity = 1,
}: CarouselDotProps) {
  const isActive = index === currentIndex;
  const [hovered, setHovered] = useState(false);
  const { showHoverPointer, hideHoverPointer } = useHoverPointer();

  const { scale, color } = useSpring({
    scale: hovered ? 1.4 : 1,
    color: isActive ? '#eee' : '#222',
    config: { tension: 300, friction: 20 },
  });

  // Convert opacity to a readable value (0-1), even if it's a SpringValue
  const isOpaque = typeof opacity === 'number'
    ? opacity === 1
    : to(opacity, (val) => val === 1);

  const handleEnter = () => {
    if (typeof isOpaque === 'boolean' && !isOpaque) return;
    setHovered(true);
    showHoverPointer();
  };

  const handleLeave = () => {
    setHovered(false);
    hideHoverPointer();
  };

  const handleClick = () => {
    if (typeof isOpaque === 'boolean' && !isOpaque) return;
    setCurrentIndex(index);
  };

  return (
    <AnimatedText
      position={position}
      scale={scale}
      font="/fonts/MedievalSharp-Regular.ttf"
      fillOpacity={opacity}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onClick={handleClick}
      fontSize={0.1}
      anchorX="center"
      anchorY="middle"
      color={color as any}
    >
      •
    </AnimatedText>
  );
}
