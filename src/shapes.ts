import { RGBToDecimal } from "../../wgw-node/src/colors"

export const RightTriangle: Shape = {
  points: [{x:0,y:0},{x:25,y:25},{x:0,y:50}],
  color: RGBToDecimal(100,100,100),
}

export const LeftTriangle: Shape = {
  points: [{x:0,y:25},{x:25,y:0},{x:25,y:50}],
  color: RGBToDecimal(100,100,100),
}

export const UpTriangle: Shape = {
  points: [{x:0,y:25},{x:25,y:0},{x:50,y:25}],
  color: RGBToDecimal(100,100,100),
}

export const DownTriangle: Shape = {
  points: [{x:0,y:0},{x:25,y:25},{x:50,y:0}],
  color: RGBToDecimal(100,100,100),
}

export const MagnifyingGlassPlus: Shape = {
  points: [{x:0,y:0},{x:25,y:25},{x:0,y:50},{x:25,y:25},{x:50,y:0},{x:25,y:25},{x:0,y:25},{x:25,y:25},{x:50,y:25}],
  color: RGBToDecimal(100,100,100),
}

export const MagnifyingGlassMinus: Shape = {
  points: [{x:0,y:0},{x:25,y:25},{x:0,y:50},{x:25,y:25},{x:50,y:0},{x:25,y:25},{x:50,y:50},{x:25,y:25},{x:25,y:50}],
  color: RGBToDecimal(100,100,100),
}


export interface point {
  x: number;
  y: number;
}
export interface Shape {
  color: number;
  points: point[];
}
