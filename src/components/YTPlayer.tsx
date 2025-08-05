// components/YTPlayer3D.tsx
import { Html } from '@react-three/drei';
import { TextureLoader } from 'three';
import { useEffect, useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useLoader } from '@react-three/fiber';
import { a, SpringValue } from '@react-spring/three';
import { useHoverPointer } from '../hooks/useHoverPointer';

type Props = {
  videoId: string;
  visible: boolean;
  opacity?: SpringValue<number> | number;
};
export default function YTPlayer3D({ videoId, visible, opacity }: Props) {
  const [showPlayer, setShowPlayer] = useState(false);
  const {showHoverPointer, hideHoverPointer} = useHoverPointer();
  const thumbnail = useLoader(TextureLoader, `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);

  useEffect(() => {
    if (!visible && showPlayer) {
      setShowPlayer(false);
    }
  }, [visible, showPlayer]);

  const opts: YouTubeProps['opts'] = {
    height: '225',
    width: '400',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      playsinline: 1
    },
  };

  return showPlayer ? (
    <Html
      center
      position={[0, 0.07, 0.01]}
      scale={1}
      prepend
      visible={visible}
    >
      <YouTube videoId={videoId} opts={opts} />
    </Html>
  ) : (
    <mesh
      scale={0.4}
      position={[0, 0.07, 0.01]}
      onClick={() =>  visible && setShowPlayer(true)}
      onPointerEnter={() => visible && showHoverPointer()}
      onPointerLeave={() => visible && hideHoverPointer()}
      
    >
      <planeGeometry args={[1.5, 0.9]} />
      <a.meshBasicMaterial map={thumbnail} transparent opacity={typeof opacity === 'number' ? opacity : opacity?.to(o => o)}/>
    </mesh>
  );
}
