import { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mesh, Vector3 } from 'three';
import { useCameraTransition } from '../../hooks/useCameraTransition';
import ProjectsCarousel from '../projects-carousel/projetcs-carousel';
import { SignRunesOverlay } from './sign-runes-overlay';
import { HitboxMesh } from '../hitbox-mesh';

type SignProps = {
  mesh: Mesh | null;
  isFocused: boolean;
  setIsFocused: (v: boolean) => void;
} & JSX.IntrinsicElements['group'];

export function Sign({ mesh, isFocused, setIsFocused, ...props }: SignProps) {
  const targetPosition = useMemo(() => new Vector3(-4.35, 1, -1.17), []);
  const lookAtTarget = useMemo(() => new Vector3(-3.65, 0.72, -1.81), []);
  const transitionToSign = useCameraTransition();

  const [hovered, setHovered] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const meshRef = useRef<Mesh>(null!);

  useEffect(() => {
    if (mesh) meshRef.current = mesh;
  }, [mesh]);

  const handleClick = () => {
    if (isFocused) return;
    transitionToSign(targetPosition, lookAtTarget, 1.5);
    setIsFocused(true);
  };

  const handlePointerEnter = useCallback(() => setHovered(true), []);
  const handlePointerLeave = useCallback(() => setHovered(false), []);

  useEffect(() => {
    if (!isFocused) {
      setHovered(false);
    }
  }, [isFocused]);

  if (!mesh) return null;

  return (
    <group {...props} dispose={null}>
      <primitive object={mesh}>
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
