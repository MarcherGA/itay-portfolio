import { JSX, useCallback, useEffect, useRef, useState } from 'react';
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

  const handleClick = () => {
    onClick?.();

  };

  const handlePointerEnter = useCallback(() => setHovered(true), []);
  const handlePointerLeave = useCallback(() => setHovered(false), []);

  useEffect(() => {
    if (!isFocused) setHovered(false);
  }, [isFocused]);

  if (!mesh) return null;

  return (
    <group {...props} dispose={null}>
      <primitive object={mesh} dispose={null}>
        <SignRunesOverlay
          hovered={hovered}
          isFocused={isFocused}
          mesh={meshRef}
          carouselIndex={carouselIndex}
        />

        <HitboxMesh
          enabled={!isFocused}
          rotation={[0, Math.PI * -0.1175, 0]}
          position={[0, 0, -0.05]}
          scale={[2.1, 2, 0.9]}
          onClick={handleClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        />
      </primitive>

      <ProjectsCarousel
        rotation={[-16, -20.6, 0]}
        position={[2.46, 1, -1.584]}
        isFocused={isFocused}
        hovered={hovered}
        onIndexChange={setCarouselIndex}
      />
    </group>
  );
}

export const Sign = React.memo(SignComponent);
