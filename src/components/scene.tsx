import { Canvas} from "@react-three/fiber";
import { EffectComposer, Bloom, BrightnessContrast} from "@react-three/postprocessing";
import * as THREE from "three";
import { FloatingIsland } from "../components/island";
import { SkyEnvironment } from "../components/sky/sky-environment";
import { SceneResizer } from "./scene-resizer";
import { useStatsOverlay } from "../hooks/useStatsOverlay";
import { CloudText } from "./cloud-text";
import { PerspectiveCamera } from "@react-three/drei";


export default function Scene() {

  useStatsOverlay();

  return (
    <Canvas
      shadows
      style={{ background: "black" }}
      gl={{
        toneMapping: THREE.ReinhardToneMapping, // or THREE.NoToneMapping
        outputColorSpace: THREE.SRGBColorSpace,
        antialias: true
      }}
    >
        <PerspectiveCamera 
    makeDefault
    position={[0, 50, 14]} 
    fov={50} 
    near={0.1} 
    far={500}
  />
      {/* Subtle fog for atmosphere */}
      <fog attach="fog" args={["#fceee8", 10, 75]} />

      {/* Painted sky background */}
      <SkyEnvironment />

      {/* Lighting setup */}
      <ambientLight intensity={4} color={0xffffff}/>

      <directionalLight position={[5, 8, 20]} intensity={3} color={0xffe0b3}   />
      <directionalLight position={[-3, 3, -3]} intensity={3} color={0xbbeaff}/>


      {/* Bloom effect */}
      <EffectComposer multisampling={8}>
      <BrightnessContrast brightness={0.05 } contrast={0.2} />
      <Bloom
        intensity={0.8}
        luminanceThreshold={1.1}
        luminanceSmoothing={0.1}
        blendFunction={THREE.AdditiveBlending}
      />
      </EffectComposer>

      {/* Island & Crystal */}
      <FloatingIsland rotation={[0, -Math.PI * 0.22, 0]} position={[0, -0.5, -2]}/>
      
      <CloudText text="Welcome to
Itay's Island"/>

      <SceneResizer/>


    </Canvas>
  );
}
