import axios from "axios";
import { inflate } from "pako";
import { MapData } from "../../wgw-node/src/mapData";
import { App } from "./app";
import { WebEnvironment } from "./environmentWeb";

let application: App;

init();

function init() {
  application = new App(new WebEnvironment("main",["app","overlay","ui"]));
  loadApp();
}

async function loadApp() {
  axios.post(
    'http://localhost:3000/getMap', {
    'responseType' : 'arraybuffer',
    'decompress' : 'true',
  })
  .then(async function (response) {
    // Handle server response
    const mapData: MapData = response.data as MapData;

    application.start(mapData);
  })
  .catch(function (error) {
    console.log(error);
  });
}


