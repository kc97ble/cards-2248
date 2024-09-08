import "./index.css";

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import Helmet from "react-helmet";
import png0 from "./assets/0.png";
import png1 from "./assets/1.png";
import png10 from "./assets/10.png";
import png2 from "./assets/2.png";
import png3 from "./assets/3.png";
import png4 from "./assets/4.png";
import png5 from "./assets/5.png";
import png6 from "./assets/6.png";
import png7 from "./assets/7.png";
import png8 from "./assets/8.png";
import png9 from "./assets/9.png";
import pngClub from "./assets/club.png";
import pngDiamond from "./assets/diamond.png";
import pngHeart from "./assets/heart.png";
import pngSpade from "./assets/spade.png";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Helmet>
      {[
        pngHeart,
        pngDiamond,
        pngClub,
        pngSpade,
        png0,
        png1,
        png2,
        png3,
        png4,
        png5,
        png6,
        png7,
        png8,
        png9,
        png10,
      ].map((src) => (
        <link rel="preload" href={src} as="image" />
      ))}
    </Helmet>
    <App />
  </StrictMode>
);
