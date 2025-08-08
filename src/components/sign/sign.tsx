import { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mesh, Vector3 } from 'three';
import { useCameraTransition } from '../../hooks/useCameraTransition';
import ProjectsCarousel from '../projects-carousel/projetcs-carousel';
import { SignRunesOverlay } from './sign-runes-overlay';
import { HitboxMesh } from '../hitbox-mesh';
import React from 'react';

type SignProps = {
  mesh: Mesh | null;
  isFocused: boolean;
  setIsFocused: (v: boolean) => void;
} & JSX.IntrinsicElements['group'];

// These are relative to the mesh position
const SIGN_CAMERA_POSITION_OFFSET = new Vector3(-1.29, 0.66, 1.13);
const SIGN_LOOK_AT_OFFSET = new Vector3(-0.59, 0.38, 0.49);

function SignComponent({ mesh, isFocused, setIsFocused, ...props }: SignProps) {
  const transitionToSign = useCameraTransition();

  const [hovered, setHovered] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const meshRef = useRef<Mesh>(null!);

  useEffect(() => {
    if (mesh) meshRef.current = mesh;
  }, [mesh]);

  const handleClick = () => {
    if (isFocused || !mesh) return;

    const worldPosition = new Vector3();
    mesh.getWorldPosition(worldPosition);

    const cameraPosition = worldPosition.clone().add(SIGN_CAMERA_POSITION_OFFSET);
    const lookAtTarget = worldPosition.clone().add(SIGN_LOOK_AT_OFFSET);

    transitionToSign(cameraPosition, lookAtTarget, 1.5);
    setIsFocused(true);
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
