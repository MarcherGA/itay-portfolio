// src/three/shared.ts
import { BoxGeometry, PlaneGeometry, MeshBasicMaterial } from 'three';

export const sharedBoxGeometry = new BoxGeometry(1,1,1);
export const sharedCloudPlane = new PlaneGeometry(1,1);

// create/prepare debug material
export const debugHitMaterial = new MeshBasicMaterial({
  transparent: true, opacity: 0.6, depthWrite: false
});
