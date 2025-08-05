import { useEffect, useMemo } from 'react';
import { useScreenSize } from '../hooks/useScreenSize';
import { useThree } from '@react-three/fiber';

export function SceneResizer() {
    const {scene} = useThree()
    const [width] = useScreenSize();
    const scale = useMemo(() => {
        if (width < 480) return 0.4;
        if (width < 768) return 0.5;
        return 1;
    }, [width]);

    useEffect(() => {
        scene.scale.set(scale, scale, scale);
    }, [scene]);

  return null
}
