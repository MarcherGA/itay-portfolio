import { useRef, useEffect, useMemo, useCallback, JSX, useState, memo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import SpeechBubble from './speech-bubble'
import { useCameraTransition } from '../../hooks/useCameraTransition'
import { Vector3 } from 'three'
import content from "../../data/content.json"
import { HitboxMesh } from '../hitbox-mesh'
import { TypingAnimation } from '../../hooks/useTypingAnimation'

const skeletonClone = SkeletonUtils.clone
type AvatarProps = {
  isFocused: boolean
  setIsFocused: (isFocused: boolean) => void
  position?: Vector3
} & JSX.IntrinsicElements['group']

const AVATAR_CAMERA_POSITION_OFFSET = new Vector3(1.844, 2.32, 2.14);
const AVATAR_LOOK_AT_OFFSET = new Vector3(1.008, 2.17, 1.6);


function Avatar({ isFocused, setIsFocused, position, ...props }: AvatarProps) {
  const { scene: glbScene, animations } = useGLTF('/models/avatar.glb')
  const avatar = useMemo(() => {
    const cloned = skeletonClone(glbScene)
    glbScene.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        const mesh = c as THREE.Mesh
        mesh.raycast = () => null as any
        const src = mesh.material as THREE.MeshStandardMaterial
        mesh.material = new THREE.MeshToonMaterial({
          color: src.color,
          map: src.map ?? null,
        })
      }
    })
    return cloned
  }, [glbScene])
  const [hovered, setHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false)


  const cameraTransition = useCameraTransition()
  const handleClick = () => {
    const finalCamPos = avatar.getWorldPosition(new Vector3()).add(AVATAR_CAMERA_POSITION_OFFSET)
    const finalLookAt = avatar.getWorldPosition(new Vector3()).add(AVATAR_LOOK_AT_OFFSET)
  
    setIsTransitioning(true) // 💡 start transition
  
    cameraTransition(finalCamPos, finalLookAt, undefined, undefined, () => {
      setIsFocused(true) // ✅ set focus AFTER transition
      setIsTransitioning(false) // ✅ done transitioning
    })
  }

  const group = useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, group)

  const idleRef = useRef<THREE.AnimationAction | null>(null)
  const waveRef = useRef<THREE.AnimationAction | null>(null)

  useEffect(() => {
    if (!actions) return
    idleRef.current = actions['Idle'] ?? Object.values(actions)[0] ?? null
    waveRef.current = actions['Waving'] ?? null

    idleRef.current?.reset()
      .setLoop(THREE.LoopRepeat, Infinity)
      .fadeIn(0.3)
      .play()
  }, [actions])


  const handlePointerEnter = useCallback((e: any) => {
    e.stopPropagation()
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
    e.stopPropagation()
    setHovered(false);
  }, [])

  const speechProps = useMemo(() => ({
    hoverText: "Hi!",
    expandedText: content.About,
    showOnHover: hovered || isTransitioning || isFocused,
    expanded: isFocused,
    expandDelay: 0,
    typingAnimation: 'blinking-line' as TypingAnimation,
    expandScaleSpeed: 6,
  }), [hovered, isFocused, isTransitioning]);
  

  return (
    <group ref={group} position={position} {...props} dispose={null}>
      {/* Avatar mesh */}
      <primitive object={avatar} dispose={null}/>

      {/* Hitbox */}
      <HitboxMesh
      enabled={!isFocused}
        position={[0, 0.95, 0.02]}
        scale={[0.7, 1.85, 0.45]}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      />

      <SpeechBubble 
        {...speechProps}
      />
    </group>
  )
}

useGLTF.preload('/models/avatar.glb')

export default memo(Avatar, (prev, next) => {
  const sameFocus = prev.isFocused === next.isFocused;
  const sameSetter = prev.setIsFocused === next.setIsFocused;
  const samePosition =
    prev.position && next.position
      ? prev.position.equals(next.position)
      : prev.position === next.position;

  return sameFocus && sameSetter && samePosition;
});
