import { useEffect, useMemo, useRef } from 'react'
import { Group, Mesh, MeshStandardMaterial, RepeatWrapping, Texture } from 'three'
import { FontLoader, Font } from 'three/examples/jsm/Addons.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { a, useSpring } from '@react-spring/three'


type Props = {
  text: string
  fontPath: string
  texturePath?: string
  color?: string
  size?: number
  depth?: number
  lineHeight?: number
  position?: [number, number, number],
  rotation?: [number, number, number]
}

export default function CenteredMultilineText({
  text,
  fontPath,
  texturePath,
  size = 2.5,
  depth = 0.3,
  lineHeight = 3,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color
}: Props) {
  const groupRef = useRef<Group>(null)

  const font = useLoader(FontLoader, fontPath);

  const texture = useMemo(() => {
    if (!texturePath) return undefined;
    const tex = useLoader(TextureLoader, texturePath);
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    // Optional: set repeat
    tex.repeat.set(5, 3);
    return tex;
  }, [texturePath]);
  
  useEffect(() => {
    if (!groupRef.current || !font) return

    groupRef.current.clear()

    const material = new MeshStandardMaterial({
      map: texture,
      color: color
    })

    const lines = text.split('\n')

    lines.forEach((line, i) => {
      const geometry = new TextGeometry(line, {
        font: font as Font,
        size,
        depth: depth,
        bevelEnabled: true,
        bevelSize: 0.02,
        bevelThickness: 0.02,
        bevelSegments: 3,
        curveSegments: 6,
      })

      geometry.computeBoundingBox()
      geometry.center()

      const mesh = new Mesh(geometry, material)
      mesh.position.y = -i * lineHeight
      mesh.frustumCulled = true;
      groupRef.current?.add(mesh)
    })

    const totalHeight = (lines.length - 1) * lineHeight
    groupRef.current.position.set(position[0], position[1] + totalHeight / 2, position[2])
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2])
  }, [text, font, texture])
  
  const { scale } = useSpring({
    from: { scale: [0, 0, 0] },
    to: { scale: [1, 1, 1] },
    config: { tension: 50, friction: 20 },
    delay: 300
  })

  return <a.group ref={groupRef} scale={scale.to((x, y, z) => [x, y, z])} />
}
