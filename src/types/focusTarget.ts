import { Object3D, Vector3 } from "three";


export type FocusTargetData = {
    id: string;
    mesh: Object3D | null; // allow null initially
    cameraOffset: Vector3;
    lookAtOffset: Vector3;
  };
  
  export enum FocusTarget {
    home =-1,
    island = 0,
    avatar = 1,
    sign = 2,
    crystal = 3,
  }