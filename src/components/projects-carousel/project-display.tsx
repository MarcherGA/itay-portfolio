// components/ui/ProjectDisplay.tsx
import { Text } from '@react-three/drei';
import { Mesh, Texture } from 'three';
import YTPlayer3D from '../YTPlayer'; // updated import
import { useRef } from 'react';
import { a, animated, SpringValue } from '@react-spring/three';

const AnimatedText = animated(Text);
const AnimatedMeshBasicMaterial = a.meshBasicMaterial as unknown as React.FC<any>;

type Props = {
  project: Project;
  texture?: Texture;
  focused?: boolean;
  visible?: boolean;
  opacity?: SpringValue<number> | number;
};

const CARD_WIDTH = 1.4;

export default function ProjectDisplay({ focused = false, project, texture, visible, opacity }: Props) {
  const isImage = project.type === 'image';
  const isVideo = project.type === 'video';
  const imageMeshRef = useRef<Mesh>(null);

  return (
    <group visible={visible}>
      <group position={[0, 0, 0]}>
        <AnimatedText
          font={'/fonts/MedievalSharp-Regular.ttf'}
          color={"#222"}
          fillOpacity={opacity ?? 1}
          fontSize={0.11}
          position={[0, 0.34, 0.01]}
          maxWidth={CARD_WIDTH - 0.3}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          {project.name}
        </AnimatedText>

        {(
          <>
            {isVideo && project.videoId && (
              <YTPlayer3D visible={focused} key={project.videoId} videoId={project.videoId} opacity={opacity} />
            ) || isImage && texture && (
              <mesh ref={imageMeshRef} scale={0.4} position={[0, 0.07, 0.01]}>
                <planeGeometry args={[1.5, 0.9]} />
                <AnimatedMeshBasicMaterial map={texture} transparent opacity={typeof opacity === 'number' ? opacity : opacity?.to(o => o)} />
              </mesh>
            )}
          </>
        )}

        <AnimatedText
          font={'/fonts/MedievalSharp-Regular.ttf'}
          color={"#111"}
          fillOpacity={opacity ?? 1}
          fontSize={0.035}
          position={[0, -0.27, 0.01]}
          maxWidth={CARD_WIDTH - 0.3}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          {project.description}
        </AnimatedText>
      </group>
    </group>
  );
}
