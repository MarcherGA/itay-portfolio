import { JSX, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Mesh } from 'three';
import ProjectsCarousel from '../projects-carousel/projetcs-carousel';
import { SignRunesOverlay } from './sign-runes-overlay';
import { HitboxMesh } from '../hitbox-mesh';
import React from 'react';

type SignProps = {
  mesh: Mesh | null;
  isFocused: boolean;
  onClick?: () => void;
} & JSX.IntrinsicElements['group'];

function SignComponent({ mesh, isFocused, onClick, ...props }: SignProps) {
  const [hovered, setHovered] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const meshRef = useRef<Mesh>(null!);

  useEffect(() => {
    if (mesh) meshRef.current = mesh;
  }, [mesh]);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handlePointerEnter = useCallback(() => setHovered(true), []);
  const handlePointerLeave = useCallback(() => setHovered(false), []);

  useEffect(() => {
    if (!isFocused) setHovered(false);
  }, [isFocused]);

  // Memoize hitbox props to prevent recreation on every render
  const hitboxProps = useMemo(() => ({
    enabled: !isFocused,
    rotation: [0, Math.PI * -0.1175, 0] as [number, number, number],
    position: [0, 0, -0.05] as [number, number, number],
    scale: [2.1, 2, 0.9] as [number, number, number],
    onClick: handleClick,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    parent: meshRef.current,
  }), [isFocused, handleClick, handlePointerEnter, handlePointerLeave, meshRef.current]);

  // Memoize carousel props
  const carouselProps = useMemo(() => ({
    rotation: [-16, -20.6, 0] as [number, number, number],
    position: [2.46, 1, -1.584] as [number, number, number],
    isFocused,
    hovered,
    onIndexChange: setCarouselIndex,
  }), [isFocused, hovered]);

  if (!mesh) return null;

  return (
    <group {...props} dispose={null}>
      {/* DON'T re-render the mesh - it's already part of the island scene */}
      {/* The mesh is already rendered in the island's <primitive object={scene} /> */}
      
      <SignRunesOverlay
        hovered={hovered}
        isFocused={isFocused}
        mesh={meshRef}
        carouselIndex={carouselIndex}
      />

      <HitboxMesh {...hitboxProps} />

      <ProjectsCarousel {...carouselProps} />

    </group>
  );
}

// Better memoization with specific comparison
export const Sign = React.memo(SignComponent, (prevProps, nextProps) => {
  return (
    prevProps.isFocused === nextProps.isFocused &&
    prevProps.mesh === nextProps.mesh &&
    prevProps.onClick === nextProps.onClick
  );
});