import axios from "axios";
import { MapData, MapMetadata, MapPage, MapPoint } from "../../wgw-node/src/mapData";
import { App } from "./app";
import { WebEnvironment } from "./environmentWeb";
import styles from "./css/app.module.css";

let application: App;
let mapPages: MapPage[] = [];
let mapData: MapMetadata;

init();

function init() {
  application = new App(new WebEnvironment(styles.main,[styles.app,styles.overlay,styles.ui]));
  loadApp();
}

async function loadApp() {
  /*const i = 0;
  axios.post(
    'http://localhost:3000/getMap',{
      file: `${i}`,
    },
    {
      responseType: 'arraybuffer',
      decompress : true,
    })
  .then(async function (response) {
    // Handle server response
    const mapData: MapData = response.data as MapData;

    application.start(mapData);
  })
  .catch(function (error) {
    console.log(error);
  });
  */
  getMapData('http://localhost:3000');
  //application.start(mapData);
}

/**
 * Function to request the map data from the server.
 * First requests the map metadata, then requests the mapPoints array in parts.
 * @param serverUrl The url of the server to request the map data from.
 */
async function getMapData(serverUrl: string){
  getMapMetadata(serverUrl);
}

/**
 * Function to request the map metadata from the server using axios post request.
 */
async function getMapMetadata(serverUrl: string){
  axios.post(
    serverUrl + '/getMap',
    {
      file: 'metadata',
    }).then(async function(response){
      console.log("Got map metadata");
      mapData = response.data as MapMetadata;
      console.log(response.data as MapMetadata + " " + mapData.numParts);
      getMapPoints(serverUrl, mapData.numParts!, mapData);
    });
}

/**
 * Function to request the mapPoints array from the server using axios post request.
 */
async function getMapPoints(serverUrl: string, numParts: number, mapMetadata: MapMetadata) {
console.log("Getting map points...");
  for(let i = 0; i < numParts; i++) {
    axios.post(
      serverUrl + '/getMap',
      {
        file: `${i}`,
      }).then(async function(response) {
        console.log("Got map page " + i);
        let page: MapPage = response.data as MapPage;
        mapPages.push(page);
        console.log("Map pages: " + mapPages.length + " / " + numParts)
        if (mapPages.length >= numParts) {
          application.start(assembleMapData());
        }
      });
  }
}

/**
 * Function to assemble to MapPages into a MapData object and return it.
 * Accepts the MapMetadata and the MapPages array, looping through the MapPages array
 * and adding the MapPoints to a MapPoints array in the correct order, based on MapPage.page.
 */
function assembleMapData(): MapData {
  let mapPoints: MapPoint[][] = [];
  console.log("Assembling map data..." + mapData.numParts);
  for(let i = 0; i < mapData.numParts!; i++) {
    for(let j = 0; j < mapPages.length; j++) {
      console.log("Checking page " + i + " against page " + mapPages[j].page + "..." + j);
      if (mapPages[j].page == i) {
        console.log("Adding page " + i);
        mapPoints = mapPoints.concat(mapPages[j].mapPoints);
        break;
      }
    }
  }
  return new MapData(mapPoints, mapData);
}


