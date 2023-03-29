import { RGBA } from "../../wgw-node/src/colors";



export const RightTriangle: Shape = {
  points: [{x:0,y:0},{x:25,y:25},{x:0,y:50}],
  color: [240,210,100,180],
}

export const LeftTriangle: Shape = {
  points: [{x:0,y:25},{x:25,y:0},{x:25,y:50}],
  color: [240,210,100,180],
}

export const UpTriangle: Shape = {
  points: [{x:0,y:25},{x:25,y:0},{x:50,y:25}],
  color: [240,210,100,180],
}

export const DownTriangle: Shape = {
  points: [{x:0,y:0},{x:25,y:25},{x:50,y:0}],
  color: [240,210,100,180],
}

export const MagnifyingGlassPlus: Shape = {
  points: [{x:0,y:0},{x:25,y:25},{x:0,y:50},{x:25,y:25},{x:50,y:0},{x:25,y:25},{x:0,y:25},{x:25,y:25},{x:50,y:25}],
  color: [240,210,100,180],
}

export const MagnifyingGlassMinus: Shape = {
  points: [{x:0,y:0},{x:25,y:25},{x:0,y:50},{x:25,y:25},{x:50,y:0},{x:25,y:25},{x:50,y:50},{x:25,y:25},{x:25,y:50}],
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
