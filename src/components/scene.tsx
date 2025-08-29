import { Canvas} from "@react-three/fiber";
import { EffectComposer, Bloom, BrightnessContrast} from "@react-three/postprocessing";
import * as THREE from "three";
import { FloatingIsland } from "../components/island";
import { SkyEnvironment } from "../components/sky/sky-environment";
import { StarrySkybox } from "../components/sky/starry-skybox";
import { SceneResizer } from "./scene-resizer";
import { useStatsOverlay } from "../hooks/useStatsOverlay";
import { CloudText } from "./cloud-text";
import { MagicSparksText } from "./magic-sparks-text";
import { PerspectiveCamera } from "@react-three/drei";
import { NavigationController } from "./navigation-controller";
import { useThemeStore } from "../hooks/useThemeStore";


export default function Scene() {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

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

      {/* Theme-based sky background */}
      {isDark ? <StarrySkybox /> : <SkyEnvironment />}

      {/* Theme-based lighting setup */}
      {isDark ? (
        // Dark mode lighting - cooler, dimmer
        <>
          <ambientLight intensity={4} color={0xD7D7E4}/>
          <directionalLight position={[5, 8, 20]} intensity={3} color={0x8080ff} />
          <directionalLight position={[-3, 3, -3]} intensity={1} color={0x4040ff}/>
        </>
      ) : (
        // Bright mode lighting - warmer, brighter
        <>
          <ambientLight intensity={4} color={0xffffff}/>
          <directionalLight position={[5, 8, 20]} intensity={3} color={0xffe0b3} />
          <directionalLight position={[-3, 3, -3]} intensity={3} color={0xbbeaff}/>
        </>
      )}

      {/* Theme-based bloom effect */}
      <EffectComposer multisampling={8}>
      <BrightnessContrast 
        brightness={isDark ? 0.025 : 0.05} 
        contrast={isDark ? 0.32 : 0.2} 
      />
      <Bloom
        intensity={isDark ? 0.9 : 0.8}
        luminanceThreshold={isDark ? 0.9 : 1.1}
        luminanceSmoothing={0.1}
        blendFunction={THREE.AdditiveBlending}
      />
      </EffectComposer>

      {/* Navigation Controller */}
      <NavigationController />

      {/* Island & Crystal */}
      <FloatingIsland rotation={[0, -Math.PI * 0.22, 0]} position={[0, -0.5, -2]}/>
      
      {/* Theme-based text */}
      {isDark ? (
        <MagicSparksText sparkIntensity={0.6} position={[0, 50, 0]} text="Welcome to
Itay's Island" />
      ) : (
        <CloudText position={[0, 50, 0]} text="Welcome to
Itay's Island" />
      )}

      <SceneResizer/>


    </Canvas>
  );
}
