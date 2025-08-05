import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

export function CameraLogger() {
  const { camera } = useThree()

  useEffect(() => {
    const handleKey = (e: any) => {
      const camPos = camera.position.clone()
        const dir = new THREE.Vector3()
        camera.getWorldDirection(dir)
        const lookAt = camPos.clone().add(dir)

        console.log('Camera position:', camPos.toArray())
        console.log('Look at:', lookAt.toArray())
    }

    window.addEventListener('click', handleKey)
    return () => window.removeEventListener('click', handleKey)
  }, [camera])

  return null
}