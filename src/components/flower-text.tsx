import * as THREE from "three"
import { useRef, useMemo, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"

type Particle = {
  type: number // 0 = flower, 1 = leaf
  x: number
  y: number
  z: number
  rotationZ: number
  color: number
  scale: number
  maxScale: number
  deltaScale: number
  age: number
  ageDelta: number
  isGrowing: boolean
  toDelete: boolean
  grow: () => void
}

const font = "Verdana"
const textureFontSize = 70
const fontScaleFactor = 0.075

export function FlowerText({ text }: { text: string }) {
  const { camera } = useThree()
  const flowerMesh = useRef<THREE.InstancedMesh>(null!)
  const leafMesh = useRef<THREE.InstancedMesh>(null!)

  const [particles, setParticles] = useState<Particle[]>([])
  const [stringBox, setStringBox] = useState({ wScene: 0, hScene: 0 })

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Load textures
  const flowerTexture = useMemo(
    () => new THREE.TextureLoader().load("https://ksenia-k.com/img/threejs/flower.png"),
    []
  )
  const leafTexture = useMemo(
    () => new THREE.TextureLoader().load("https://ksenia-k.com/img/threejs/leaf.png"),
    []
  )

  const flowerMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        alphaMap: flowerTexture,
        opacity: 0.3,
        depthTest: false,
        transparent: true,
      }),
    [flowerTexture]
  )

  const leafMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        alphaMap: leafTexture,
        opacity: 0.35,
        depthTest: false,
        transparent: true,
      }),
    [leafTexture]
  )

  // Convert text → particles (matching vanilla JS exactly)
  useEffect(() => {
    // Create canvas and measure text like vanilla JS
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    
    // Split into lines like vanilla JS
    const lines = text.split('\n')
    const linesNumber = lines.length
    
    // Set font and measure (matching vanilla JS)
    ctx.font = `100 ${textureFontSize}px ${font}`
    ctx.fillStyle = "#2a9d8f"
    
    // Calculate canvas size like vanilla JS
    const metrics = ctx.measureText(text)
    const width = Math.ceil(metrics.width)
    const height = textureFontSize * 1.2
    
    canvas.width = width
    canvas.height = height
    
    // Reset context after canvas resize
    ctx.font = `100 ${textureFontSize}px ${font}`
    ctx.fillStyle = "#2a9d8f"
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw text exactly like vanilla JS
    for (let i = 0; i < linesNumber; i++) {
      ctx.fillText(lines[i], 0, (i + 0.8) * canvas.height / linesNumber)
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newParticles: Particle[] = []

    // Sample every 2 pixels like vanilla JS (i += 2, j += 2)
    for (let i = 0; i < canvas.height; i += 2) {
      for (let j = 0; j < canvas.width; j += 2) {
        // Check RGB channel like vanilla JS (index 0, not 3 for alpha)
        if (imageData.data[(j + i * canvas.width) * 4] > 0) {
          const x = j * fontScaleFactor
          const y = i * fontScaleFactor

          const isFlower = Math.random() > 0.2

          newParticles.push(
            isFlower ? makeFlower(x, y) : makeLeaf(x, y)
          )
        }
      }
    }

    setParticles(newParticles)
    setStringBox({
      wScene: canvas.width * fontScaleFactor,
      hScene: canvas.height * fontScaleFactor,
    })
  }, [text])

  useFrame(() => {
    if (!flowerMesh.current || !leafMesh.current) return

    let flowerIdx = 0
    let leafIdx = 0

    particles.forEach((p) => {
      p.grow()
      
      // Billboard to camera like vanilla JS
      dummy.quaternion.copy(camera.quaternion)
      dummy.rotation.z += p.rotationZ
      dummy.scale.set(p.scale, p.scale, p.scale)
      
      // Position like vanilla JS - note the Y coordinate handling
      dummy.position.set(
        p.x - stringBox.wScene / 2, 
        stringBox.hScene - p.y - stringBox.hScene / 2, // Fixed Y positioning
        p.z
      )
      
      // Leaf Y offset like vanilla JS
      if (p.type === 1) {
        dummy.position.y += 0.5 * p.scale
      }

      dummy.updateMatrix()

      if (p.type === 0) {
        flowerMesh.current.setMatrixAt(flowerIdx, dummy.matrix)
        flowerMesh.current.setColorAt(flowerIdx, new THREE.Color(`hsl(${p.color},100%,50%)`))
        flowerIdx++
      } else {
        leafMesh.current.setMatrixAt(leafIdx, dummy.matrix)
        leafMesh.current.setColorAt(leafIdx, new THREE.Color(`hsl(${p.color},100%,20%)`))
        leafIdx++
      }
    })

    flowerMesh.current.instanceMatrix.needsUpdate = true
    leafMesh.current.instanceMatrix.needsUpdate = true
    
    // Update colors
    if (flowerMesh.current.instanceColor) {
      flowerMesh.current.instanceColor.needsUpdate = true
    }
    if (leafMesh.current.instanceColor) {
      leafMesh.current.instanceColor.needsUpdate = true
    }
  })

  const totalFlowers = particles.filter((p) => p.type === 0).length
  const totalLeaves = particles.filter((p) => p.type === 1).length

  return (
    <group>
      <instancedMesh ref={flowerMesh} args={[undefined, flowerMat, totalFlowers]}>
        <planeGeometry args={[1.2, 1.2]} />
      </instancedMesh>
      <instancedMesh ref={leafMesh} args={[undefined, leafMat, totalLeaves]}>
        <planeGeometry args={[1.2, 1.2]} />
      </instancedMesh>
    </group>
  )
}

