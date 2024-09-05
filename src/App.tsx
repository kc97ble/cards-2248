import "./App.css";
import { Chance } from "chance";
import pngHeart from "./assets/heart.png";
import pngDiamond from "./assets/diamond.png";
import pngClub from "./assets/club.png";
import pngSpade from "./assets/spade.png";
import React from "react";
import Victor from "victor";

const chance = new Chance();

type Count = number | [number, number];

type Dot = {
  key: number;
  position: Victor;
  initialPosition: Victor;
  visible: boolean;
  flipped: boolean;
  side: -1 | 0 | 1;
};

const POINTS = (() => {
  const p = (x: number, y: number) => new Victor(x / 6, y / 6);
  const d4 = [p(0, 0), p(6, 0), p(0, 6), p(6, 6)];
  const d8 = [...d4, p(0, 2), p(0, 4), p(6, 2), p(6, 4)];
  return [
    [],
    [p(3, 3)],
    [p(3, 0), p(3, 6)],
    [p(3, 0), p(3, 6), p(3, 3)],
    [...d4],
    [...d4, p(3, 3)],
    [...d4, p(0, 3), p(6, 3)],
    [...d4, p(0, 3), p(6, 3), p(3, 1.5)],
    [...d4, p(0, 3), p(6, 3), p(3, 1.5), p(3, 4.5)],
    [...d8, p(3, 3)],
    [...d8, p(3, 1.5), p(3, 4.5)],
  ] as const;
})();

// 0..1, 0..1
const L_BOUNDS = [16 / 240, 54 / 240, 96 / 240, 132 / 240] as const;
const R_BOUNDS = [128 / 240, 54 / 240, 96 / 240, 132 / 240] as const;
const M_BOUNDS = [72 / 240, 54 / 240, 96 / 240, 132 / 240] as const;

type State = {
  dots: Dot[];
  count: Count;
};

function getCanonicalDotsInBounds(
  points: Victor[],
  [x0, y0, w, h]: [number, number, number, number],
  side: -1 | 0 | 1
): Dot[] {
  const SHRINK = 0.5;
  x0 += ((1 - SHRINK) / 2) * w;
  w *= SHRINK;
  y0 += ((1 - SHRINK) / 2) * h;
  h *= SHRINK;
  return points.map(({ x, y }) => ({
    key: -1,
    position: new Victor(x * w + x0, y * h + y0),
    initialPosition: new Victor(x * w + x0, y * h + y0),
    visible: true,
    flipped: y > 0.5,
    side,
  }));
}

function getCanonicalDots(count: Count): Dot[] {
  if (Array.isArray(count)) {
    return [
      ...getCanonicalDotsInBounds([...POINTS[count[0]]], [...L_BOUNDS], -1),
      ...getCanonicalDotsInBounds([...POINTS[count[1]]], [...R_BOUNDS], +1),
    ];
  } else {
    return getCanonicalDotsInBounds([...POINTS[count]], [...M_BOUNDS], 0);
  }
}

function cost(adots: Dot[], bdots: Dot[]) {
  return bdots
    .map((b, i) => {
      let totalCost = b.position.distanceSq(adots[i].position);
      if (totalCost >= 1e-9) totalCost += 10000;
      if (b.side != adots[i].side) totalCost += 100;
      return totalCost;
    })
    .reduce((a, b) => a + b, 0);
}

function adapt(oldState: State, count: Count): State {
  let adots = oldState.dots;
  let bdots = getCanonicalDots(count);
  let bestChoice = [adots, bdots];
  let minCost = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 1000; i++) {
    adots = chance.shuffle(adots);
    adots.sort((a, b) => Number(b.visible) - Number(a.visible));
    bdots = chance.shuffle(bdots);
    const thisCost = cost(adots, bdots);
    if (thisCost < minCost) {
      minCost = thisCost;
      bestChoice = [adots, bdots];
    }
  }

  [adots, bdots] = bestChoice;
  adots = adots.map((a, i) => {
    const b = bdots[i];
    if (b) {
      return {
        key: a.key,
        position: b.position,
        initialPosition: a.position,
        visible: true,
        flipped: b.flipped,
        side: b.side,
      };
    } else {
      return {
        ...a,
        visible: false,
      };
    }
  });
  adots.sort((a, b) => a.key - b.key);

  return { dots: adots, count };
}

function getInitialDots(): Dot[] {
  const counts: Count[] = [];
  for (let i = 0; i <= 10; i++) {
    counts.push(i);
  }
  for (let i = 0; i <= 10; i++) {
    for (let j = 0; j <= 10; j++) {
      counts.push([i, j]);
    }
  }

  return counts
    .flatMap((count) => getCanonicalDots(count))
    .filter(
      (dot, index, array) =>
        array.findIndex((d) => d.position.distanceSq(dot.position) <= 1e-9) ==
        index
    )
    .flatMap((d) => [d, d, d, d, d, d, d, d])
    .map((dot, index) => ({ ...dot, visible: false, key: index }));
}

function App() {
  const [state, setState] = React.useState<State>(() => ({
    dots: getInitialDots(),
    count: 0,
  }));
  const [suitIndex, setSuitIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setTimeout(() => {
      setState((state) => ({
        dots: state.dots.map((d) => ({
          ...d,
          position: d.visible ? d.position : d.initialPosition,
        })),
        count: state.count,
      }));
    }, 1000);
    return () => clearTimeout(id);
  }, [state]);

  const eitherLOrMBounds = typeof state.count == "number" ? M_BOUNDS : L_BOUNDS;
  const eitherROrMBounds = typeof state.count == "number" ? M_BOUNDS : R_BOUNDS;

  return (
    <main
      onAuxClick={() => {
        setSuitIndex((x) => x + 1);
      }}
      onDoubleClick={() => {
        const text = prompt("new count?", JSON.stringify(state.count));
        if (!text) return;
        const count = JSON.parse(text);
        const newState = adapt(state, count);
        setState(newState);
      }}
    >
      <div className="board">
        <div
          className="card"
          style={{
            left: `${eitherLOrMBounds[0] * 100}%`,
            top: `${eitherLOrMBounds[1] * 100}%`,
            width: `${eitherLOrMBounds[2] * 100}%`,
            height: `${eitherLOrMBounds[3] * 100}%`,
          }}
        />
        <div
          className="card"
          style={{
            left: `${eitherROrMBounds[0] * 100}%`,
            top: `${eitherROrMBounds[1] * 100}%`,
            width: `${eitherROrMBounds[2] * 100}%`,
            height: `${eitherROrMBounds[3] * 100}%`,
          }}
        />
        {state.dots.map((d) => (
          <div
            key={d.key}
            className="dot"
            style={{
              opacity: d.visible ? "100%" : "0%",
              left: `${d.position.x * 100}%`,
              top: `${d.position.y * 100}%`,
              rotate: d.flipped ? "0.5turn" : "0turn",
            }}
          >
            <img
              src={[pngHeart, pngClub, pngDiamond, pngSpade][suitIndex % 4]}
            />
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
