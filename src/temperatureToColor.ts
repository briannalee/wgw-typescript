import { RGBA } from "../../wgw-node/src/colors";

export function temperatureToColor(temperature: number): RGBA {
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