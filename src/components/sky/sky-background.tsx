import { useRef, useMemo } from 'react';
import { BackSide, Color, Mesh } from 'three';
import { useRawData } from '../../hooks/useRawData';

import vertex from '@/shaders/default.vert';
import fragment from '@/shaders/environment.frag';

export default function SkyBackground() {
  const mesh = useRef<Mesh>(null);
  const colorSteps = useRawData('colors.gradients');
  const radius = 150;

  const uniforms = useMemo(() => ({
    uTopColor: { value: new Color(colorSteps[0].top) },
    uBottomColor: { value: new Color(colorSteps[0].bottom) },
    uSpot1Color: { value: new Color(colorSteps[0].spot1) },
    uSpot1Position: { value: [0.4, 0.7] },
    uSpot2Color: { value: new Color(colorSteps[0].spot2) },
    uSpot2Position: { value: [0.6, 0.4] },
  }), []);

  return (
    <mesh ref={mesh} rotation={[0, Math.PI * 1.2, 0.12]}>
      <sphereGeometry args={[radius, 30, 30]} />
      <shaderMaterial
        args={[{
          uniforms,
          vertexShader: vertex,
          fragmentShader: fragment,
        }]}
        side={BackSide}
      />
    </mesh>
  );
}
