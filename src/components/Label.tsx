import "./Label.css";
import png0 from "../assets/0.png";
import png1 from "../assets/1.png";
import png2 from "../assets/2.png";
import png3 from "../assets/3.png";
import png4 from "../assets/4.png";
import png5 from "../assets/5.png";
import png6 from "../assets/6.png";
import png7 from "../assets/7.png";
import png8 from "../assets/8.png";
import png9 from "../assets/9.png";
import png10 from "../assets/10.png";
import React from "react";
import cx from "clsx";

type Props = {
  className?: string;
  style?: React.CSSProperties;
  label: number;
  suitColor: "red" | "black";
  hidden?: boolean;
};

export default function Label({
  className,
  style,
  label,
  suitColor,
  hidden,
}: Props) {
  const [visible, setVisible] = React.useState(false);
  const [maskImageUrl, setMaskImageUrl] = React.useState<string>();

  React.useEffect(() => {
    setVisible(false);
    const id = setTimeout(() => {
      setMaskImageUrl(getMaskImageUrl(label));
      setVisible(true);
    }, 500);
    return () => clearTimeout(id);
  }, [label]);

  return (
    <div
      className={cx("Label", className)}
      style={Object.assign<React.CSSProperties, unknown>(
        { ...style, opacity: visible && !hidden ? "100%" : "0%" },
        {
          "--mask-image": maskImageUrl,
          "--background-color":
            suitColor === "black"
              ? "#000000"
              : suitColor === "red"
              ? "#d40000"
              : "transparent",
        }
      )}
    ></div>
  );
}

function getMaskImageUrl(label: number): string | undefined {
  switch (label) {
    case 0:
      return `url(${png0})`;
    case 1:
      return `url(${png1})`;
    case 2:
      return `url(${png2})`;
    case 3:
      return `url(${png3})`;
    case 4:
      return `url(${png4})`;
    case 5:
      return `url(${png5})`;
    case 6:
      return `url(${png6})`;
    case 7:
      return `url(${png7})`;
    case 8:
      return `url(${png8})`;
    case 9:
      return `url(${png9})`;
    case 10:
      return `url(${png10})`;
    default:
      return undefined;
  }
}
