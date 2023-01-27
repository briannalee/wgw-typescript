"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');
//const axios = require('axios').default;
const axios_1 = __importDefault(require("axios"));
async function draw() {
    async function postData() {
        let user = {
            username: 78912,
            password: "Jason Sweet"
        };
        try {
            const response = await axios_1.default.post("http://localhost:3000/getMap", user);
            console.log("Request successful: " + response.data);
        }
        catch (error) {
            if (error.response) {
                console.log(error.response.status);
            }
            else {
                console.log(error.message);
            }
        }
    }
    await postData();
}
;
draw();
//# sourceMappingURL=main.js.map