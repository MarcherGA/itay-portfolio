import * as THREE from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import { useScreenSize } from "../hooks/useScreenSize"

type CloudTextProps = {
  text: string
  font?: string
  color?: string
  fontSize?: number
  scale?: number,
  position?: [number, number, number]
}

export function CloudText({
  text = "Cloud typer",
  font = "Verdana", 
  color = "#2a9d8f",
  fontSize = 60,
  scale = 0.08,
  position = [0, 0, 0],
}: CloudTextProps) {
  const { camera } = useThree()
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const [particles, setParticles] = useState<any[]>([])
  const [stringBox, setStringBox] = useState({ wScene: 0, hScene: 0 })
  const [width] = useScreenSize();

  // Smoke texture for particles
  const texture = useTexture("textures/cloud/smoke.png")

  // Draw text on canvas and sample coordinates
  useEffect(() => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    
    // Handle multi-line text like the original
    const lines = text.split('\n')
    const linesNumber = lines.length
    
    // Calculate canvas dimensions
    ctx.font = `100 ${fontSize}px ${font}`
    const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
    const lineHeight = fontSize * 1.1
    
    canvas.width = maxWidth
    canvas.height = lineHeight * linesNumber
    
    // Clear and set up context
    ctx.font = `100 ${fontSize}px ${font}`
    ctx.fillStyle = color
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw each line like the original
    for (let i = 0; i < linesNumber; i++) {
      ctx.fillText(lines[i], 0, (i + 0.8) * canvas.height / linesNumber)
    }
    
    // Store string box dimensions
    const wScene = canvas.width * scale
    const hScene = canvas.height * scale
    setStringBox({ wScene, hScene })

    // Sample coordinates from image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pts: any[] = []

    // Sample every pixel like the original (not every 2 pixels)
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = imageData.data[(y * canvas.width + x) * 4 + 3]
        if (alpha > 0) {
          pts.push({
            x: x * scale + 0.15 * (Math.random() - 0.5), // Add random offset like original
            y: y * scale + 0.15 * (Math.random() - 0.5),
            z: 0,
            isGrowing: true,
            toDelete: false,
            scale: 0,
            maxScale: 0.1 + 1.5 * Math.pow(Math.random(), 10),
            deltaScale: 0.03 + 0.03 * Math.random(), // Match original values
            age: Math.PI * Math.random(),
            ageDelta: 0.01 + 0.02 * Math.random(),
            rotationZ: 0.5 * Math.random() * Math.PI,
            deltaRotation: 0.01 * (Math.random() - 0.5),
          })
        }
      }
    }
    setParticles(pts)
  }, [text, font, color, fontSize, scale])

  // Animate particles
  useFrame(() => {
    if (!meshRef.current || particles.length === 0) return
    
    particles.forEach((p, i) => {
      // Update particle properties
      p.age += p.ageDelta
      p.rotationZ += p.deltaRotation

      if (p.isGrowing) {
        p.scale += p.deltaScale
        if (p.scale >= p.maxScale) p.isGrowing = false
      } else if (p.toDelete) {
        p.scale -= p.deltaScale
        if (p.scale <= 0) p.scale = 0
      } else {
        p.scale = p.maxScale + 0.2 * Math.sin(p.age)
      }

      // Position like the original: flip Y and offset by half dimensions
      dummy.position.set(
        p.x - stringBox.wScene * 0.5,
        stringBox.hScene - p.y - stringBox.hScene * 0.5,
        p.z
      )
      
      dummy.scale.set(p.scale, p.scale, p.scale)
      
      // Apply camera quaternion first (billboard), then add particle rotation
      dummy.quaternion.copy(camera.quaternion)
      dummy.rotation.z += p.rotationZ
      
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // Create material like the original
  const material = useMemo(() => 
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      alphaMap: texture,
      depthTest: false,
      opacity: 0.3,
      transparent: true,
    }), [texture]
  )

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  return (
    <instancedMesh
    frustumCulled={true}
        scale={width > 768 ? 0.6 : 0.4}
        position={position}
      ref={meshRef}
      args={[geometry, material, particles.length]}
    />
  )
}
