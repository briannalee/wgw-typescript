import { App } from "./app";
import { Environment } from "./environment";
import { MapData, MapPoint } from "../../wgw-node/src/mapData";
import { Colors, DecimalToRGB } from "../../wgw-node/src/colors";
import { DownTriangle, LeftTriangle, MagnifyingGlassMinus, MagnifyingGlassPlus, RightTriangle, Shape, UpTriangle } from "./shapes";
import styles from "./css/app.module.css";

export interface CanvasStage {
  element: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

/**
 * Interface to hold coordinates
 */
export interface Vector2 {
  x: number;
  y: number;
}

export interface uiElementBoundaries {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface uiElement {
  uiElementBoundaries: uiElementBoundaries;
  shape: Shape;
  func: Function;
}

export class WebEnvironment extends Environment {
  /**
   * The canvas(s) to draw the app on
   */
  stage: CanvasStage[];

    /**
   * The speed at which the map moves when the mouse is at the edge of the screen
   */
  mapMoveSpeed = 10;

  zoomSpeed = 0.1;

  qualityFactor = 1;

  /**
   * Highlight Point
   */
  highlightPoint:Vector2 = {x:0,y:0};

  /**
   * Mouse position on the map
   */
  mousePosition: Vector2 = {x:0,y:0};

  /**
   * 
   */

  /**
   * The hidden HTML canvas to store image data in
   */
  hiddenCanvas!: OffscreenCanvas;

  /**
   * UI elements
   */
  uiElements: uiElement[] = [];

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
    super(0,0,contentArea.offsetWidth, contentArea.offsetHeight);

    // Populate stage array, up to 12 stages
    this.stage = new Array(Math.min(stages.length,12));

    for (let i = 0; i < this.stage.length; i++) {
      this.stage[i] = this.createCanvas(contentArea,stages[i]);
    }

    // Input Handler
    let classAccessor = this;
    this.stage[this.stage.length-1].element.addEventListener("mouseup", function(e){
      classAccessor.mouseClickEvent(e as MouseEvent);
    });

