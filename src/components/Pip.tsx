import "./Pip.css";

import pngHeart from "../assets/heart.png";
import pngDiamond from "../assets/diamond.png";
import pngClub from "../assets/club.png";
import pngSpade from "../assets/spade.png";
import React from "react";
import cx from "clsx";
import { Point, toPercentage } from "../utils/geometry";

const SUIT = {
  heart: `url(${pngHeart})`,
  diamond: `url(${pngDiamond})`,
  club: `url(${pngClub})`,
  spade: `url(${pngSpade})`,
};

type Props = {
  className?: string;
  style?: React.CSSProperties;
  center: Point;
  visible: boolean;
  flipped: boolean;
  suitIndex: number;
  onClick?: () => void;
};

export default function Pip({
  className,
  style,
  center,
  visible,
  flipped,
  suitIndex,
  onClick,
}: Props) {
  const [hidden, setHidden] = React.useState(false);
  const [suit, setSuit] = React.useState<keyof typeof SUIT>();

  React.useEffect(() => {
    setHidden(true);
    const id = setTimeout(() => {
      setSuit(getSuit(suitIndex));
      setHidden(false);
    }, 500);
    return () => clearTimeout(id);
  }, [suitIndex]);

  return (
    <div
      className={cx("Pip", className)}
      style={Object.assign<React.CSSProperties, unknown>(
        {
          ...style,
          pointerEvents: visible ? "initial" : "none",
          opacity: visible && suit ? "100%" : "0%",
          scale: hidden ? "0% 100%" : "100% 100%",
          rotate: flipped ? "0.5turn" : "0turn",
          left: toPercentage(center[0]),
          top: toPercentage(center[1]),
          backgroundColor:
            suit === "spade" || suit == "club" ? "#000000" : "#d40000",
        },
        { "--mask-image": suit ? SUIT[suit] : undefined }
      )}
      onClick={
        visible && onClick
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              onClick();
            }
          : undefined
      }
    ></div>
  );
}

function getSuit(suitIndex: number): keyof typeof SUIT | undefined {
  switch (suitIndex % 4) {
    case 0:
      return "heart";
    case 1:
      return "club";
    case 2:
      return "diamond";
    case 3:
      return "spade";
    default:
      return undefined;
  }
}
