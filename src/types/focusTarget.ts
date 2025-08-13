import * as THREE from "three";


export type FocusTargetData = {
    id: string;
    mesh: THREE.Object3D | null; // allow null initially
    cameraOffset: THREE.Vector3;
    lookAtOffset: THREE.Vector3;
  };
  
  export enum FocusTarget {
    home =-1,
    avatar = 0,
    sign = 1,
    crystal = 2,
  }