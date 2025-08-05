import { useMemo } from "react";
import { Texture, TextureLoader } from "three";

export const useRuneTextures = (): Record<RuneType, Texture> => {
    return useMemo(() => {
      const loader = new TextureLoader();
      const types: RuneType[] = ['algiz', 'fehu', 'inguz', 'jera', 'mannaz', 'raido', 'sowelu', 'uruz', 'othila', 'berkana'];
  
      const textures: Record<RuneType, Texture> = {} as any;
  
      types.forEach((type) => {
        const tex = loader.load(`/textures/runes/${type}.png`);
        tex.flipY = false;
        textures[type] = tex;
      });
  
      return textures;
    }, []);
  };
  