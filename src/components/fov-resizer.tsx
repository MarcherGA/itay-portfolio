import { useEffect, useMemo } from 'react';
import { useScreenSize } from '../hooks/useScreenSize';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';

export function FovResizer() {
  const { camera } = useThree();
  const [width] = useScreenSize();

  const baseFov = 60;
  const baseWidth = 1080;
  const minFov = 45;
  const maxFov = 80;

  const fov = useMemo(() => {
    // Scale proportionally
    const scaled = baseFov * (baseWidth / width);
    // Clamp so it doesn't get too extreme
    return Math.min(Math.max(scaled, minFov), maxFov);
  }, [width]);

  useEffect(() => {
    if ('fov' in camera) {
      const perspectiveCamera = camera as PerspectiveCamera;
      perspectiveCamera.fov = fov;
      perspectiveCamera.updateProjectionMatrix();
    }
  }, [camera, fov]);

  return null;
}
