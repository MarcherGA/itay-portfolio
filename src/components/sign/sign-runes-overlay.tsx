import { Mesh } from 'three';
import { Rune } from './rune';
import { RuneDecal } from './rune-decal';
import { useActiveRunes } from '../../hooks/useActiveRunes';

type Props = {
  mesh: React.RefObject<Mesh>;
  hovered: boolean;
  isFocused: boolean;
  carouselIndex: number;
};

export function SignRunesOverlay({ hovered, isFocused, mesh, carouselIndex }: Props) {
  const activeRunes = useActiveRunes(isFocused, carouselIndex);

  const isRuneGlowing = (id: string) =>
    (hovered && !isFocused) || activeRunes.includes(id);

  return (
    <group>
      <Rune position={[0.66, -0.05, 0.42]} rotation={[-Math.PI * 0.1, -Math.PI * 0.1, Math.PI * 0.8]} scale={0.2} runeType="inguz" isGlowing={isRuneGlowing('inguz')} />
      <Rune position={[0.68, 0.25, 0.325]} rotation={[-Math.PI * 0.1, -Math.PI * 0.1, Math.PI * 1.04]} scale={0.2} runeType="fehu" isGlowing={isRuneGlowing('fehu')} />
      <Rune position={[-0.75, 0.025, -0.14]} rotation={[-Math.PI * 0.1, -Math.PI * 0.1, Math.PI * 1.04]} scale={0.2} runeType="raido" isGlowing={isRuneGlowing('raido')} />
      <Rune position={[-0.74, 0.325, -0.235]} rotation={[-Math.PI * 0.1, -Math.PI * 0.1, Math.PI * 0.9]} scale={0.2} runeType="algiz" isGlowing={isRuneGlowing('algiz')} />
      <RuneDecal position={[0.4, 0.73, 0.1]} rotation={[-0, Math.PI * 0.9, -Math.PI * 0.6]} scale={0.2} mesh={mesh} runeType="othila" isGlowing={isRuneGlowing('othila')} />
      <RuneDecal position={[0.025, 0.73, -0.06]} rotation={[-0, Math.PI * 0.9, Math.PI * 1.01]} scale={0.2} mesh={mesh} runeType="sowelu" isGlowing={isRuneGlowing('sowelu')} />
      <RuneDecal position={[-0.325, 0.73, -0.21]} rotation={[-0, Math.PI * 0.9, Math.PI * 0.9]} scale={0.2} mesh={mesh} runeType="berkana" isGlowing={isRuneGlowing('berkana')} />
      <RuneDecal position={[0.275, -0.43, 0.51]} rotation={[-0, Math.PI * 0.9, Math.PI * 0.9]} scale={0.2} mesh={mesh} runeType="jera" isGlowing={isRuneGlowing('jera')} />
      <RuneDecal position={[-0.1, -0.43, 0.35]} rotation={[-0, Math.PI * 0.9, Math.PI * 1.01]} scale={0.2} mesh={mesh} runeType="mannaz" isGlowing={isRuneGlowing('mannaz')} />
      <RuneDecal position={[-0.45, -0.43, 0.2]} rotation={[-0, Math.PI * 0.9, Math.PI * 1.2]} scale={0.2} mesh={mesh} runeType="uruz" isGlowing={isRuneGlowing('uruz')} />
    </group>
  );
}
