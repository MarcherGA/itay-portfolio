// components/Rune.tsx
import { JSX } from 'react';
import { useRuneTextures } from '../../hooks/useRuneTextures';
import { useGlowingMaterial } from '../../hooks/useGlowingMaterial';

type Props = {
  isGlowing: boolean;
  runeType?: RuneType;
} & JSX.IntrinsicElements['mesh'];

export function Rune({ isGlowing, runeType = 'algiz', ...props }: Props) {
  const textures = useRuneTextures();
  const texture = textures[runeType];
  const { materialProps } = useGlowingMaterial(isGlowing, texture);

  return (
    <mesh {...props}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
}
