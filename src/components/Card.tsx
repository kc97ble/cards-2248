import "./Card.css";

import React from "react";
import { Bound, toPercentage } from "../utils/geometry";
import Label from "./Label";

type Props = {
  style?: React.CSSProperties;
  children?: React.ReactNode;
  bound: Bound;
  label: number;
  suitColor: "red" | "black";
  hideLeftLabels?: boolean;
  hideRightLabels?: boolean;
  onClick?: () => void;
};

export default function Card({
  style,
  bound,
  label,
  suitColor,
  hideLeftLabels,
  hideRightLabels,
  onClick,
}: Props) {
  const [x, y, w, h] = bound;
  return (
    <div
      className="Card"
      style={{
        ...style,
        left: toPercentage(x),
        top: toPercentage(y),
        width: toPercentage(w),
        height: toPercentage(h),
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.();
      }}
    >
      <Label
        className="Card__label"
        style={{ top: 0, left: 0 }}
        label={label}
        suitColor={suitColor}
        hidden={hideLeftLabels}
      />
      <Label
        className="Card__label"
        style={{ top: 0, right: 0 }}
        label={label}
        suitColor={suitColor}
        hidden={hideRightLabels}
      />
      <Label
        className="Card__label"
        style={{ bottom: 0, left: 0, rotate: "0.5turn" }}
        label={label}
        suitColor={suitColor}
        hidden={hideLeftLabels}
      />
      <Label
        className="Card__label"
        style={{ bottom: 0, right: 0, rotate: "0.5turn" }}
        label={label}
        suitColor={suitColor}
        hidden={hideRightLabels}
      />
    </div>
  );
}
