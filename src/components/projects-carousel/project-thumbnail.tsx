import { a, SpringValue } from "@react-spring/three";
import { useHoverPointer } from "../../hooks/useHoverPointer";
import { Texture } from "three";
import { useCallback } from "react";

const AnimatedMeshBasicMaterial = a.meshBasicMaterial as unknown as React.FC<any>;

type Props = {
  focused?: boolean;                 // interactive?
  link?: string;
  texture?: Texture;
  opacity?: SpringValue<number> | number;
};

export function ProjectThumbnail({ focused = false, link, texture, opacity }: Props) {
  const { showHoverPointer, hideHoverPointer } = useHoverPointer();

  const handleClick = useCallback(() => {
    if(focused && link)
         window.open(link, "_blank");
        }, [focused, link]);

  return (
    <mesh
      scale={0.4}
      position={[0, 0.07, 0.01]}
      onClick={handleClick}
      onPointerEnter={focused ? showHoverPointer : undefined}
      onPointerLeave={focused ? hideHoverPointer : undefined}
    >
      <planeGeometry args={[1.5, 0.9]} />
      <AnimatedMeshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}