// Helper functions matching vanilla JS exactly
function makeFlower(x: number, y: number): Particle {
  return {
    type: 0,
    x: x + 0.2 * (Math.random() - 0.5),
    y: y + 0.2 * (Math.random() - 0.5),
    z: 0,
    rotationZ: 0.5 * Math.random() * Math.PI,
    color: Math.random() * 60,
    isGrowing: true,
    toDelete: false,
    scale: 0,
    maxScale: 0.9 * Math.pow(Math.random(), 20),
    deltaScale: 0.03 + 0.1 * Math.random(),
    age: Math.PI * Math.random(),
    ageDelta: 0.01 + 0.02 * Math.random(),
    grow() {
      this.age += this.ageDelta
      if (this.isGrowing) {
        this.deltaScale *= 0.99
        this.scale += this.deltaScale
        if (this.scale >= this.maxScale) {
          this.isGrowing = false
        }
      } else if (this.toDelete) {
        this.deltaScale *= 1.1
        this.scale -= this.deltaScale
        if (this.scale <= 0) {
          this.scale = 0
          this.deltaScale = 0
        }
      } else {
        this.scale = this.maxScale + 0.2 * Math.sin(this.age)
        this.rotationZ += 0.001 * Math.cos(this.age)
      }
    },
  }
}

function makeLeaf(x: number, y: number): Particle {
  return {
    type: 1,
    x,
    y,
    z: 0,
    rotationZ: 0.6 * (Math.random() - 0.5) * Math.PI,
    color: 100 + Math.random() * 50,
    isGrowing: true,
    toDelete: false,
    scale: 0,
    maxScale: 0.1 + 0.7 * Math.pow(Math.random(), 7),
    deltaScale: 0.03 + 0.03 * Math.random(),
    age: Math.PI * Math.random(),
    ageDelta: 0.01, // Note: vanilla JS doesn't add random to leaf ageDelta
    grow() {
      if (this.isGrowing) {
        this.deltaScale *= 0.99
        this.scale += this.deltaScale
        if (this.scale >= this.maxScale) {
          this.isGrowing = false
        }
      }
      if (this.toDelete) {
        this.deltaScale *= 1.1
        this.scale -= this.deltaScale
        if (this.scale <= 0) {
          this.scale = 0
        }
      }
    },
  }
}
