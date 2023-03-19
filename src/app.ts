import { Environment } from "./environment";
import { MapData } from "../../wgw-node/src/mapData";

export class App {
  /**
   * Variables holding current instance of app and data
   */
  env: Environment;
  map: MapData | undefined;

  public constructor(env: Environment) {
    this.env = env;
    this.env.drawLoadingScreen(this);
  }

  public start(mapData: MapData) {
    this.map = mapData;
    this.env.drawMap(this);
    
  }

  public getMapData(): MapData {
    if (this.map == undefined) throw new Error("Corrupt map data from remote server, server response OK");
    return this.map!;
  }
}
