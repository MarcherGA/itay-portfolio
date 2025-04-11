import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import {motion} from "framer-motion-3d"
import { useRef, useState } from "react";
import { AnimationMixer, Vector4 } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


const Model = (props: {path: string, scale: number}) => {
    const model = useLoader(
        GLTFLoader,
        props.path
    )
    const {camera} = useThree()
    const { scrollYProgress } = useScroll();
    const xProgress = useTransform(
      scrollYProgress,
      [0, 0.35],
      [0, 2]
    );

    let action : any = useRef({});
    const mixer = useRef(new AnimationMixer(model.scene)).current
    action.waving = mixer.clipAction(model.animations[1])
    action.startWalking = mixer.clipAction(model.animations[4])
    action.idle = mixer.clipAction(model.animations[0])
    action.idle.play();


    model.scene.position.set(1.1 * (window.innerWidth /1920 ), 0, -0.1 * 1/(window.innerWidth /1920 ))
    model.scene.lookAt(0, 0, camera.position.z)

    model.scene.traverse(child => {
        child.castShadow = true
        child.receiveShadow = true
      }
    )

    useFrame((state, delta) => {
      if(model.scene.visible)
        mixer.update(delta)
    })

    mixer.addEventListener( 'loop', function( e	) { 
      if (e.action === action.waving) {
        console.log("idle")
        action.waving.crossFadeTo(action.idle, 0.5, false)
        action.idle.reset().fadeIn(0.5).play()
      } 
    } );


    useMotionValueEvent(xProgress, "change", (currentValue) => {
      if(currentValue >= 0 && currentValue < 2)
      {
        if(!model.scene.visible)
        {
          model.scene.visible = true
          console.log("visible")
        }
      }
      else if(model.scene.visible)
      {
        model.scene.visible = false
      }
    
    }
    )
    return (
      <motion.mesh
      position-x={xProgress}
      onClick={()=>{
        action.idle.fadeOut(0.5)
        action.waving.reset().fadeIn(0.5).play()
        console.log("waving")
    }}
      >
        <primitive 
            object={model.scene}
            scale={props.scale}
        />
        </motion.mesh>
    )
}

export default Model;