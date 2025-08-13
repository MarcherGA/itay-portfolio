import { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Split shader parts
import vertexMain from "@/shaders/cloud.vert?raw";
import fragmentMain from "@/shaders/cloud.frag?raw";
import snoise from "@/shaders/glsl-noise.glsl?raw";
import fbm3d from "@/shaders/glsl-fractal-brown-noise.glsl?raw";
import levels from "@/shaders/levels.glsl?raw";
import { useTexture } from "@react-three/drei";
import { sharedCloudPlane } from "../../three/shared";

const COUNT = 20;

export function Clouds() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeUniform = useRef({ value: 0 });

  const [shapeTexture, noiseTexture] = useTexture([
    "/textures/cloud/1.jpg",
    "/textures/cloud/2.jpg",
  ]);

  [shapeTexture, noiseTexture].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.anisotropy = 1;
  });

  const vertexShader = `${snoise}\n${vertexMain}`;
  const fragmentShader = `${snoise}\n${fbm3d}\n${levels}\n${fragmentMain}`;

  const seedArray = useMemo(() => {
    const data = new Float32Array(COUNT * 4);
    for (let i = 0; i < COUNT; i++) {
      data[i * 4 + 0] = Math.random() * 25.0;
      data[i * 4 + 1] = Math.random() * 6.0;
      data[i * 4 + 2] = Math.random() * 0.12;
      data[i * 4 + 3] = Math.random() * 0.06;
    }
    return data;
  }, []);

  const geometry = useMemo(() => {
    const geo = sharedCloudPlane;
    geo.setAttribute(
      "instanceSeed",
      new THREE.InstancedBufferAttribute(seedArray, 4)
    );
    return geo;
  }, [seedArray]);

  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const transforms = [];
    const minPhi = 0.9;    
    const maxPhi = Math.PI - minPhi;
  
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = minPhi + Math.random() * (maxPhi - minPhi);
      const r = 70 //+ Math.random() * 25;
  
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi) * 0.5; 
      const z = r * Math.sin(phi) * Math.sin(theta);
      const scale = 50 + Math.random() * 40;
  
      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale, 1);
      dummy.updateMatrix();
      transforms.push(dummy.matrix.clone());
    }
    return transforms;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < COUNT; i++) {
      meshRef.current.setMatrixAt(i, matrices[i]);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

      // Compute precise bounding sphere from all instances
  const positions = [];
  const dummy = new THREE.Object3D();
  
  for (let i = 0; i < COUNT; i++) {
    dummy.applyMatrix4(matrices[i]);
    positions.push(dummy.position.clone());
  }
  
  const boundingSphere = new THREE.Sphere();
  boundingSphere.setFromPoints(positions);
  
  
  meshRef.current.boundingSphere = boundingSphere;
  }, [matrices]);

  useFrame((state) => {
    timeUniform.current.value = state.clock.elapsedTime;
  });


  return (
    <instancedMesh
      ref={meshRef}
      geometry={geometry}
      args={[undefined, undefined, COUNT]}
      matrixAutoUpdate={false}
      frustumCulled
      renderOrder={-1}
      raycast={() => null}
    >
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTxtShape: { value: shapeTexture },
          uTxtCloudNoise: { value: noiseTexture },
          uTime: timeUniform.current,
          uTimeFactor1: { value: 0.002 },
          uTimeFactor2: { value: 0.1 },
          rotation: { value: 0 },
          center: { value: new THREE.Vector2(0.5, 0.5) },
        }}
        transparent
        alphaTest={0.01}
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </instancedMesh>
  );
}
