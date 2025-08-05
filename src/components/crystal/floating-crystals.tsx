// components/FloatingCrystals.tsx
import { FloatingCrystal } from "./floating-crystal";
import { contactLinks } from "../../data/contact-links";
import { Vector3 } from "three";
import { useGLTF } from "@react-three/drei";
type FloatingCrystalsProps = {
    position?: Vector3;
    rotation?: [number, number, number];
    visible?: boolean;
    parent?: any
};

for (let i = 0; i < 4; i++) {
    useGLTF.preload(`models/crystals/crystal_${i}.glb`);
  }

export function FloatingCrystals({position = new Vector3(0, 0, 0), rotation = [0, 0, 0], visible = false, parent}: FloatingCrystalsProps) {




  return (
    <group parent={parent} position={position}>
      {contactLinks.map((contactLink, idx) => (
        <FloatingCrystal
          key={idx}
          position={new Vector3(contactLink.position[0], contactLink.position[1], contactLink.position[2])}
          rotation={rotation}
          iconTextureUrl={contactLink.icon}
          href={contactLink.href}
          modelUrl={"models/crystals/crystal_"+idx % 4+".glb"}
          visible = {visible}
        />
      ))}
    </group>
  );
}
