import { useLoader } from '@react-three/fiber';
import { JSX, useEffect, useRef, useState } from 'react';
import { Group, TextureLoader, Euler } from 'three';
import { a, useSpring } from '@react-spring/three';
import content from '../../data/content.json';
import * as THREE from 'three';
import ProjectDisplay from './project-display';
import { CarouselArrow } from './carousel-arrow';
import { CarouselDot } from './carousel-dot';

type CarouselProps = {
  rotation?: [number, number, number];
  isFocused?: boolean;
  hovered?: boolean;
  onIndexChange?: (index: number) => void;
} & JSX.IntrinsicElements['group'];

export default function ProjectsCarousel({
  isFocused = false,
  hovered = false,
  rotation = [0, 0, 0],
  onIndexChange,
  ...props
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'idle' | 'fadingOut' | 'fadingIn'>('idle');
  const [displayVisible, setDisplayVisible] = useState(false);

  const isAnimatingRef = useRef(false);
  const groupRef = useRef<Group>(null!);
  const conrolsGroupRef = useRef<Group>(null!);

  const euler = new Euler(
    THREE.MathUtils.degToRad(rotation[0]),
    THREE.MathUtils.degToRad(rotation[1]),
    THREE.MathUtils.degToRad(rotation[2]),
    'YXZ'
  );

  const projects = content.ProjectCards as Project[];
  const imageProjects = projects.filter((p) => p.type === 'image');
  const textures = useLoader(TextureLoader, imageProjects.map((p) => p.image!));

  const textureMap = new Map();
  imageProjects.forEach((project, i) => {
    textureMap.set(project.image, textures[i]);
  });

  // Animate arrow/dot opacity
  const { controlsOpacity } = useSpring({
    controlsOpacity: isFocused ? 1 : 0,
    config: { tension: 120, friction: 14, duration: 1200 },
    onStart: () => {
      if (isFocused) conrolsGroupRef.current.visible = true;
    },
    onResolve: () => {
      if (!isFocused) conrolsGroupRef.current.visible = false;
    },
  });

  // Animate display (ProjectDisplay) visibility when hovered or focused
  useEffect(() => {
    if (isFocused || hovered) {
      setDisplayVisible(true);
    } else {
      const timeout = setTimeout(() => setDisplayVisible(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [isFocused, hovered]);

  const { displayOpacity } = useSpring({
    displayOpacity: isFocused || hovered ? 1 : 0,
    config: { duration: 600 },
  });

  // Animate fade between current and target project
  const { fade } = useSpring({
    fade:
      fadeState === 'fadingOut'
        ? 0
        : fadeState === 'fadingIn'
        ? 1
        : 1,
    config: { duration: 600 },
    onRest: () => {
      if (fadeState === 'fadingOut') {
        setCurrentIndex(targetIndex);
        setFadeState('fadingIn');
      } else if (fadeState === 'fadingIn') {
        isAnimatingRef.current = false;
        setFadeState('idle');
      }
    },
  });

  const handleSetIndex = (newIndex: number) => {
    if (isAnimatingRef.current || newIndex === currentIndex) return;

    const normalizedIndex = (newIndex + projects.length) % projects.length;
    setTargetIndex(normalizedIndex);

    isAnimatingRef.current = true;
    setFadeState('fadingOut');

    onIndexChange?.(normalizedIndex);
  };

  const handlePrev = () => handleSetIndex(currentIndex - 1);
  const handleNext = () => handleSetIndex(currentIndex + 1);

  return (
    <group ref={groupRef} rotation={euler} {...props}>
      <group>
        {projects.map((project, i) => {
          const isCurrent = i === currentIndex;
          const isTarget = i === targetIndex;

          const visible =
            fadeState === 'idle'
              ? isCurrent
              : fadeState === 'fadingOut'
              ? isCurrent
              : fadeState === 'fadingIn'
              ? isTarget
              : false;

          const texture =
            project.type === 'image' && project.image
              ? textureMap.get(project.image)
              : undefined;

          const showFade =
            (fadeState === 'fadingOut' && isCurrent) ||
            (fadeState === 'fadingIn' && isTarget) ||
            (fadeState === 'idle' && isCurrent);

          const projectVisible = displayVisible && (isFocused ? visible : i === currentIndex);
          const opacity = isFocused ? (showFade ? fade : 1) : displayOpacity;

          return (
            <group key={i} visible={projectVisible}>
              <ProjectDisplay
                focused={isFocused && isCurrent && fadeState === 'idle'}
                project={project}
                texture={texture}
                opacity={opacity}
              />
            </group>
          );
        })}
      </group>

      <group ref={conrolsGroupRef}>
        <CarouselArrow
          label="<"
          position={[-0.5, 0, 0.009]}
          onClick={handlePrev}
          opacity={controlsOpacity}
        />
        <CarouselArrow
          label=">"
          position={[0.5, 0, 0.009]}
          onClick={handleNext}
          opacity={controlsOpacity}
        />

        <group position={[0, -0.43, 0]}>
          {projects.map((_, i) => {
            const spacing = 0.06;
            const totalWidth = (projects.length - 1) * spacing;
            const x = i * spacing - totalWidth / 2;
            return (
              <CarouselDot
                key={i}
                index={i}
                currentIndex={currentIndex}
                setCurrentIndex={handleSetIndex}
                position={[x, 0, 0.009]}
                opacity={controlsOpacity}
              />
            );
          })}
        </group>
      </group>
    </group>
  );
}
