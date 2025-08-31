// components/RuneDecal.tsx
import { Decal, DecalProps } from '@react-three/drei';
import { Mesh } from 'three';
import { useRuneTextures } from '../../hooks/useRuneTextures';
import { useGlowingMaterial } from '../../hooks/useGlowingMaterial';

type Props = {
  mesh: React.RefObject<Mesh>;
  isGlowing: boolean;
  runeType?: RuneType;
} & DecalProps;

export function RuneDecal({ mesh, isGlowing, runeType = 'algiz', ...props }: Props) {
  const textures = useRuneTextures();
  const texture = textures ? textures[runeType] : undefined;
  const { materialProps } = useGlowingMaterial(isGlowing, texture);

  if (!mesh.current) return null;

  return (
    <Decal mesh={mesh} parent={mesh.current} depthTest {...props}>
      <meshStandardMaterial {...materialProps} />
    </Decal>
  );
}
