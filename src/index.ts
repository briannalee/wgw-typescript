import axios from "axios";
import { MapData } from "../../wgw-node/src/mapData";
import { App } from "./app";
import { WebEnvironment } from "./environmentWeb";
import styles from "./css/app.module.css";

let application: App;

init();

function init() {
  application = new App(new WebEnvironment(styles.main,[styles.app,styles.overlay,styles.ui]));
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


