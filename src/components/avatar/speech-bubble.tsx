import { Billboard, Text, useTexture } from '@react-three/drei'
import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import '../../materials/nine-slice-material'
import { TypingAnimation, useTypingAnimation } from '../../hooks/useTypingAnimation'
import { useHoverPointer } from '../../hooks/useHoverPointer'

// ─────────────────────────────────────────────────────────────
// CONSTANTS OUTSIDE COMPONENT
// ─────────────────────────────────────────────────────────────

const originalY = 1.75
const bottomY = originalY - 0.1
const radius = -0.4
const originalX = -0.4
const baseScale = 1.0
const expandedScaleX = 2.5
const expandedScaleY = 1.6
const expandedOffsetX = -0.7
const expandedOffsetY = -0.45

type Props = {
  hoverText?: string
  expandedText?: string
  showOnHover?: boolean
  expanded?: boolean
  expandDelay?: number
  typingAnimation?: TypingAnimation
  typingSpeed?: number
  hoverScaleSpeed?: number
  expandScaleSpeed?: number
  onExpandComplete?: () => void
}

export default function SpeechBubble({
  hoverText = 'Hi',
  expandedText = "...",
  showOnHover = true,
  expanded = false,
  expandDelay = 1500,
  typingAnimation = 'blinking-cursor',
  typingSpeed = 55,
  hoverScaleSpeed = 6,
  expandScaleSpeed = 8,
  onExpandComplete,
}: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const textRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const texture = useTexture('/textures/bubble-speech.png')

  const hoverScale = useRef(0)
  const expandScale = useRef(0)
  const lastMaterialScale = useRef(new THREE.Vector2())
  const lastTextScale = useRef(new THREE.Vector2())
  const [shouldExpand, setShouldExpand] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(false)
  const [expandCompleteFired, setExpandCompleteFired] = useState(false)

  const {
    displayedText,
    isTyping,
    showCursor,
    cursorChar,
    skipTyping: handleSkipTyping,
  } = useTypingAnimation({
    text: expandedText,
    shouldStart: shouldExpand,
    animationType: typingAnimation,
    typingSpeed,
  })

  const { showHoverPointer, hideHoverPointer } = useHoverPointer()
  const typingDone = shouldExpand && !isTyping && displayedText === expandedText

  const displayText = useMemo(() => {
    if (!shouldExpand) return hoverText
    let text = displayedText
    if (isTyping && showCursor) text += cursorChar
    return text
  }, [hoverText, shouldExpand, displayedText, isTyping, showCursor, cursorChar])

  const textProps = useMemo(() => ({
    position: [-0.01, 0.09, 0.01] as [number, number, number],
    fontSize: shouldExpand ? 0.08 : 0.2,
    maxWidth: shouldExpand ? 2.8 : 0.8,
  }), [shouldExpand])

  const cornerUniforms = useMemo(() => ({
    uCornerLeft: 0.48,
    uCornerRight: 0.48,
    uCornerTop: 0.47,
    uCornerBottom: 0.47,
  }), [])

  useEffect(() => {
    if (expanded) {
      const timer = setTimeout(() => setShouldExpand(true), expandDelay)
      return () => clearTimeout(timer)
    } else {
      setShouldExpand(false)
    }
  }, [expanded, expandDelay])

  useEffect(() => {
    if (cursorVisible && typingDone) {
      hideHoverPointer()
      setCursorVisible(false)
    }
    if (typingDone && !expandCompleteFired) {
      onExpandComplete?.()
      setExpandCompleteFired(true)
    }
    if (!expanded) {
      setExpandCompleteFired(false)
    }
  }, [typingDone, cursorVisible, hideHoverPointer, onExpandComplete, expandCompleteFired, expanded])

  useFrame((_, delta) => {
    const hoverTarget = showOnHover ? 1 : 0
    const expandTarget = shouldExpand ? 1 : 0

    const prevH = hoverScale.current
    const prevE = expandScale.current

    hoverScale.current = THREE.MathUtils.damp(prevH, hoverTarget, hoverScaleSpeed, delta)
    expandScale.current = THREE.MathUtils.damp(prevE, expandTarget, expandScaleSpeed, delta)

    // 🧠 Bail early if no changes
    if (
      Math.abs(prevH - hoverScale.current) < 0.0001 &&
      Math.abs(prevE - expandScale.current) < 0.0001
    ) {
      return
    }

    updateGroupTransform()
    updateTextScale()
    updateMaterialUniform()
  })

  function updateGroupTransform() {
    if (!groupRef.current) return

    const finalScaleX = hoverScale.current * (baseScale + expandScale.current * (expandedScaleX - baseScale))
    const finalScaleY = hoverScale.current * (baseScale + expandScale.current * (expandedScaleY - baseScale))

    groupRef.current.scale.set(-finalScaleX, finalScaleY, hoverScale.current)

    const baseY = bottomY + hoverScale.current * 0.5
    const finalY = baseY + expandScale.current * expandedOffsetY
    groupRef.current.position.y = finalY

    const t = hoverScale.current * (Math.PI / 2)
    const baseOffsetX = radius * (1 - Math.cos(t))
    const finalX = originalX + baseOffsetX + expandScale.current * expandedOffsetX
    groupRef.current.position.x = finalX
  }

  function updateTextScale() {
    if (!textRef.current || !groupRef.current) return

    const groupScaleX = groupRef.current.scale.x
    const groupScaleY = groupRef.current.scale.y
    const hoverOnlyScaleX = hoverScale.current * baseScale
    const hoverOnlyScaleY = hoverScale.current * baseScale

    const textScaleX = Math.abs(groupScaleX) !== 0 ? hoverOnlyScaleX / Math.abs(groupScaleX) : 1
    const textScaleY = Math.abs(groupScaleY) !== 0 ? hoverOnlyScaleY / Math.abs(groupScaleY) : 1
    const finalX = groupScaleX < 0 ? -textScaleX : textScaleX

    if (
      lastTextScale.current.x !== finalX ||
      lastTextScale.current.y !== textScaleY
    ) {
      textRef.current.scale.set(finalX, textScaleY, 1)
      lastTextScale.current.set(finalX, textScaleY)
    }
  }

  function updateMaterialUniform() {
    if (!materialRef.current) return

    const newScaleX = baseScale + expandScale.current * (expandedScaleX - baseScale)
    const newScaleY = baseScale + expandScale.current * (expandedScaleY - baseScale)
    const newScale = new THREE.Vector2(newScaleX, newScaleY)

    if (!newScale.equals(lastMaterialScale.current)) {
      materialRef.current.uniforms.uScale.value.copy(newScale)
      lastMaterialScale.current.copy(newScale)
    }
  }

  const handlePointerDown = useCallback(() => {
    if (!isTyping) return
    handleSkipTyping()
    hideHoverPointer()
    setCursorVisible(false)
  }, [handleSkipTyping, hideHoverPointer, isTyping])

  return (
    <Billboard follow lockX={false} lockY={false} lockZ={false}>
      <group
        ref={groupRef}
        position={[0, 2.15, 0]}
        visible={expanded || showOnHover || hoverScale.current > 0.01}
      >
        <mesh
          onPointerDown={() => {
            if (shouldExpand && isTyping) {
              handlePointerDown()
            }
          }}
          onPointerEnter={() => {
            if (shouldExpand && isTyping) {
              showHoverPointer()
              setCursorVisible(true)
            }
          }}
          onPointerLeave={() => {
            hideHoverPointer()
            setCursorVisible(false)
          }}
        >
          <planeGeometry args={[1, 1]} />
          <nineSliceMaterial
            ref={materialRef}
            uTexture={texture}
            uNineSliceEnabled={shouldExpand}
            {...cornerUniforms}
            transparent
            depthWrite={false}
            alphaTest={0.5}
          />
        </mesh>
        <group ref={textRef}>
          <Text
            {...textProps}
            font={'/fonts/MedievalSharp-Bold.ttf'}
            color="black"
            anchorX="center"
            anchorY="middle"
            textAlign="left"
            lineHeight={1.3}
            outlineWidth={0}
            strokeWidth={0}
          >
            {displayText}
          </Text>
        </group>
      </group>
    </Billboard>
  )
}
