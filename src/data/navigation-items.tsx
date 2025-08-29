import { NavigationItem } from "../types/navigationItem";
import { FocusTarget } from "../types/focusTarget";

export const navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      targetId: FocusTarget.home,
    },
    {
      label:"Island",
      targetId: FocusTarget.island,
    },
    {
      label: 'About',
      targetId: FocusTarget.avatar,
    },
    {
      label: 'Projects', 
      targetId: FocusTarget.sign,
    },
    {
      label: 'Contact',
      targetId: FocusTarget.crystal,
    }
  ];