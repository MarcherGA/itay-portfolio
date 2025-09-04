import { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Split shader parts
import vertexMain from "@/shaders/cloud.vert?raw";
import fragmentMain from "@/shaders/cloud.frag?raw";
import vertexMobile from "@/shaders/cloud-mobile.vert?raw";
import fragmentMobile from "@/shaders/cloud-mobile.frag?raw";
import snoise from "@/shaders/glsl-noise.glsl?raw";
import fbm3d from "@/shaders/glsl-fractal-brown-noise.glsl?raw";
import levels from "@/shaders/levels.glsl?raw";
import { useTexture } from "@react-three/drei";
import { sharedCloudPlane } from "../../three/shared";

// Detect mobile device
const IS_MOBILE = typeof navigator !== 'undefined' && 
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Reduce count for mobile
const COUNT = IS_MOBILE ? 20 : 30;

export function Clouds() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeUniform = useRef({ value: 0 });
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [shapeTexture, noiseTexture] = useTexture([
    "/textures/cloud/1.jpg",
    "/textures/cloud/2.jpg",
  ]);

  // Optimize textures for mobile
  useEffect(() => {
    [shapeTexture, noiseTexture].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = 1;
      
      // Reduce texture size for mobile if needed
      if (IS_MOBILE && t.image) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxSize = 128; // Reduced from original size
        
        const scale = Math.min(maxSize / t.image.width, maxSize / t.image.height);
        canvas.width = t.image.width * scale;
        canvas.height = t.image.height * scale;
        
        ctx!.drawImage(t.image, 0, 0, canvas.width, canvas.height);
        t.image = canvas;
        t.needsUpdate = true;
      }
    });
  }, [shapeTexture, noiseTexture]);

  // Use simplified shaders for mobile devices
  const vertexShader = IS_MOBILE 
    ? vertexMobile 
    : `${snoise}\n${vertexMain}`;
  const fragmentShader = IS_MOBILE 
    ? fragmentMobile 
    : `${snoise}\n${fbm3d}\n${levels}\n${fragmentMain}`;

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
    const minPhi = 0.5;    
    const maxPhi = Math.PI - minPhi;
    
    // Use golden angle spiral for more even distribution
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
    
    for (let i = 0; i < COUNT; i++) {
      // Even distribution using golden angle spiral
      const theta = i * goldenAngle;
      
      // More even phi distribution using linear spacing with some randomization
      const phiProgress = i / (COUNT - 1);
      const phiRange = maxPhi - minPhi;
      const basePhi = minPhi + phiProgress * phiRange;
      
      // Add small random offset (much smaller than before) for natural look
      const phiOffset = (Math.random() - 0.5) * 0.2;
      const phi = Math.max(minPhi, Math.min(maxPhi, basePhi + phiOffset));
      
      const r = 70;
  
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi) * 0.5; 
      const z = r * Math.sin(phi) * Math.sin(theta);
      
      // More consistent scaling with less randomness
      const baseScale = 50;
      const scaleVariation = 20; // Reduced from 40
      const scale = baseScale + (Math.random() - 0.5) * scaleVariation;
  
      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale, 1);
      dummy.updateMatrix();
      transforms.push(dummy.matrix.clone());
    }
    return transforms;
  }, []);

  // Distance-based LOD system
  const lodSystem = useMemo(() => {
    return {
      distances: [50, 100, 150], // LOD distances
      counts: [COUNT, Math.floor(COUNT * 0.7), Math.floor(COUNT * 0.4), Math.floor(COUNT * 0.2)]
    };
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

  // Throttled frame updates for mobile
  const frameSkip = useRef(0);
  const maxFrameSkip = IS_MOBILE ? 2 : 0;

  useFrame((state) => {
    // Skip frames on mobile for better performance
    if (maxFrameSkip > 0) {
      frameSkip.current++;
      if (frameSkip.current < maxFrameSkip) return;
      frameSkip.current = 0;
    }

    timeUniform.current.value = state.clock.elapsedTime;

    // Distance-based LOD (optional)
    if (meshRef.current && state.camera) {
      const distance = state.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
      let targetCount = lodSystem.counts[0];
      
      for (let i = 0; i < lodSystem.distances.length; i++) {
        if (distance > lodSystem.distances[i]) {
          targetCount = lodSystem.counts[i + 1];
        }
      }
      
      if (meshRef.current.count !== targetCount) {
        meshRef.current.count = targetCount;
      }
    }
  });

  // Memoized material to prevent recreations
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTxtShape: { value: shapeTexture },
        uTxtCloudNoise: { value: noiseTexture },
        uTime: timeUniform.current,
        uTimeFactor1: { value: 0.002 },
        uTimeFactor2: { value: 0.1 },
        rotation: { value: 0 },
        center: { value: new THREE.Vector2(0.5, 0.5) },
      },
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
      side: THREE.FrontSide,
      // Additional mobile optimizations
      precision: 'mediump', // Use medium precision on mobile
    });
  }, [vertexShader, fragmentShader, shapeTexture, noiseTexture]);

  return (
    <instancedMesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      args={[undefined, undefined, COUNT]}
      matrixAutoUpdate={false}
      frustumCulled
      renderOrder={-1}
      raycast={() => null}
    />
  );
}
