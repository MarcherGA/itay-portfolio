// src/stores/useFocusStore.ts
import { create } from "zustand";
import { FocusTargetData } from "../types/focusTarget";

type FocusStore = {
  targets: FocusTargetData[];
  currentIndex: number; // -1 = home
  setTargets: (targets: FocusTargetData[]) => void;
  setCurrentIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
};

export const useFocusStore = create<FocusStore>((set, get) => ({
  targets: [],
  currentIndex: -1,

  setTargets: (targets) => set({ targets }),
  setCurrentIndex: (index) => set({ currentIndex: index }),

  next: () => {
    const { currentIndex, targets } = get();
    if (currentIndex < targets.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > -1) {
      set({ currentIndex: currentIndex - 1 });
    }
  },
}));
