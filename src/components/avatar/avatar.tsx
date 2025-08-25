import React, { useRef, useEffect, useMemo, useCallback, useState, forwardRef, useImperativeHandle, JSX } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import SpeechBubble from './speech-bubble';
import { Vector3 } from 'three';
import content from "../../data/content.json";
import { HitboxMesh } from '../hitbox-mesh';
import { TypingAnimation } from '../../hooks/useTypingAnimation';

const skeletonClone = SkeletonUtils.clone;

type AvatarProps = {
  onClick?: () => void;
  isFocused: boolean;
  position?: Vector3;
} & JSX.IntrinsicElements['group'];


const Avatar = forwardRef< { group: THREE.Group | null }, AvatarProps >(({ onClick, isFocused, position, ...props }, ref) => {
  const { scene: glbScene, animations } = useGLTF('/models/avatar.glb');
  const avatar = useMemo(() => {
    const cloned = skeletonClone(glbScene);
    glbScene.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        const mesh = c as THREE.Mesh;
        mesh.raycast = () => null as any;
        const src = mesh.material as THREE.MeshStandardMaterial;
        mesh.material = new THREE.MeshToonMaterial({
          color: src.color,
          map: src.map ?? null,
        });
      }
    });
    return cloned;
  }, [glbScene]);

  const [hovered, setHovered] = useState(false);


  const group = useRef<THREE.Group>(null);

  // Expose the inner group ref to the parent via ref
  useImperativeHandle(ref, () => ({
    group: group.current,
  }), []);

  const handleClick = () => {
    onClick?.();
  };

  const { actions } = useAnimations(animations, group);

  const idleRef = useRef<THREE.AnimationAction | null>(null);
  const waveRef = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    if (!actions) return;
    idleRef.current = actions['Idle'] ?? Object.values(actions)[0] ?? null;
    waveRef.current = actions['Waving'] ?? null;

    idleRef.current
      ?.reset()
      .setLoop(THREE.LoopRepeat, Infinity)
      .fadeIn(0.3)
      .play();
  }, [actions]);

  const handlePointerEnter = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(true);

    const idle = idleRef.current;
    const wave = waveRef.current;
    if (!idle || !wave || wave.isRunning()) return;

    wave.clampWhenFinished = true;
    idle.crossFadeTo(wave, 0.4, false);
    wave.reset().play();

    const duration = wave.getClip().duration;
    setTimeout(() => {
      wave.crossFadeTo(idle, 0.4, false);
      idle.reset().play();
    }, duration * 0.9 * 1000);
  }, []);

  const handlePointerLeave = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(false);
  }, []);

  useEffect(() => {
    if (!isFocused) {
      setHovered(false)
    }
  }, [isFocused]);

  const speechProps = useMemo(() => ({
    hoverText: "Hi!",
    expandedText: content.About,
    showOnHover: hovered || isFocused,
    expanded: isFocused,
    expandDelay: 0,
    typingAnimation: 'blinking-line' as TypingAnimation,
    expandScaleSpeed: 6,
  }), [hovered, isFocused]);

  return (
    <group ref={group} position={position} {...props} dispose={null}>
      {/* Avatar mesh */}
      <primitive object={avatar} dispose={null} />

      {/* Hitbox */}
      <HitboxMesh
        enabled={!isFocused}
        position={[0, 0.95, 0.02]}
        scale={[0.7, 1.85, 0.45]}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      />

      <SpeechBubble {...speechProps} />
    </group>
  );
});

useGLTF.preload('/models/avatar.glb');

export default React.memo(Avatar, (prev, next) => {
  const sameFocus = prev.isFocused === next.isFocused;
  const samePosition =
    prev.position && next.position
      ? prev.position.equals(next.position)
      : prev.position === next.position;

  return sameFocus  && samePosition;
});
