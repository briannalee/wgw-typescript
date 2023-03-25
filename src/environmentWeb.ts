import { App } from "./app";
import { Environment } from "./environment";
import { MapData, MapPoint } from "../../wgw-node/src/mapData";
import { RGBA } from "../../wgw-node/src/colors";
import { Shape, Triangle } from "./shapes";
import styles from "./css/app.module.css";

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
  public constructor(contentAreaId: string, stages: string[]) {
    let contentArea: HTMLElement = document.createElement("main");
    contentArea.id = contentAreaId;
    document.body.append(contentArea);

    // Get/Set the width & height of the content area
    super(contentArea.offsetWidth, contentArea.offsetHeight);
    console.log(contentArea.offsetHeight);

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
    this.drawMapLayers(app,this.stage[0].context,this.stage[1].context);
    this.drawUI(app,this.stage[2].context);
  }

  private drawMapLayers(app: App, ctx: CanvasRenderingContext2D, ctxOverlay: CanvasRenderingContext2D, mapX?: number, mapY?: number) {
    mapX = mapX ?? 0;
    mapY = mapY ?? 0;

    const mapData: MapData = app.getMapData();
    const drawWidth: number = app.env.width;
    const drawHeight: number = app.env.height;

    var imageData = ctx.getImageData(0, 0, drawWidth, drawHeight);
    var ctxImageData = ctxOverlay.getImageData(0, 0, drawWidth, drawHeight);

    for (var x = 0; x < drawWidth; x++) {
      for (var y = 0; y < drawHeight; y++) {
        // pixel data index tracker, 4 indices (RGBA) are used per pixel
        const pixelDataIndex = (x + y * drawWidth) * 4;

        // mapPoint at this x,y
        const scaleX = mapData.width/drawWidth;
        const scaleY = mapData.height/drawHeight;
        const scale = Math.max(Math.min(scaleX,scaleY),0.25);
        const xIndex = Math.max(0,Math.min(Math.round(x*scale),mapData.width-1));
        const yIndex = Math.max(0,Math.min(Math.round(y*scale),mapData.height-1));
        let mapPoint: MapPoint;


        try {
          mapPoint = mapData.mapPoints[xIndex][yIndex];
        } catch (error) {
          throw new Error("invalid index: " + xIndex + " | " + yIndex);
        }

        this.setColor(imageData, pixelDataIndex, mapPoint.color);
        this.setColor(ctxImageData,pixelDataIndex,mapPoint.overlayTemp);
      }
    }
    ctx.putImageData(imageData, 0, 0);
    ctxOverlay.putImageData(ctxImageData, 0, 0);
  }

  private drawUI(app: App, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    const startX = this.width - 50;
    const startY = this.height - 75;
    this.drawShape(ctx,Triangle,startX,startY);

    let button: HTMLButtonElement = document.createElement('button') as HTMLButtonElement;
    button.className=styles.overlayButton;
    button.textContent="Overlay";
    ctx.canvas.parentElement!.append(button);
  }

  private drawShape(ctx: CanvasRenderingContext2D, shape: Shape, startX: number, startY: number) {
    ctx.beginPath();
    ctx.fillStyle = `rbga(${shape.color[0],shape.color[1],shape.color[2],shape.color[3]})`;
    ctx.moveTo(startX, startY);
    for (let i = 0; i < shape.points.length; i++) {
      const element = shape.points[i];
      ctx.lineTo(startX+element.x,startY+element.y);
    }
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