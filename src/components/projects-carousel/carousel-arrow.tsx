import { Text } from '@react-three/drei';
import { useState } from 'react';
import { useSpring, animated, SpringValue, to } from '@react-spring/three';
import { useHoverPointer } from '../../hooks/useHoverPointer';

const AnimatedText = animated(Text);

type CarouselArrowProps = {
  onClick: () => void;
  position: [number, number, number];
  rotation?: [number, number, number];
  label?: string;
  opacity?: SpringValue<number> | number;
};

export function CarouselArrow({
  onClick,
  position,
  rotation = [0, 0, 0],
  label = '→',
  opacity = 1,
}: CarouselArrowProps) {
  const [hovered, setHovered] = useState(false);
  const { showHoverPointer, hideHoverPointer } = useHoverPointer();

  const { color } = useSpring({
    color: hovered ? '#eee' : '#222',
    config: { tension: 100, friction: 15 },
  });

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

  const handleClick = (e: any) => {
    if (typeof isOpaque === 'boolean' && !isOpaque) return;
    e.stopPropagation();
    onClick();
  };

  return (
    <AnimatedText
      font="/fonts/MedievalSharp-Regular.ttf"
      fontSize={0.2}
      fillOpacity={opacity}
      outlineOpacity={opacity}
      color={color}
      anchorX="center"
      anchorY="middle"
      outlineColor="black"
      outlineWidth={0.01}
      position={position}
      rotation={rotation}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onClick={handleClick}
    >
      {label}
    </AnimatedText>
  );
}
