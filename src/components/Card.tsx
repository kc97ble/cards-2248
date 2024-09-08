import "./Card.css";

import React from "react";
import { Bound, toSvmin } from "../utils/geometry";
import Label from "./Label";

type Props$Surface = {
  style?: React.CSSProperties;
  children?: React.ReactNode;
  bound: Bound;
  onClick?: () => void;
};

function Surface({ style, bound, onClick }: Props$Surface) {
  const [x, y, w, h] = bound;
  return (
    <div
      className="Card_Surface"
      style={{
        ...style,
        translate: [toSvmin(x), toSvmin(y)].join(" "),
        width: toSvmin(w),
        height: toSvmin(h),
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.();
      }}
    />
  );
}

type Props$LabelGroup = {
  style?: React.CSSProperties;
  children?: React.ReactNode;
  bound: Bound;
  label: number;
  suitColor: "red" | "black";
  hideLeftLabels?: boolean;
  hideRightLabels?: boolean;
};

function LabelGroup({
  style,
  bound,
  label,
  suitColor,
  hideLeftLabels,
  hideRightLabels,
}: Props$LabelGroup) {
  const [x, y, w, h] = bound;
  return (
    <div
      className="Card_LabelGroup"
      style={{
        ...style,
        translate: [toSvmin(x), toSvmin(y)].join(" "),
        width: toSvmin(w),
        height: toSvmin(h),
      }}
    >
      <Label
        className="Card_LabelGroup__label"
        style={{ top: 0, left: 0 }}
        label={label}
        suitColor={suitColor}
        hidden={hideLeftLabels}
      />
      <Label
        className="Card_LabelGroup__label"
        style={{ top: 0, right: 0 }}
        label={label}
        suitColor={suitColor}
        hidden={hideRightLabels}
      />
      <Label
        className="Card_LabelGroup__label"
        style={{ bottom: 0, left: 0, rotate: "0.5turn" }}
        label={label}
        suitColor={suitColor}
        hidden={hideLeftLabels}
      />
      <Label
        className="Card_LabelGroup__label"
        style={{ bottom: 0, right: 0, rotate: "0.5turn" }}
        label={label}
        suitColor={suitColor}
        hidden={hideRightLabels}
      />
    </div>
  );
}

const Card = { Surface, LabelGroup };

export default Card;
