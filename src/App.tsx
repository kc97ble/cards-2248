import "./App.css";
import pngHeart from "./assets/heart.png";
import pngDiamond from "./assets/diamond.png";
import pngClub from "./assets/club.png";
import pngSpade from "./assets/spade.png";
import React from "react";
import Victor from "victor";

type Count = number | [number, number];

type Dot = {
  key: number;
  position: Victor;
  initialPosition: Victor;
  visible: boolean;
  flipped: boolean;
  side: -1 | 0 | 1;
};

const MAX_DOTS = 10;

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

function adapt(oldState: State, count: Count): State {
  let adots = oldState.dots;
  let bdots = getCanonicalDots(count);

  let bestPlan: [Dot[], Dot[]] = [[], []];
  let bestCost = Infinity;

  for (let k = 0; k < 32; k++) {
    const u = new Victor(Math.cos(k), Math.sin(k));
    adots.sort((p, q) => p.position.dot(u) - q.position.dot(u));
    bdots.sort((p, q) => p.position.dot(u) - q.position.dot(u));

    const SWITCH_COST = 1000;
    const MOVE_COST = 100;
    const F: number[][] = Array.from(Array(bdots.length + 1), () => []);
    const D: boolean[][] = Array.from(Array(bdots.length + 1), () => []);

    F[0][0] = 0;
    D[0][0] = true;

    for (let j = 1; j <= adots.length; j++) {
      const c0 = adots[j - 1].visible ? SWITCH_COST : 0;
      F[0][j] = F[0][j - 1] + c0;
      D[0][j] = false;
    }

    for (let i = 1; i <= bdots.length; i++) {
      F[i][0] = Infinity;
      D[i][0] = false;
    }

    for (let i = 1; i <= bdots.length; i++) {
      for (let j = 1; j <= adots.length; j++) {
        const c0 = adots[j - 1].visible ? SWITCH_COST : 0;
        const f0 = F[i][j - 1] + c0;
        F[i][j] = f0;
        D[i][j] = false;

        const d1 = bdots[i - 1].position.distanceSq(adots[j - 1].position);
        const c1 =
          (adots[j - 1].visible ? 0 : SWITCH_COST) +
          (d1 >= 1e-9 ? d1 + MOVE_COST : 0);
        const f1 = F[i - 1][j - 1] + c1;
        if (f1 < f0) {
          F[i][j] = f1;
          D[i][j] = true;
        }
      }
    }

    if (F[bdots.length][adots.length] < bestCost) {
      bestCost = F[bdots.length][adots.length];
      let i = bdots.length;
      let j = adots.length;
      const position: Map<number, number> = new Map();

      while (i > 0) {
        if (D[i][j]) {
          position.set(adots[j - 1].key, i - 1);
          i--;
          j--;
        } else {
          j--;
        }
      }

      adots.sort((u, v) => {
        const uu = position.get(u.key) ?? 9999;
        const vv = position.get(v.key) ?? 9999;
        return uu - vv;
      });

      bestPlan = [[...adots], [...bdots]];
    }
  }

  [adots, bdots] = bestPlan;
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
  for (let i = 0; i <= MAX_DOTS; i++) {
    counts.push(i);
  }
  for (let i = 0; i <= MAX_DOTS; i++) {
    for (let j = 0; j <= MAX_DOTS; j++) {
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

function removeDot(state: State, key: number): State {
  const dot = state.dots.find((d) => d.key == key);
  if (!dot) return state;
  const newDots = state.dots.map((d) =>
    d == dot ? { ...d, visible: false } : d
  );
  const newCount: Count =
    typeof state.count === "number"
      ? state.count - 1
      : dot.side < 0
      ? [state.count[0] - 1, state.count[1]]
      : dot.side > 0
      ? [state.count[0], state.count[1] - 1]
      : state.count;

  return adapt({ dots: newDots, count: newCount }, newCount);
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
    >
      <div
        className="board"
        onClick={(event) => {
          event.preventDefault();
          const c = state.count;
          if (typeof c == "number") {
            const L = Math.floor(Math.random() * c);
            const R = c - L;
            setState((state) => adapt(state, [L, R]));
          } else {
            setState((state) => adapt(state, c[0] + c[1]));
          }
        }}
      >
        <div
          className="card"
          style={{
            left: `${eitherLOrMBounds[0] * 100}%`,
            top: `${eitherLOrMBounds[1] * 100}%`,
            width: `${eitherLOrMBounds[2] * 100}%`,
            height: `${eitherLOrMBounds[3] * 100}%`,
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const c = state.count;
            if (typeof c === "number") {
              if (c >= 10) {
                setSuitIndex((x) => x + 1);
              } else {
                setState((state) => adapt(state, c + 1));
              }
            } else {
              if (c[0] >= 10) {
                setSuitIndex((x) => x + 1);
              } else if (c[0] + c[1] >= 10) {
                setState((state) => adapt(state, [c[0] + 1, c[1] - 1]));
              } else {
                setState((state) => adapt(state, [c[0] + 1, c[1]]));
              }
            }
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
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const c = state.count;
            if (typeof c === "number") {
              if (c >= 10) {
                setSuitIndex((x) => x + 1);
              } else {
                setState((state) => adapt(state, c + 1));
              }
            } else {
              if (c[1] >= 10) {
                setSuitIndex((x) => x + 1);
              } else if (c[0] + c[1] >= 10) {
                setState((state) => adapt(state, [c[0] - 1, c[1] + 1]));
              } else {
                setState((state) => adapt(state, [c[0], c[1] + 1]));
              }
            }
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
              style={{
                pointerEvents: d.visible ? "initial" : "none",
              }}
              src={[pngHeart, pngClub, pngDiamond, pngSpade][suitIndex % 4]}
              onClick={
                d.visible
                  ? (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setState((state) => removeDot(state, d.key));
                    }
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
