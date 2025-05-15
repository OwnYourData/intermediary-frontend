"use client";

import Spinner from "@/app/svg/Spinner";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Default } from "./Buttons";

interface Props {
  content: string;
  icon?: React.ReactNode;
  onClick: () => void;
  onMouseOver?: () => void;
}

export interface SpinnerButtonRef {
  reset: () => void;
  set: (content?: string) => void;
  resolve: (icon?: React.ReactNode, content?: string) => void;
}


export const SpinnerButton = forwardRef<SpinnerButtonRef, Props>((props: Props, ref) => {
  const { onClick, onMouseOver } = props;
  const [content, setContent] = useState<string | undefined>(props.content);
  const [icon, setIcon] = useState<React.ReactNode | undefined>(props.icon);

  useImperativeHandle(ref, () => ({
    reset: () => { setContent(props.content); setIcon(props.icon); },
    set: (content?: string) => { setContent(content); setIcon(<Spinner />); },
    resolve: (icon?: React.ReactNode, content?: string) => { setContent(content); setIcon(icon); }
  }));

  return <button onClick={onClick} onMouseOver={onMouseOver} className={Default + " " + "flex flex-row justify-between align-middle"}>
    {icon}{content}
  </button>;
});

SpinnerButton.displayName = "SpinnerButton";

export default SpinnerButton;
