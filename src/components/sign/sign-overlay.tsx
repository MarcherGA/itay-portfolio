// components/SignGlowOverlay.tsx
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState, useMemo } from 'react';
import { Mesh, Object3D, BufferGeometry, Points} from 'three';
import * as THREE from 'three';
import { useSpring } from '@react-spring/three';

type Props = {
  mesh: Object3D;
  hovered: boolean;
};

export function SignGlowOverlay({ mesh, hovered }: Props) {
  const pointsRef = useRef<Points>(null);
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);

  const loader = new THREE.TextureLoader();
    const magicSparkTexture = loader.load('/textures/magic-spark.png');




  useEffect(() => {
    if (!mesh) return;

    let found = false;
    mesh.traverse((child) => {
      if (!found && (child as Mesh).isMesh) {
        const meshChild = child as Mesh;
        if (meshChild.geometry) {
          setGeometry(meshChild.geometry);
          const pos = meshChild.position;
          const rot = meshChild.rotation;
          const scl = meshChild.scale;
          setPosition([pos.x, pos.y, pos.z]);
          setRotation([rot.x, rot.y, rot.z]);
          setScale([scl.x, scl.y, scl.z]);
          found = true;
          console.log('Found mesh geometry with', meshChild.geometry.attributes.position?.count, 'vertices');
        }
      }
    });
  }, [mesh]);

  // Generate simple particle geometry for testing
  const particleGeometry = useMemo(() => {
    if (!geometry) return null;

    const positions: number[] = [];
    const colors: number[] = [];
    const sparkCount = 100; // Reduced for debugging

    // Sample points along the geometry perimeter
    const positionAttribute = geometry.attributes.position;
    if (positionAttribute) {
      console.log('Creating particles from geometry with', positionAttribute.count, 'vertices');
      
      for (let i = 0; i < sparkCount; i++) {
        const index = Math.floor((i / sparkCount) * positionAttribute.count);
        const x = positionAttribute.getX(index);
        const y = positionAttribute.getY(index);
        const z = positionAttribute.getZ(index);
        
        positions.push(x, y, z);
        
        // Add bright colors for visibility
        colors.push(1, 1, 0/255); // Cyan
      }
      
      console.log('Generated positions:', positions.slice(0, 9));
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    
    console.log('Created particle geometry with', positions.length / 3, 'points');
    return geom;
  }, [geometry]);



  const { opacity } = useSpring({
    opacity: hovered ? 1 : 0,
    config: { duration: 800, tension: 120, friction: 14 }
  });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const positions = particleGeometry?.attributes.position;
  
    if (positions) {
        if (pointsRef.current?.material) {
            (pointsRef.current.material as THREE.PointsMaterial).opacity = opacity.get();
        }

        if(opacity.get() === 0) return;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);

        const intensity = 0.0001;// * Math.random();
        // const ySign = Math.random() ? 1 : -1;
        // const xSign = Math.random() ? 1 : -1;
  
        // Simple sine-based float
        positions.setY(i, (y + Math.sin(t * 2 + i) * intensity));
        positions.setX(i, (x + Math.sin(t * 1.5 + i) * intensity) );
      }
  
      positions.needsUpdate = true;
    }
  });

  if (!geometry || !particleGeometry) {
    console.log('No geometry available');
    return null;
  }

  console.log('Rendering points component');

  return (
    <group>
     <points
        ref={pointsRef}
        geometry={particleGeometry}
        position={position}
        rotation={rotation}
        scale={scale}
     >
        <pointsMaterial
        size={0.4} // Adjust to taste
        vertexColors
        transparent
        map={magicSparkTexture}
        opacity={0} // controlled by spring/useFrame
        depthWrite={false} // allows glow stacking
        blending={THREE.AdditiveBlending} // magic glow!
        sizeAttenuation
        />
        </points>
    </group>
  );
}