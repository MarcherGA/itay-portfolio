import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing";
import { RefObject } from "react";
import * as THREE from "three";

type Props = {
    lights?:  THREE.Object3D<THREE.Object3DEventMap>[] | RefObject<THREE.Object3D>[];
}

export function Effects({lights}: Props) {
    return <>
                <EffectComposer multisampling={8}>
          <SelectiveBloom
            lights={lights}
            blendFunction={THREE.AdditiveBlending}
            selectionLayer={1}
            intensity={0.7}
            luminanceThreshold={1}
            luminanceSmoothing={0.2}
          />
        </EffectComposer>
    </>
}