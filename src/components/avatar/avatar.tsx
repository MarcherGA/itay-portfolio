import { useRef, useEffect, useMemo, useCallback, JSX, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import SpeechBubble from './speech-bubble'
import { useCameraTransition } from '../../hooks/useCameraTransition'
import { Vector3 } from 'three'
import content from "../../data/content.json"
import { HitboxMesh } from '../hitbox-mesh'

const skeletonClone = SkeletonUtils.clone
type AvatarProps = {
  isFocused: boolean
  setIsFocused: (isFocused: boolean) => void
  position?: Vector3
} & JSX.IntrinsicElements['group']

const camPos = new Vector3(-5, 1.82, -0.54);
const lookAt = new Vector3(-5.836, 1.67, -1.075);

export default function Avatar({ isFocused, setIsFocused, position, ...props }: AvatarProps) {
  const { scene: glbScene, animations } = useGLTF('/models/avatar.glb')
  const avatar = useMemo(() => {
    const cloned = skeletonClone(glbScene)
    cloned.traverse((c) => {
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


  const cameraTransition = useCameraTransition()
  const handleClick = () => {
    const finalCamPos = position ? camPos.clone().add(position) : camPos
    const finalLookAt = position ? lookAt.clone().add(position) : lookAt
    cameraTransition(finalCamPos, finalLookAt)
    setIsFocused(true)
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

  return (
    <group ref={group} position={position} {...props} dispose={null}>
      {/* Avatar mesh */}
      <primitive object={avatar} />

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
        hoverText="Hi!" 
        expandedText={content.About}
        showOnHover={hovered} // OR set this to true always if you want it to fade in manually
        expanded={isFocused}
        expandDelay={1500}
        typingAnimation='blinking-line'
        expandScaleSpeed={6}
      />
    </group>
  )
}

useGLTF.preload('/models/avatar.glb')
