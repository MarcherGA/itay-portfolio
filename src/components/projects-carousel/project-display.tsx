// components/ui/ProjectDisplay.tsx
import { Text } from '@react-three/drei';
import {Texture } from 'three';
import YTPlayer3D from '../YTPlayer'; // updated import
import { animated, SpringValue } from '@react-spring/three';
import { ProjectThumbnail } from './project-thumbnail';

const AnimatedText = animated(Text);

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


  return (
    <group visible={visible}>
      <group position={[0, 0, 0]}>
        <AnimatedText
          font={'/fonts/MedievalSharp-Regular.ttf'}
          color={"#222"}
          fillOpacity={opacity ?? 1}
          fontSize={0.105}
          position={[0, 0.34, 0.01]}
          maxWidth={CARD_WIDTH - 0.2}
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
              <ProjectThumbnail focused={focused} link={project.link} texture={texture} opacity={opacity} />
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
