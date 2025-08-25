import * as THREE from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"

type MagicSparksTextProps = {
  text: string
  font?: string
  baseHue?: number
  hueRange?: number
  fontSize?: number
  scale?: number
  sparkIntensity?: number
  position?: [number, number, number]
}

export function MagicSparksText({
  text = "Magic Sparks",
  font = "Verdana", 
  baseHue = 45, // Gold base hue
  hueRange = 60, // Range of hue variation
  fontSize = 60,
  scale = 0.08,
  sparkIntensity = 0.8,
  position = [0, 0, 0],
}: MagicSparksTextProps) {
  const { camera } = useThree()
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const [particles, setParticles] = useState<any[]>([])
  const [stringBox, setStringBox] = useState({ wScene: 0, hScene: 0 })

  // Create a sparkle/star texture programmatically
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 64
    canvas.height = 64
    
    const center = 32
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    
    // Add cross pattern for sparkle effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(30, 10, 4, 44)
    ctx.fillRect(10, 30, 44, 4)
    
    // Add diagonal lines
    ctx.save()
    ctx.translate(center, center)
    ctx.rotate(Math.PI / 4)
    ctx.fillRect(-2, -20, 4, 40)
    ctx.fillRect(-20, -2, 40, 4)
    ctx.restore()
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  // Draw text on canvas and sample coordinates
  useEffect(() => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    
    const lines = text.split('\n')
    const linesNumber = lines.length
    
    // Calculate dimensions like original
    ctx.font = `100 ${fontSize}px ${font}`
    const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
    const lineHeight = fontSize * 1.1
    
    canvas.width = maxWidth
    canvas.height = lineHeight * linesNumber
    
    // Set up context
    ctx.font = `100 ${fontSize}px ${font}`
    ctx.fillStyle = "#2a9d8f" // Use same color as original for text rendering
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw text exactly like original
    for (let i = 0; i < linesNumber; i++) {
      ctx.fillText(lines[i], 0, (i + 0.8) * canvas.height / linesNumber)
    }
    
    const wScene = canvas.width * scale
    const hScene = canvas.height * scale
    setStringBox({ wScene, hScene })

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pts: any[] = []

    // Sample every pixel like the original (no spacing)
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = imageData.data[(y * canvas.width + x) * 4 + 3]
        if (alpha > 0) { // Keep all pixels like original
          pts.push({
            x: x * scale + 0.3 * (Math.random() - 0.5),
            y: y * scale + 0.3 * (Math.random() - 0.5),
            z: 0.2 * (Math.random() - 0.5), // Add some depth
            isGrowing: true,
            toDelete: false,
            scale: 0,
            maxScale: 0.2 + 2.0 * Math.pow(Math.random(), 8), // Larger, more varied scales
            deltaScale: 0.02 + 0.04 * Math.random(),
            age: Math.PI * 2 * Math.random(),
            ageDelta: 0.02 + 0.03 * Math.random(), // Faster animation
            rotationZ: Math.PI * 2 * Math.random(),
            deltaRotation: 0.02 * (Math.random() - 0.5), // Faster rotation
            twinkle: Math.random() * Math.PI * 2, // For twinkling effect
            twinkleDelta: 0.05 + 0.05 * Math.random(),
            color: baseHue + (Math.random() - 0.5) * hueRange, // Hue variation around base
          })
        }
      }
    }
    setParticles(pts)
  }, [text, font, fontSize, scale, baseHue, hueRange])

  // Animate particles with sparkle effects
  useFrame((state) => {
    if (!meshRef.current || particles.length === 0) return
    
    particles.forEach((p, i) => {
      p.age += p.ageDelta
      p.twinkle += p.twinkleDelta

      // Growth logic matching original
      if (p.isGrowing) {
        p.deltaScale *= 0.99 // Damping like original
        p.scale += p.deltaScale
        if (p.scale >= p.maxScale) {
          p.isGrowing = false
        }
      } else if (p.toDelete) {
        p.deltaScale *= 1.1
        p.scale -= p.deltaScale
        if (p.scale <= 0) p.scale = 0
      } else {
        // Breathing effect like original flowers
        p.scale = p.maxScale + 0.2 * Math.sin(p.age)
        p.rotationZ += 0.001 * Math.cos(p.age) // Subtle rotation like original
      }

      // Position exactly like original - flip Y coordinate
      dummy.position.set(
        p.x - stringBox.wScene * 0.5,
        stringBox.hScene - p.y - stringBox.hScene * 0.5,
        p.z
      )
      
      // Scale with gentle twinkling
      const twinkleScale = 0.9 + 0.2 * Math.sin(p.twinkle)
      dummy.scale.set(
        p.scale * twinkleScale, 
        p.scale * twinkleScale, 
        p.scale * twinkleScale
      )
      
      // Billboarding like original
      dummy.quaternion.copy(camera.quaternion)
      dummy.rotation.z += p.rotationZ
      
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
      
      // Set individual particle color with twinkling hue shift
      meshRef.current!.setColorAt(i, new THREE.Color(`hsl(${p.color + Math.sin(p.twinkle) * 10},100%,70%)`))
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  // Create material with per-instance coloring
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: texture,
      depthTest: false,
      opacity: sparkIntensity,
      transparent: true,
      blending: THREE.AdditiveBlending, // Additive blending for glow effect
    })
  }, [texture, sparkIntensity])

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  return (
    <instancedMesh
      scale={0.6}
      position={position}
      ref={meshRef}
      args={[geometry, material, particles.length]}
    />
  )
}

