import React, { useMemo } from 'react';
import { Canvas, extend } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
//import StarrySky from '../StarrySky'; // Import the StarrySky component
import Model from '../Entities/player'; // Assuming your model is here
import Stars from './Stars';
import NightSky from './Skybox';
import FallingStar from './FallingStar';

let camera: PerspectiveCamera;
const createCamera = () => {
  camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.75, 2.2);
  camera.rotation.set(Math.PI * -0.1, 0, 0);
  //camera.setViewOffset(window.innerWidth, window.innerHeight, -window.innerWidth * 0.33, 0, window.innerWidth, window.innerHeight);
  return camera;
};

export default function Scene() {

  return (
    <div className="fixed h-screen w-screen z-20">
      <div className="relative w-full h-full overflow-hidden pointer-events-auto">
        <div className="w-full h-full">
          <Canvas className="block w-full h-full bg-black" camera={createCamera()}>
            <NightSky />
            <Stars />
            <FallingStar />
            <Model path="/assets/Player.glb" scale={1} />
            <Lights />
          </Canvas>
        </div>
      </div>
    </div>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight intensity={1.5} position={[0, 0, 5]} color="white" />
    </>
  );
}
