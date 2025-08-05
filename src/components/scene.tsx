import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useTexture
} from "@react-three/drei";
import { EffectComposer, Bloom, BrightnessContrast} from "@react-three/postprocessing";
import * as THREE from "three";
import { BranchesText } from "./branches-text";
import { FloatingIsland } from "../components/island";
import { CameraLogger } from "../components/camera-logger";
import { SkyEnvironment } from "../components/sky/sky-environment";
import { SceneResizer } from "./scene-resizer";
import { useStatsOverlay } from "../hooks/useStatsOverlay";

function Skybox() {
  const texture = useTexture("textures/painted-sky.png");
  return <primitive attach="background" object={texture} />;
}


export default function Scene() {

  useStatsOverlay();

  return (
    <Canvas
      camera={{ position: [0, 3, 14], fov: 50, near: 0.1, far: 500 }}
      shadows
      style={{ background: "black" }}
      gl={{
        toneMapping: THREE.ReinhardToneMapping, // or THREE.NoToneMapping
        outputColorSpace: THREE.SRGBColorSpace
      }}
      onCreated={(state) => {
        state.camera.layers.enable(0);
        state.camera.layers.enable(1);
      }}
    >
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
        luminanceSmoothing={0.2}
        blendFunction={THREE.AdditiveBlending}
      />
      </EffectComposer>

      {/* Island & Crystal */}
      <FloatingIsland scale={1} rotation={[0, -Math.PI * 0.15, 0]} position={[-6, -0.5, -2]}/>
      
      <BranchesText rotation={[0, -Math.PI * 0.08, 0]} position={[4.5,0,0]}/>

      <CameraLogger/>
      <SceneResizer/>


    </Canvas>
  );
}