    this.stage[this.stage.length-1].element.addEventListener("mousemove", function(e){
      classAccessor.updateMousePosition(e as MouseEvent);
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

  
    this.setScale(app);

    this.drawMapLayers(app);
    this.drawMapBitmap(app,this.hiddenCanvas,this.stage[0].context);
    this.drawUI(app,this.stage[2].context);
  }

  private setScale(app: App, scale?: number) {
    const mapData: MapData = app.getMapData();
    const drawWidth: number = app.env.width;
    const drawHeight: number = app.env.height;

    if (scale === undefined) {
      const scaleX = mapData.mapMetadata.width / drawWidth;
      const scaleY = mapData.mapMetadata.height / drawHeight;
      this.scale = Math.min(scaleX, scaleY);
    }else{
      const scaleX = this.hiddenCanvas.width / drawWidth;
      const scaleY = this.hiddenCanvas.height / drawHeight;
      this.scale = Math.min(scaleX, scaleY, scale);
    }
  }

  /**
   * Draws the view bitmap on the canvas.
   */
  private drawMapBitmap(app: App, canvas: OffscreenCanvas, ctx: CanvasRenderingContext2D) {
    const sw = Math.min(app.env.width * this.scale,canvas.width);
    const sh = Math.min(app.env.height * this.scale,canvas.height);
    ctx.drawImage(canvas, app.env.mapX, app.env.mapY, sw, sh,0,0,app.env.width,app.env.height);
  }

  /**
   * Draws the map layers on the hidden canvas
   * @param app 
   */ 
  private drawMapLayers(app: App) {
    const mapData: MapData = app.getMapData();

    // Make scratch canvas
    let scratchScale = this.qualityFactor;
    // HACK: This is a hack to get the hidden canvas to work with safari
    this.hiddenCanvas = document.createElement("canvas") as unknown as OffscreenCanvas;
    this.hiddenCanvas.width = mapData.mapMetadata.width * scratchScale;
    this.hiddenCanvas.height = mapData.mapMetadata.height * scratchScale;
    let ctx: OffscreenCanvasRenderingContext2D = this.hiddenCanvas.getContext("2d") as unknown as OffscreenCanvasRenderingContext2D;
    var imageData = ctx.getImageData(0, 0, mapData.mapMetadata.width * scratchScale, mapData.mapMetadata.height * scratchScale);

    for (var x=0; x < mapData.mapMetadata.width*scratchScale; x++) {
      for (var y=0; y < mapData.mapMetadata.height*scratchScale; y++) {
        // pixel data index tracker, 4 indices (RGBA) are used per pixel
        const pixelDataIndex = (x + y * mapData.mapMetadata.width * scratchScale) * 4;
        
        const xIndex = Math.max(0,Math.min(Math.round(x/scratchScale),mapData.mapMetadata.width-1));
        const yIndex = Math.max(0,Math.min(Math.round(y/scratchScale),mapData.mapMetadata.height-1));

        this.setColor(imageData, pixelDataIndex, mapData.mapPoints[xIndex][yIndex].c!,1);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  private drawUI(app: App, ctx: CanvasRenderingContext2D) {
    this.drawFourMapButtons(app, ctx, 5, 5);
    this.drawMagnifyingGlass(app, ctx, app.env.width-50, 100);
    let button: HTMLButtonElement = document.createElement('button') as HTMLButtonElement;
    button.className=styles.overlayButton;
    button.textContent="Overlay";
    button.addEventListener("click", this.toggleOverlay.bind(this));
    ctx.canvas.parentElement!.append(button);
    const classAccessor = this;
    window.requestAnimationFrame(this.drawUIAnimation.bind(this));
  }

  /**
   * Draws animation for the UI
   * @param app
   */
  private drawUIAnimation() {
    this.drawMapTileHighlight();
    window.requestAnimationFrame(this.drawUIAnimation.bind(this));
  }

  /** 
   * Draws square around currently highlighted map tile based on mouse position
   * 
   */
  public drawMapTileHighlight() {

    
   
    const ctx: CanvasRenderingContext2D = this.stage[2].context;
    ctx.clearRect(this.highlightPoint.x-2,this.highlightPoint.y-2,4,4);
    this.highlightPoint = this.getScreenCoordinates(this.mousePosition);
    ctx.beginPath();
    ctx.moveTo(this.highlightPoint.x-2, this.highlightPoint.y-2);
    ctx.lineTo(this.highlightPoint.x +2, this.highlightPoint.y-2);
    ctx.lineTo(this.highlightPoint.x +2, this.highlightPoint.y+2);
    ctx.lineTo(this.highlightPoint.x, this.highlightPoint.y+2);
    ctx.lineTo(this.highlightPoint.x-1, this.highlightPoint.y+2);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * MapPoint to screen coordinates
   */
  private getScreenCoordinates(mapPoint: Vector2): Vector2 {
    return {
      x: (mapPoint.x-this.mapX) / this.scale /this.qualityFactor,
      y: (mapPoint.y-this.mapY) / this.scale /this.qualityFactor
    };
  }

  
  /**
   * Updates the mouse map position variable on mouse move
   */
  private updateMousePosition(e: MouseEvent) {
    this.mousePosition = this.getMapMousePosition(e);
  }


  toggleOverlay() {
    if (this.stage[1].element.classList.contains(styles.hidden)) {
      this.stage[1].element.classList.remove(styles.hidden);
    } else {
      this.stage[1].element.classList.add(styles.hidden);
    }
  }


  private drawFourMapButtons(app: App, ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.drawCanvasUIShape(ctx, app, 0+x, 25+y, LeftTriangle, this.moveMapButtonClicked.bind(this, app, 0));
    this.drawCanvasUIShape(ctx, app, 75+x, 25+y, RightTriangle, this.moveMapButtonClicked.bind(this, app, 1));
    this.drawCanvasUIShape(ctx, app, 25+x, 0+y, UpTriangle, this.moveMapButtonClicked.bind(this, app, 2));
    this.drawCanvasUIShape(ctx, app, 25+x, 75+y, DownTriangle, this.moveMapButtonClicked.bind(this, app, 3));
  }

  private drawMagnifyingGlass(app: App, ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.drawCanvasUIShape(ctx, app, x, y, MagnifyingGlassPlus, this.zoomMapButtonClicked.bind(this, app,1));
    this.drawCanvasUIShape(ctx, app, x, y+50, MagnifyingGlassMinus, this.zoomMapButtonClicked.bind(this, app,-1));
  }

  private zoomMapButtonClicked(app: App, direction: number) {
    this.zoomMap(app, this.scale + direction * this.zoomSpeed);
  }

  private zoomMap(app: App, zoom: number) {
    //his.scale = zoom;
    this.setScale(app,zoom);


    this.checkMapPosition(app);
    
    //this.drawMapLayers(app,this.stage[0].context,this.stage[1].context);
    this.drawMapBitmap(app,this.hiddenCanvas,this.stage[0].context);
    console.log("Zoom: " + zoom);
  }

  /**
   * Method to check the map position and update as needed to ensure it is within the bounds of scratch canvas
   * considering the size of the map, the current viewport scale (this.scale) and scratch canvas scale (this.qualityFactor)
   */
  private checkMapPosition(app: App) {
    const mapData = app.getMapData();
    const mapWidth = mapData.mapMetadata.width;
    const mapHeight = mapData.mapMetadata.height;
    const mapX = app.env.mapX;
    const mapY = app.env.mapY;
    const scale = this.scale;
    const qualityFactor = this.qualityFactor;
    const viewportWidth = app.env.width;
    const viewportHeight = app.env.height;
    const maxX = mapWidth*qualityFactor - (viewportWidth / scale);

    if (mapX < 0) { 
      app.env.mapX = 0;
    } else if (mapX + (viewportWidth * scale) > mapWidth*qualityFactor) {
      app.env.mapX = (mapWidth*qualityFactor) - (viewportWidth * scale);
    }
    if (mapY < 0) {
      app.env.mapY = 0;
    } else if (mapY + (viewportHeight * scale) > mapHeight*qualityFactor) {
      app.env.mapY = (mapHeight*qualityFactor) - (viewportHeight * scale);
    }
  }




  private drawCanvasUIShape(ctx: CanvasRenderingContext2D, app: App, x: number, y: number, shape: Shape, func: Function) {
    this.drawShape(ctx, shape, x, y);
    this.uiElements.push({ uiElementBoundaries: { left: x, top: y, right: x + 50, bottom: y + 50 }, shape: shape, func: func });
  }

  moveMap(app: App, x: number, y: number): void {
    app.env.mapX = x;
    app.env.mapY = y;
    this.drawMapBitmap(app,this.hiddenCanvas,this.stage[0].context);
  }

  disableOverlay(): void {
    this.stage[1].element.style.display="none";
  }



  moveMapButtonClicked(app: App, direction: number) {
    switch (direction) {
      case 0:
        if (app.env.mapX-this.mapMoveSpeed > 0) {
          this.moveMap(app,app.env.mapX-this.mapMoveSpeed,app.env.mapY);
        }
        break;
      case 1:
        if ((app.env.mapX+this.mapMoveSpeed)+(this.width*this.scale) < (app.getMapData().mapMetadata.width*this.qualityFactor)) {
          this.moveMap(app,app.env.mapX+this.mapMoveSpeed,app.env.mapY);
        }
        break;
      case 2:
        if (app.env.mapY-this.mapMoveSpeed > 0) {
          this.moveMap(app,app.env.mapX,app.env.mapY-this.mapMoveSpeed);
        }
        break;
      case 3:
        if ((app.env.mapY+this.mapMoveSpeed)+(this.height*this.scale) < (app.getMapData().mapMetadata.height*this.qualityFactor)) { 
          this.moveMap(app,app.env.mapX,app.env.mapY+this.mapMoveSpeed);
         }
        break;
      default:
        break;
    }
  }



  private drawShape(ctx: CanvasRenderingContext2D, shape: Shape, startX: number, startY: number) {
    ctx.beginPath();
    ctx.fillStyle = `${shape.color.toString(16)}`;

    ctx.moveTo(startX+shape.points[0].x, startY+shape.points[0].y);
    for (let i = 1; i < shape.points.length; i++) {
      const element = shape.points[i];
      ctx.lineTo(startX+element.x,startY+element.y);
    }
    ctx.fill();
  }

  /**
   * 
   * @param imageData The HTML Canvas Context ImageData to work with
   * @param index Starting index of the pixel data
   * @param color Decimal color to apply to the pixel
   * @param alpha Alpha value to apply to the pixel 0-1
   */
  private setColor(imageData:ImageData, index:number, color:number, alpha:number) {
    let rgb = DecimalToRGB(Colors[color]);
    imageData.data[index] = rgb[0];
    imageData.data[index+1] = rgb[1];
    imageData.data[index+2] = rgb[2];
    imageData.data[index+3] = alpha*255;
  }

  /**
     * 
     * @param event - Mouse click event
     * @returns - Coordinates as mouseClick interface
     */
  getMousePosition(event: MouseEvent) : Vector2 {
    let rect = this.stage[0].element.getBoundingClientRect(), // abs. size of element
    scaleX = this.stage[0].element.width / rect.width,    // relationship bitmap vs. element for x
    scaleY = this.stage[0].element.height / rect.height;  // relationship bitmap vs. element for y

    return {
        x: (event.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (event.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
  }

  /**
   * Gets the mouse position relative to the map, considering the map's position on the canvas
   * the scale of the viewport, and the quality factor of the map
   */
  getMapMousePosition(mousePos: Vector2) : Vector2 {
    let mapX = ((this.mapX*this.qualityFactor) + (mousePos.x*this.scale));
    let mapY = ((this.mapY*this.qualityFactor) + (mousePos.y*this.scale));
    // Snap to map grid
    mapX = Math.floor(mapX/this.qualityFactor)*this.qualityFactor;
    mapY = Math.floor(mapY/this.qualityFactor)*this.qualityFactor;
    return {x: mapX, y: mapY};
  }


  /**
   * Handles mouse clicks
   * 
   * @param e - Triggering event
   */
  mouseClickEvent(e:MouseEvent) {
    let mousePos : Vector2 = this.getMousePosition(e);
    console.log(this.getMapMousePosition(e));
    this.uiElements.forEach(element => {
      if (mousePos.x >= element.uiElementBoundaries.left && mousePos.x <= element.uiElementBoundaries.right && mousePos.y >= element.uiElementBoundaries.top && mousePos.y <= element.uiElementBoundaries.bottom) {
        element.func();
      }
    });

  }

  public drawLoadingScreen() {
    let ctx = this.stage[0].context;
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,this.width,this.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Loading...",this.width/2,this.height/2);
  }
  
}