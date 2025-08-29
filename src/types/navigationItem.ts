import { JSX } from "react";
import { FocusTarget } from "./focusTarget";

export interface NavigationItem {
    label: string | JSX.Element;
    targetId: FocusTarget;
    onClick?: () => void;
  }
  