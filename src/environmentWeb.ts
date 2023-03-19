import { App } from "./app";
import { errorPink, cliff, steepCliff, highlands } from "./colors";
import { Environment } from "./environment";
import { heightColorMap } from "./heightColorMap";
import { MapData, MapPoint } from "../../wgw-node/src/mapData";
import { normalizeValue } from "./normalizeValue";
import { RGBA } from "../../wgw-node/src/colors";

export interface CanvasStage {
  element: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

/**
 * Interface to hold coordinates for a mouse click event
 */
export interface mouseClick {
  x: number;
  y: number;
}


export class WebEnvironment extends Environment {
  /**
   * The canvas(s) to draw the app on
   */
  stage: CanvasStage[];

  /**
   * Creates canvas elements
   * Max 12
   * 
   * @param contentAreaId String HTML DOM ID of the element which to append the canvas(s)
   * @param stages String array of class names that will be applied to the canvas element(s)
   */
  public constructor(contentAreaId: string, stages?: string[]) {
    // Sanitize inputs, check content area for validity
    let contentArea: HTMLElement;
    if (contentAreaId.length < 1) throw new Error("ID of HTML element to append to is empty " + contentAreaId);
    if (!(contentArea = document.getElementById(contentAreaId)!)) {
      throw new Error("Unable to find content area by ID: " + contentAreaId);
    }
    stages = stages ?? ["app"];

    // Get/Set the width & height of the content area
    super(contentArea!.offsetWidth, contentArea!.offsetHeight);

    // Populate stage array, up to 12 stages
    this.stage = new Array(Math.min(stages.length,12));

    for (let i = 0; i < this.stage.length; i++) {
      this.stage[i] = this.createCanvas(contentArea,stages[i]);
    }

    // Input Handler
    let classAccessor = this;
    this.stage[this.stage.length-1].element.addEventListener("mouseup", function(e){
      classAccessor.mouseClickEvent(e);
    });
  }

  /**
   * Creates a canvas on the element with the ID of id
   * @param className String class name to apply to canvas
   * @param contentArea HTMLElement to append the canvas to
   * @returns CanvasStage containing the HTMLElement and drawing context
   */
  private createCanvas(contentArea: HTMLElement, className: string) : CanvasStage {
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    // Create canvas and append to page, with error handling
    if (!(canvas = document.createElement("canvas") as HTMLCanvasElement)) {
      throw new Error("Unable to create canvas: " + className);
    }

    // Set class of the canvas
    canvas.className = className;
    canvas.width = contentArea!.offsetWidth;
    canvas.height = contentArea!.offsetHeight;

    // Append the canvas to the content area 
    // [error checking done previously in class constructor]
    contentArea.append(canvas);

    // Get context, with error handling
    if (!(context = canvas.getContext("2d")!)) {
      throw new Error("2d context not supported or canvas already initialized " + className);
    }

    return {
      element: canvas,
      context: context,
    }
  }

  drawMap(app: App): void {
    this.drawMapLayer(app,this.stage[0].context);
    this.drawUI(app,this.stage[2].context);
  }

  private drawMapLayer(app: App, ctx: CanvasRenderingContext2D, mapX?: number, mapY?: number) {
    mapX = mapX ?? 0;
    mapY = mapY ?? 0;
    const mapData: MapData = app.getMapData();
    const drawWidth: number = Math.min(app.env.width,mapData.width);
    const drawHeight: number = Math.min(app.env.height,mapData.height);
    var imageData = ctx.getImageData(0, 0, drawWidth, drawHeight);

    for (var x = 0; x < drawWidth; x++) {
      for (var y = 0; y < drawHeight; y++) {
        // pixel data index tracker, 4 indices (RGBA) are used per pixel
        const pixelDataIndex = (x + y * drawWidth) * 4;

        // mapPoint at this x,y
        const mapPoint: MapPoint = mapData.mapPoints[mapX + x][mapY + y];

        // Normalized height value for this point
        const heightNormalized = normalizeValue(mapPoint.height, mapData.minHeight, mapData.maxHeight);

        // Map height to color via heightColorMap
        const colorMap = heightColorMap.find((map) => heightNormalized >= map.heightRange[0] && heightNormalized < map.heightRange[1]);
        let color: RGBA = colorMap ? colorMap.color : errorPink; // default to error color if no mapping found

        // Sample steepness of surrounding tiles
        let steepness: number = mapPoint.steepness ?? 0;

        if (steepness >= 0.025 && !mapPoint.isWater) {
          color = cliff;
          if (steepness > 0.03)
            color = steepCliff;
        }

        //let tempColor = temperatureToColor(mapPoint.temperature!);
        this.setColor(imageData, pixelDataIndex, color);
        //this.setColor(overlayData, pixelDataIndex, tempColor);
      }
    }
    ctx.putImageData(imageData, 0, 0);
    //this.stage[1].context.putImageData(overlayData, 0, 0);
  }

  private drawUI(app: App, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    const startX = this.width - 125;
    const startY = this.height - 100;
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX+100, startY+75);
    ctx.lineTo(+startX+100, startY+25);
    ctx.fill();
  }

  /**
   * 
   * @param imageData The HTML Canvas Context ImageData to work with
   * @param index Starting index of the pixel data
   * @param color RGBA color to apply to the pixel
   */
  private setColor(imageData:ImageData, index:number, color:RGBA) {
    imageData.data[index] = color[0];
    imageData.data[index+1] = color[1];
    imageData.data[index+2] = color[2];
    imageData.data[index+3] = color[3];
  }

  /**
     * 
     * @param event - Mouse click event
     * @returns - Coordinates as mouseClick interface
     */
  getMousePosition(event: MouseEvent) : mouseClick {
    let rect = this.stage[0].element.getBoundingClientRect(), // abs. size of element
    scaleX = this.stage[0].element.width / rect.width,    // relationship bitmap vs. element for x
    scaleY = this.stage[0].element.height / rect.height;  // relationship bitmap vs. element for y

    return {
        x: (event.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (event.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
  }

  /**
   * Handles mouse clicks
   * 
   * @param e - Triggering event
   */
  mouseClickEvent(e:MouseEvent) {
    let mousePos : mouseClick = this.getMousePosition(e);
    
  }

  drawLoadingScreen(app: App): void {
  this.stage[0].context.font = "4em sans-serif";
  this.stage[0].context.fillText("Loading...", this.width/3, this.height/3);
  }
}