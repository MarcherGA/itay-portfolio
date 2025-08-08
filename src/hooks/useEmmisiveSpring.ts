import { useSpring } from "@react-spring/three";
import { RefObject, useMemo } from "react";
import { MeshToonMaterial } from "three";

export function useEmissiveSpring(materialRef: RefObject<MeshToonMaterial | null>, baseColor: string) {
    const springConfig = useMemo(() => ({
        mass: 1,
        tension: 120,
        friction: 20,
      }), []);

    const { emissiveIntensity } = useSpring({
      emissiveIntensity: 1,
      onChange: () => {
        if (materialRef.current) materialRef.current.emissiveIntensity = emissiveIntensity.get();
      },
      config: springConfig,
    });
  
    const { color } = useSpring({
      color: baseColor,
      onChange: () => {
        materialRef.current?.emissive.set(color.get());
      },
      config: springConfig,
    });
  
    return { emissiveIntensity, color };
  }
  