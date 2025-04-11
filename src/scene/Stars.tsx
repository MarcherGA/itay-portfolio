import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from 'framer-motion';


const Stars: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const starRef = React.useRef<THREE.Points>(null);

  const starCount = 5000;
  const starVertices = [];

  const getRandomAxis = () => {return (Math.random() - 0.5) * 1000;};

  for (let i = 0; i < starCount; i++) {
    const x = getRandomAxis();
    const y = getRandomAxis();
    const z = getRandomAxis();
    starVertices.push(x, y, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

      // Base slow rotation speed for the stars
      const baseRotationSpeed = 0.0005;
      let rotationSpeed = 0;
      let lastKnownScrollY = 0; // Keeps track of the scroll position
  // Use useFrame inside the Canvas component to rotate stars
    // Scroll sensitivity for controlling rotation speed
    const scrollSensitivity = 1; // Reduced sensitivity to make movement subtle

  useFrame(() => {
       // Apply base rotation speed (constant spin)
       starRef.current!.rotation.y += baseRotationSpeed;

       // Get the current scroll position
       const currentScrollY = scrollYProgress.get();
 
       // Adjust the rotation speed based on scroll position
       const scrollDelta = currentScrollY - lastKnownScrollY;
 
       // Apply a subtle change to the rotation speed
       rotationSpeed = scrollDelta * scrollSensitivity;//Math.min(Math.max(scrollDelta * scrollSensitivity, -0.02), 0.02); // Limit the speed
 
       // Apply the scroll-driven rotation
       starRef.current!.rotation.y += rotationSpeed;
 
       // Update the last scroll position for the next frame
       lastKnownScrollY = currentScrollY;
  });

  return (
    <points ref={starRef} geometry={geometry}>
      <pointsMaterial color={0xffffff} size={0.5} transparent opacity={0.8} />
    </points>
  );
};

export default Stars;
