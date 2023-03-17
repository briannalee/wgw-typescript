import axios from "axios";

type RGBA = [red:number,green:number,blue:number,alpha:number];
const errorPink : RGBA = [255,0,255,255];
const cliff: RGBA = [104, 103, 93, 255]; // rock color
const steepCliff: RGBA = [94, 93, 83, 255]; // rock color

const deepSea: RGBA = [29, 162, 216, 255];
const shallowSea: RGBA = [127, 205, 255, 255];
const coastal: RGBA = [255, 255, 204, 255];
const lowlands: RGBA = [90, 67, 49, 255];
const hills: RGBA = [99, 73, 55, 255];
const highlands: RGBA = [107, 88, 73, 255];
const peaks: RGBA = [114, 113, 103, 255];

const tempCold: RGBA = [0,0,200,100];
const tempHot: RGBA = [200,0,0,100];

async function draw() {

var canvas: HTMLCanvasElement = document.createElement('canvas');
var overlay: HTMLCanvasElement = document.createElement('canvas');
let styleSheet: HTMLStyleElement = document.createElement('style');
styleSheet.innerText = `.overlay {
  position: absolute;
  top: 0;
  left: 0;
}
.content {
  position: absolute;
  top: 0;
  left: 0;
}`;
document.head.appendChild(styleSheet);
canvas.width = 1000;
canvas.height = 1000;
canvas.className = "content";
overlay.width = 1000;
overlay.height = 1000;
overlay.className = "overlay";

document.body.appendChild(canvas);
document.body.appendChild(overlay);
let ctx : CanvasRenderingContext2D | null = canvas.getContext('2d');
let overlayCtx : CanvasRenderingContext2D | null = overlay.getContext('2d');

if (ctx != null && overlayCtx != null) {

    axios.post('http://localhost:3000/getMap', {
        password: "Jason Sweet"
    })
    .then(function (response) {
      let width : number = canvas.width;
      let height : number = canvas.height;
      var imageData = ctx!.getImageData(0, 0, width, height);
      var overlayData = overlayCtx!.getImageData(0, 0, width, height);
      var MapData : MapData = response.data;
      for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
          const mapPoint : MapPoint = MapData.mapPoints[x][y];
          const heightNormalized = normalizeValue(mapPoint.height,MapData.minHeight,MapData.maxHeight);
          var index = (x + y * width) * 4;
          const colorMap = heightColorMap.find((map) => heightNormalized >= map.heightRange[0] && heightNormalized < map.heightRange[1]);
          let color: RGBA = colorMap ? colorMap.color : errorPink; // default to error color
          let steepness: number = mapPoint.steepness ?? 0;

          let steepnessSum = 0;
          if (y>0) steepnessSum += MapData.mapPoints[x][y-1].steepness ?? 0;
          if (y<height-1) steepnessSum +=MapData.mapPoints[x][y+1].steepness ?? 0;
          if (x>0) steepnessSum += MapData.mapPoints[x-1][y].steepness ?? 0;
          if (x<width-1) steepnessSum += MapData.mapPoints[x+1][y].steepness ?? 0;

          
          if (steepness >= 0.15 && !mapPoint.isWater) {
            color = cliff;
            if (steepness > 0.2) color = steepCliff;
          }

          if ((steepnessSum >= 0.45 && steepness < 0.15) && !mapPoint.isWater) {
            //color = highlands;
           
          }
          let tempColor = temperatureToColor(mapPoint.temperature!);
          setColor(imageData,index,color);
          setColor(overlayData,index,tempColor);
        }
      }
      ctx!.putImageData(imageData, 0, 0);
      overlayCtx!.putImageData(overlayData,0,0);
    })
    .catch(function (error) {
      console.log(error);
    });
}

};


draw();

function normalizeValue(value: number, minValue: number, maxValue: number): number {
  return (value - minValue) / (maxValue - minValue);
}

function setColor(imageData:ImageData, index:number, color:RGBA) {
  imageData.data[index] = color[0];
  imageData.data[index+1] = color[1];
  imageData.data[index+2] = color[2];
  imageData.data[index+3] = color[3];
}

interface HeightColorMap {
  heightRange: [number, number];
  color: RGBA;
  label: string;
}

const heightColorMap: HeightColorMap[] = [
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

interface MapPoint {
  x: number; // X-coordinate of the point
  y: number; // Y-coordinate of the point
  height: number; // Height of the point above sea level
  isWater: boolean; // Whether the point is covered by water
  waterType?: "salt" | "fresh"; // The type of water covering the point (optional)
  temperature?: number; // Temperature at the point (optional)
  precipitation?: number; // Precipitation at the point (optional)
  vegetation?: string[]; // Types of vegetation at the point (optional)
  soilType?: string; // Type of soil at the point (optional)
  population?: number; // Population density at the point (optional)
  steepness?: number; // How steep is the point?
}

class MapData {
  mapPoints: MapPoint[][];
  maxHeight: number;
  minHeight: number;

  constructor(mapPoints: MapPoint[][], maxHeight: number, minHeight: number) {
    this.mapPoints = mapPoints;
    this.maxHeight = maxHeight;
    this.minHeight = minHeight;
  }
}

function temperatureToColor(temperature: number): RGBA {
  //temperature = 
  let temperatureMin = 40;
  let temperatureMax = -20;
  let saturationMin = 0;
  let saturationMax = 240;
  //let val = Math.round(((temperature - minTemp) * 255) / ((maxTemp) - minTemp));
  let val =saturationMin + (temperature-temperatureMin)*(saturationMax-saturationMin)/(temperatureMax-temperatureMin);
  if (val < 0) val = 0;
  else if (val > 240) val = 240;
  const hue = val;//((temperature)/60) * 240; // Map temperature to hue value between 0 and 240 (blue to red)
  const saturation = 1; // Set saturation to 1 (100%)
  const lightness = 0.5; // Set lightness to 0.5 (50%)
  const alpha = 1; // Set alpha to 1 (100% opaque)

  // Convert HSL color to RGB color
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hue >= 0 && hue < 60) {
    r = chroma;
    g = x;
  } else if (hue >= 60 && hue < 120) {
    r = x;
    g = chroma;
  } else if (hue >= 120 && hue < 180) {
    g = chroma;
    b = x;
  } else if (hue >= 180 && hue < 240) {
    g = x;
    b = chroma;
  } else if (hue >= 240 && hue < 300) {
    r = x;
    b = chroma;
  } else if (hue >= 300 && hue < 360) {
    r = chroma;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  
  return [r, g, b, 100]; // Return the RGBA color tuple
}

