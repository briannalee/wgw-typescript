import { RGBA } from "../../wgw-node/src/colors";



export const Triangle: Shape = {
  points: [{x:25,y:25},{x:0,y:50}],
  color: [240,210,100,180],
}

export interface point {
  x: number;
  y: number;
}
export interface Shape {
  color: RGBA;
  points: point[];
}
