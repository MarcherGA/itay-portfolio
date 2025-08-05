import { useEffect, useState } from 'react';

const glowingRunesMap: Record<number, string[]> = {
  0: ['inguz', 'raido'],
  1: ['sowelu', 'algiz', 'jera'],
  2: ['othila', 'berkana'],
  3: ['mannaz', 'uruz'],
  4: ['sowelu', 'uruz'],
};

const getRandomRunes = (): string[] => {
  const allRunes = ['inguz', 'raido', 'sowelu', 'algiz', 'jera', 'othila', 'berkana', 'mannaz', 'uruz'];
  const count = Math.floor(Math.random() * 2) + 2;
  return [...allRunes].sort(() => 0.5 - Math.random()).slice(0, count);
};

export function useActiveRunes(isFocused: boolean, index: number): string[] {
  const [activeRunes, setActiveRunes] = useState<string[]>([]);

  useEffect(() => {
    if (isFocused) {
      const runes = glowingRunesMap[index] ?? getRandomRunes();
      setActiveRunes(runes);
    } else {
      setActiveRunes([]);
    }
  }, [isFocused, index]);

  return activeRunes;
}
