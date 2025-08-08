// src/three/shared.ts
import * as THREE from 'three';

export const sharedBoxGeometry = new THREE.BoxGeometry(1,1,1);
export const sharedCloudPlane = new THREE.PlaneGeometry(1,1);

// create/prepare debug material
export const debugHitMaterial = new THREE.MeshBasicMaterial({
  transparent: true, opacity: 0.6, depthWrite: false
});
