import './styles/global';
import * as faceapi from 'face-api.js';
import { IPoint, resizeResults as resizeDetections } from 'face-api.js';
import { IMAGES } from './images';
import { Geo } from './utils/geo';
import { World } from './components/world';
import { Head } from './components/body/head';

const video: HTMLVideoElement = <HTMLVideoElement>document.getElementById('video');
let canvas: HTMLCanvasElement;
let world:World;
let head:Head;
let isMaximized = false;

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/assets/models'),
]).then(start);

function toggleMaximize () {
    console.log('toggleMaximize');
    isMaximized = !isMaximized;
    updateMaximized();
}

function updateMaximized () {
    const outputContainer = document.getElementById('output-container')
    const toggleFullscreenButton = document.getElementById('toggleMaximize-button');
    if(isMaximized){
        outputContainer.classList.remove('minimized');
        outputContainer.classList.add('maximized');
    } else {
        outputContainer.classList.add('minimized');
        outputContainer.classList.remove('maximized');
    }
}
    
function start() {

    toggleMaximize();

    world = new World(document.querySelector('#world'));
    head = new Head(document.querySelector('#head'));

    navigator.getUserMedia(
        { video: {}},
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

video.addEventListener('play', () => {
    console.log('--- play ---');
    canvas = faceapi.createCanvasFromMedia(video);
    canvas.classList.add('canvas');
    canvas.width = 720;
    canvas.height = 560;

    const videoContainer = <HTMLDivElement>document.getElementById('video-container');
    videoContainer.appendChild(canvas);
 
    const displaySize = { width:canvas.width, height:canvas.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const results = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        const resizedResults = faceapi.resizeResults(results, displaySize);
        // faceapi.draw.drawDetections(canvas, resizedResults);
       
        if(resizedResults.length > 0) {
            faceapi.draw.drawFaceLandmarks(canvas, resizedResults);

          //  drawLandmarks(resizedResults[0]);
            const roll = Geo.getRoll(resizedResults[0]);
            // drawRoll(resizedResults[0], roll);

            const yaw = Geo.getYaw(resizedResults[0]);
           // drawRoll(resizedResults[0], yaw);

            head.setData(resizedResults[0]);
        }
    }, 100)
});

function drawRoll(results:faceapi.WithFaceLandmarks<any>, roll:number) {
    
    const rightEyeCenter = Geo.getCenterOfEye(results.landmarks.getRightEye());
    const leftEyeCenter = Geo.getCenterOfEye(results.landmarks.getLeftEye());

    const centerBetweenEyes = {
        x:leftEyeCenter.x + (rightEyeCenter.x - leftEyeCenter.x) / 2,
        y:leftEyeCenter.y + (rightEyeCenter.y - leftEyeCenter.y) / 2,
    };

    const bottomPoint = rotate(0, 0, 0, 400, roll);
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';

    ctx.beginPath();
    ctx.moveTo(centerBetweenEyes.x, centerBetweenEyes.y);
    ctx.lineTo(centerBetweenEyes.x + bottomPoint.x, centerBetweenEyes.y + bottomPoint.y);

    ctx.stroke();    
}

function rotate(cx:number, cy:number, x:number, y:number, radians:number) {
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);
    var nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
    var ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return {x:nx, y:ny};
 }

function drawLandmarks(results:faceapi.WithFaceLandmarks<any>) {
    const rightEye = results.landmarks.getRightEye();
    drawDebug(rightEye, 'red');
    drawEye(IMAGES.EYE_RIGHT, rightEye, 1.8);

    const leftEye = results.landmarks.getLeftEye();
    drawDebug(leftEye, 'green');
    drawEye(IMAGES.EYE_LEFT, leftEye, 1.6);
}


function drawEye(source:CanvasImageSource, positions:IPoint[], scale = 1) {
    const left = positions[0].x;
    const right = positions[3].x;
    const top = positions[2].y;
    const bottom = positions[5].y;
    const eyeWidth = scale * (right - left);
    const height = <number>source.height * (eyeWidth / <number>source.width);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(source, 
        left + (right-left)/2 - eyeWidth/2, 
        top  + (bottom-top)/2 - height/2, 
        eyeWidth, 
        height);
}

function drawDebug(positions:IPoint[], color:string) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(positions[0].x, positions[0].y);
    positions.forEach(position => {
        ctx.lineTo(position.x, position.y);
    })

    ctx.stroke();
}



start();
(<any>window).toggleMaximize = toggleMaximize;