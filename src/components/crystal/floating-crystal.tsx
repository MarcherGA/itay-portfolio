import { a, useSpring } from "@react-spring/three";
import { Float, useGLTF, useTexture } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Group } from "three";
import { HitboxMesh } from "../hitbox-mesh";

type Props = {
  position: THREE.Vector3;
  rotation: [number, number, number];
  iconTextureUrl: string;
  modelUrl?: string;
  href?: string;
  visible?: boolean;
};

const BLOOM_LAYER = 1;


export function FloatingCrystal({
  position: finalPosition,
  rotation,
  iconTextureUrl,
  modelUrl = "models/crystals/crystal_0.glb",
  href,
  visible = false,
}: Props) {
  const groupRef = useRef<Group>(null!);
  const gltf = useGLTF(modelUrl);
  const texture = useTexture(iconTextureUrl);
  const [hitboxEnabled, setHitboxEnabled] = useState(false);

  const emissiveMaterialRef = useRef(
    new THREE.MeshToonMaterial({
      color: "#00aaff",
      emissive: "#00ffff",
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    })
  );

  // Apply material to all meshes once
  useEffect(() => {
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = emissiveMaterialRef.current;
        mesh.layers.enable(BLOOM_LAYER);
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });
  }, [gltf.scene]);

  // spring only triggered when visible is set to true
  const [spring, api] = useSpring(() => ({
    from: { position: [0.4, 1.5, 0] },
    config: { tension: 200, friction: 20 },
  }));

  useEffect(() => {
    if (visible) {
      api.start({
        to: { position: [finalPosition.x, finalPosition.y, finalPosition.z] },
        onStart: () => {
          if (groupRef.current) groupRef.current.visible = true;
        },
        onResolve: () => {
          setHitboxEnabled(true); // Enable after animation completes
        },
      });
    } else {
      api.start({
        to: { position: [0.4, 1.5, 0] },
        onStart: () => {
          setHitboxEnabled(false); // Disable during return animation
        },
        onResolve: () => {
          if (groupRef.current) groupRef.current.visible = false;
        },
      });
    }
  }, [visible, finalPosition, api]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!href) return;

    if (href.endsWith(".pdf") || href.endsWith(".zip")) {
      const link = document.createElement("a");
      link.href = href;
      link.download = href.split("/").pop() || "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(href, "_blank");
    }
  };

  const handlePointerEnter = () => {
    emissiveMaterialRef.current.emissiveIntensity = 2.5;
  };

  const handlePointerLeave = () => {
    emissiveMaterialRef.current.emissiveIntensity = 1.2;
  };

  return (
    <Float enabled={visible} speed={1.5} floatIntensity={0.2}>
      <a.group
        ref={groupRef}
        rotation={rotation}
        position={spring.position as any}
        layers={BLOOM_LAYER}
      >
        {/* Crystal */}
        <primitive object={gltf.scene} />

        {/* Hover hitbox */}
        <HitboxMesh
          enabled={hitboxEnabled}
          position={[0, 0.03, 0]}
          scale={[0.3, 0.53, 0.1]}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
        />

        {/* Icon */}
        <mesh layers={0} position={[0, 0.02, 0.01]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshBasicMaterial
            map={texture}
            transparent
            toneMapped={false}
            alphaTest={0.5}
          />
        </mesh>
      </a.group>
    </Float>
  );
}
