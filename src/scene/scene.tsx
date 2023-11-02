import { Scene } from "@babylonjs/core";
import SceneComponent from 'babylonjs-hook'; // if you install 'babylonjs-hook' NPM.
import { createScene } from './sceneCreation';

const onSceneReady = (scene: Scene) => {
  createScene(scene)
};

/**
 * Will run on every frame render.  We are spinning the box on y-axis.
 */
const onRender = (scene : Scene) => {
};

export default () => (
  <div>
    <SceneComponent className="h-screen w-screen" antialias onSceneReady={onSceneReady} onRender={onRender}/>
  </div>
);