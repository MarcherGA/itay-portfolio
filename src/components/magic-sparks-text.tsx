import * as THREE from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useScreenSize } from "../hooks/useScreenSize"

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
  sparkIntensity = 0.3,
  position = [0, 0, 0],
}: MagicSparksTextProps) {
  const { camera } = useThree()
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const [particles, setParticles] = useState<any[]>([])
  const [stringBox, setStringBox] = useState({ wScene: 0, hScene: 0 })
  const [width] = useScreenSize();
  
  // Performance monitoring and optimization
  const frameTimeRef = useRef<number[]>([])
  const lastFrameTime = useRef(performance.now())
  const [particleDensity, setParticleDensity] = useState(1) // Start with every 2 pixels
  
  // Memory optimization - reuse objects
  const tempVector = useMemo(() => new THREE.Vector3(), [])

  // Use existing magic spark texture instead of generating complex one
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return loader.load("/textures/magic-spark.png")
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

    // Use adaptive particle density for performance
    for (let y = 0; y < canvas.height; y += particleDensity) {
      for (let x = 0; x < canvas.width; x += particleDensity) {
        const alpha = imageData.data[(y * canvas.width + x) * 4 + 3]
        if (alpha > 0) {
          pts.push({
            x: x * scale + 0.3 * (Math.random() - 0.5),
            y: y * scale + 0.3 * (Math.random() - 0.5),
            z: 0.1 * (Math.random() - 0.5),
            isGrowing: true,
            toDelete: false,
            scale: 0,
            maxScale: 0.1 + 1.2 * Math.pow(Math.random(), 6),
            deltaScale: 0.02 + 0.03 * Math.random(),
            age: Math.PI * 2 * Math.random(),
            ageDelta: 0.015 + 0.02 * Math.random(),
            rotationZ: Math.PI * 2 * Math.random(),
            deltaRotation: 0.01 * (Math.random() - 0.5),
            twinkle: Math.random() * Math.PI * 2,
            twinkleDelta: 0.03 + 0.03 * Math.random(),
          })
        }
      }
    }
    setParticles(pts)
  }, [text, font, fontSize, scale, baseHue, hueRange, particleDensity])

  // Animate particles with performance monitoring and adaptive quality
  useFrame(() => {
    if (!meshRef.current || particles.length === 0) return
    
    // Performance monitoring
    const currentTime = performance.now()
    const frameTime = currentTime - lastFrameTime.current
    lastFrameTime.current = currentTime
    
    // Track frame times for performance analysis
    frameTimeRef.current.push(frameTime)
    if (frameTimeRef.current.length > 60) { // Keep last 60 frames
      frameTimeRef.current.shift()
    }
    
    // Adaptive quality adjustment every 60 frames
    if (frameTimeRef.current.length === 60) {
      const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / 60
      const fps = 1000 / avgFrameTime
      
      // // Adjust particle density based on performance
      // if (fps < 120 && particleDensity < 4) {
      //   setParticleDensity(prev => Math.min(prev + 1, 4)) // Reduce particles
      // } else if (fps > 200 && particleDensity > 1) {
      //   setParticleDensity(prev => Math.max(prev - 1, 1)) // Increase particles
      // }
      
      frameTimeRef.current = [] // Reset for next measurement
    }
    
    // Calculate camera distance for LOD (Level of Detail)
    tempVector.set(position[0], position[1], position[2])
    const distanceToCamera = camera.position.distanceTo(tempVector)
    const lodFactor = Math.min(1, 10 / distanceToCamera) // Reduce detail at distance
    
    // Batch process particles with LOD optimization
    const updateStep = Math.max(1, Math.floor(1 / lodFactor))
    
    for (let i = 0; i < particles.length; i += updateStep) {
      const p = particles[i]
      
      p.age += p.ageDelta
      p.twinkle += p.twinkleDelta

      // Growth logic matching original
      if (p.isGrowing) {
        p.deltaScale *= 0.99
        p.scale += p.deltaScale
        if (p.scale >= p.maxScale) {
          p.isGrowing = false
        }
      } else if (p.toDelete) {
        p.deltaScale *= 1.1
        p.scale -= p.deltaScale
        if (p.scale <= 0) p.scale = 0
      } else {
        // Simplified breathing effect - reduced trigonometric calculations
        p.scale = p.maxScale + 0.1 * Math.sin(p.age)
        p.rotationZ += p.deltaRotation
      }

      // Position exactly like original - flip Y coordinate
      dummy.position.set(
        p.x - stringBox.wScene * 0.5,
        stringBox.hScene - p.y - stringBox.hScene * 0.5,
        p.z
      )
      
      // Simplified scale with reduced twinkling calculations
      const twinkleScale = 0.95 + 0.1 * Math.sin(p.twinkle)
      dummy.scale.set(
        p.scale * twinkleScale * lodFactor, 
        p.scale * twinkleScale * lodFactor, 
        p.scale * twinkleScale * lodFactor
      )
      
      // Billboarding like original
      dummy.quaternion.copy(camera.quaternion)
      dummy.rotation.z += p.rotationZ
      
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
      
      // Fill in skipped particles with same transform for visual continuity
      for (let j = 1; j < updateStep && i + j < particles.length; j++) {
        meshRef.current!.setMatrixAt(i + j, dummy.matrix)
      }
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // Create material similar to cloud text for better performance
  const material = useMemo(() => {
    // Create a golden color based on baseHue
    const goldColor = new THREE.Color(`hsl(${baseHue}, 80%, 65%)`)
    
    return new THREE.MeshBasicMaterial({
      color: goldColor,
      map: texture,
      depthTest: false,
      opacity: sparkIntensity,
      transparent: true,
      // Use standard blending instead of additive for better performance
    })
  }, [texture, sparkIntensity, baseHue])

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  return (
    <instancedMesh
    frustumCulled={true}
      scale={width > 1600 ? 0.5 : 0.4}
      position={position}
      ref={meshRef}
      args={[geometry, material, particles.length]}
    />
  )
}
