export type Ratio = number; // 0..1
export type Point = [x: Ratio, y: Ratio];
export type Bound = [x: Ratio, y: Ratio, w: Ratio, h: Ratio];

export function toPercentage(ratio: Ratio): string {
  return (ratio * 100).toFixed(6) + "%";
}
