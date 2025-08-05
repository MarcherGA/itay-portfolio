// hooks/useGlowingMaterial.ts
import { useSpringValue } from '@react-spring/three';
import { useEffect, useRef } from 'react';
import { MeshStandardMaterial, Color, Texture } from 'three';

export function useGlowingMaterial(isGlowing: boolean, map?: Texture) {
  const matRef = useRef<MeshStandardMaterial>(null!);

  const emissiveIntensity = useSpringValue(0.1, {
    onChange: () => {
      matRef.current.emissiveIntensity = emissiveIntensity.get();
    },
  });

  const emissiveColor = useSpringValue('#000000', {
    onChange: () => {
      matRef.current.emissive.set(new Color(emissiveColor.get()));
    },
  });

  const opacity = useSpringValue(0, {
    onChange: () => {
      matRef.current.opacity = opacity.get();
    },
  });

  useEffect(() => {
    let disposed = false;

    const animate = async () => {
      emissiveColor.stop();
      emissiveIntensity.stop();
      opacity.stop();

      if (isGlowing) {
        await opacity.start({ to: 1, config: { duration: 500 } });
        if (disposed) return;
        emissiveColor.start({ to: '#00ffff', config: { duration: 800 } });
        emissiveIntensity.start({ to: 2.0, config: { duration: 800 } });
      } else {
        await Promise.all([
          emissiveColor.start({ to: '#000000', config: { duration: 800 } }),
          emissiveIntensity.start({ to: 0.1, config: { duration: 800 } }),
        ]);
        if (disposed) return;
        await opacity.start({ to: 0, config: { duration: 800 } });
      }
    };

    animate();

    return () => {
      disposed = true;
    };
  }, [isGlowing]);

  return {
    matRef,
    materialProps: {
      ref: matRef,
      map,
      transparent: true,
      emissive: '#000000',
      emissiveIntensity: 0.1,
      opacity: 0,
    },
  };
}
