import './styles/global';
import * as faceapi from 'face-api.js';
import { IPoint, resizeResults as resizeDetections } from 'face-api.js';
import { Geo } from './utils/geo';
import { World } from './components/world';
import { Head } from './components/body/head';
import { SmileyHead } from './components/smiley/smiley-head';

const video: HTMLVideoElement = <HTMLVideoElement>document.getElementById('video');
const image: HTMLImageElement = <HTMLImageElement>document.getElementById('image');
let canvas: HTMLCanvasElement;
let world:World;
let head:Head | SmileyHead;
let isMaximized = false;

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
    
function init(){
    updateMaximized();

    world = new World(document.querySelector('#world'));
    head = new SmileyHead(document.querySelector('#smiley-head'));
}

function loadLibraries() {
    return Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/assets/models'),
    ])
}

function startImage() {
    init();
    loadLibraries().then(() => {
        console.log('libries loaded image complete: ', image.complete);
        if (image.complete) {
            setTimeout(startDetectingImage, 1500);
        } else {
            image.addEventListener('load', () => setTimeout(startDetectingImage, 1500));
        }
    });
}

function startVideo() {
    init();
    loadLibraries().then(() => {
        console.log('##### promise all #######');
        video.addEventListener('canplay', () => {
            console.log('--- canplay ---');
            startDetectingVideo();
        })       

        navigator.getUserMedia(
            { video: {}},
            stream => video.srcObject = stream,
            err => console.error(err)
        )
  
    });    
}


function startDetectingImage () {

    const imageContainer = <HTMLDivElement>document.getElementById('image-container');
    imageContainer.classList.remove('invisible');

    canvas = faceapi.createCanvasFromMedia(image);
    canvas.classList.add('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    imageContainer.appendChild(canvas);

    faceapi.matchDimensions(canvas, { width:canvas.width, height:canvas.height });

    update(image);
}


function startDetectingVideo () {
    
    const videoContainer = <HTMLDivElement>document.getElementById('video-container');
    videoContainer.classList.remove('invisible');

    canvas = faceapi.createCanvasFromMedia(video);
    canvas.classList.add('canvas');
    canvas.width = video.width;
    canvas.height = video.height;

    videoContainer.appendChild(canvas);


    faceapi.matchDimensions(canvas, { width:canvas.width, height:canvas.height });

    setInterval(async () => {
        update(video);
    }, 100)
}

async function update(input:faceapi.TNetInput){
    const results = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    const resizedResults = faceapi.resizeResults(results, {width:canvas.width, height:canvas.height});

    if(resizedResults.length > 0) {
        faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
        head.setData(resizedResults[0]);
    }
}
 
startVideo();
(<any>window).toggleMaximize = toggleMaximize;