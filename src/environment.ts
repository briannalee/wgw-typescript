import { App } from "./app";

export class Environment {
  width: number;
  height: number;
  mapX: number;
  mapY: number;
  scale: number = 1;


  constructor(mapX: number, mapY: number, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.mapX = mapX;
    this.mapY = mapY;
  }

  drawMap(app: App) {

  }

  public drawLoadingScreen(app: App) {
    
  }
}