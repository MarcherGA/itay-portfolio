import { JSX, useEffect, useRef } from "react";
import { Mesh, Raycaster, Intersection, Object3D } from "three";
import { ThreeEvent } from "@react-three/fiber";
import { useHoverPointer } from "../hooks/useHoverPointer";
import { debugHitMaterial, sharedBoxGeometry } from "../three/shared";

type HitboxMeshProps = {
  debug?: boolean;
  enabled?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerEnter?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
} & JSX.IntrinsicElements["mesh"];



export function HitboxMesh({
  debug = false,
  enabled = true,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...props
}: HitboxMeshProps) {
  const meshRef = useRef<Mesh>(null!);

  const {showHoverPointer, hideHoverPointer} = useHoverPointer();


  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    showHoverPointer();
    onPointerEnter?.(e);
  };

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hideHoverPointer();
    onPointerLeave?.(e);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.(e);
  };

  // Store default raycast function for restoring
  const defaultRaycast = useRef<
    (raycaster: Raycaster, intersects: Intersection<Object3D>[]) => void
  >(null!);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!defaultRaycast.current) {
      defaultRaycast.current = mesh.raycast;
    }

    mesh.raycast = enabled
      ? defaultRaycast.current!
      : () => {}; // No-op disables raycasting
  }, [enabled]);

  useEffect(() => {
    if (!enabled) hideHoverPointer();
  }, [enabled]);

  return (
    <mesh
      ref={meshRef}
      visible={debug}
      onClick={enabled ? handleClick : undefined}
      onPointerEnter={enabled ? handlePointerEnter : undefined}
      onPointerLeave={enabled ? handlePointerLeave : undefined}
      material={debug ? debugHitMaterial : undefined}
      geometry={sharedBoxGeometry}
      {...props}
    >
    </mesh>
  );
}
