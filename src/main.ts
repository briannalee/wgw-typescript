import axios from "axios";

async function draw() {


var canvas = document.createElement('canvas');
canvas.width = 1000;
canvas.height = 1000;
document.body.appendChild(canvas);
let ctx : CanvasRenderingContext2D | null = canvas.getContext('2d');

if (ctx != null) {

    axios.post('http://localhost:3000/getMap', {
        password: "Jason Sweet"
    })
    .then(function (response) {
      let width : number = canvas.width;
      let height : number = canvas.height;
      var imageData = ctx!.getImageData(0, 0, width, height);
      var data : number[][] = response.data;
      for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
          var color = Math.floor(data[x][y] * 255);
          var index = (x + y * width) * 4;
          imageData.data[index + 0] = color;
          imageData.data[index + 1] = color;
          imageData.data[index + 2] = color;
          imageData.data[index + 3] = 255;
        }
      }
      ctx!.putImageData(imageData, 0, 0);
    })
    .catch(function (error) {
      console.log(error);
    });
}

};

draw();

