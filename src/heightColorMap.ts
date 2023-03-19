import { RGBA } from "../../wgw-node/src/colors";
import { coastal, deepSea, highlands, hills, lowlands, peaks, shallowSea } from "./colors";

interface HeightColorMap {
  heightRange: [number, number];
  color: RGBA;
  label: string;
}

export const heightColorMap: HeightColorMap[] = [
  {
    heightRange: [-Infinity, 0.03],
    color: deepSea,
    label: "deep water",
  },
  {
    heightRange: [0.03, 0.1],
    color: shallowSea,
    label: "water",
  },
  {
    heightRange: [0.1, 0.12],
    color: coastal,
    label: "coastal",
  },
  {
    heightRange: [0.12, 0.3],
    color: lowlands,
    label: "lowlands",
  },
  {
    heightRange: [0.3, 0.52],
    color: hills,
    label: "hills",
  },
  {
    heightRange: [0.52, 0.61],
    color: highlands,
    label: "highlands",
  },
  {
    heightRange: [0.61, Infinity],
    color: peaks,
    label: "mountains",
  },
];
