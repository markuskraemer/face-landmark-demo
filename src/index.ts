import './styles/global';
import * as faceapi from 'face-api.js';
import { IPoint, resizeResults as resizeDetections } from 'face-api.js';
import { Geo } from './utils/geo';
import { World } from './components/world';
import { Head } from './components/body/head';
import { SmileyHead } from './components/smiley/smiley-head';
import { images } from './images.model';

const video: HTMLVideoElement = <HTMLVideoElement>document.getElementById('video');
const image: HTMLImageElement = <HTMLImageElement>document.getElementById('image');
let canvas: HTMLCanvasElement;
let world:World;
let head:Head | SmileyHead;
let isMaximized = false;
let imageIdx = 0;
let doTurnHead:boolean = true;
let mode: 'video' | 'image';


function changeTurnHead (flag:boolean){
    doTurnHead = flag;
    updateDoTurnHead();
    update();
}

function updateDoTurnHead(){
    const checkbox = <HTMLFormElement>document.querySelector('#turn-head-checkbox');
    checkbox.checked = doTurnHead;
}

function toggleMaximize () {
    console.log('toggleMaximize');
    isMaximized = !isMaximized;
    updateMaximized();
}

function selectImage(idx:number){
    console.log('selectImage: ' + idx);
    if(imageIdx != idx){
        imageIdx = idx;
        image.src = images[imageIdx];
        onImageChanged();
    }
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
    updateDoTurnHead ();
    
    world = new World(document.querySelector('#world'));
    head = new SmileyHead(document.querySelector('#smiley-head'));

    const imageSelect = document.querySelector('#image-select');
    images.forEach((image, i) => {
        const optionElem = document.createElement('option');
        optionElem.innerHTML = String(i);
        imageSelect.appendChild(optionElem);
    })
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
    mode = 'image';
    init();
    loadLibraries().then(onImageChanged);
}

function onImageChanged(){    
    console.log('libries loaded image complete: ', image.complete);
    if (image.complete) {
        startDetectingImage ();
    } else {
        image.addEventListener('load', startDetectingImage);
    }
}

function startVideo() {
    mode = 'video';
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

    if(canvas == undefined){
        canvas = faceapi.createCanvasFromMedia(image);
        canvas.classList.add('canvas');
        imageContainer.appendChild(canvas);
    }
    canvas.width = image.width;
    canvas.height = image.height;


    faceapi.matchDimensions(canvas, { width:canvas.width, height:canvas.height });

    update();
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
        update();
    }, 100)
}

async function update(){

    const inputElem = mode == 'image' ? image : video;

    const results = await faceapi.detectAllFaces(inputElem, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    const resizedResults = faceapi.resizeResults(results, {width:canvas.width, height:canvas.height});

    if(resizedResults.length > 0) {
        faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
        head.setData(resizedResults[0]);
        if(doTurnHead){
            head.setRotationByResults(resizedResults[0]);
        }else{
            head.setRotation(0, 0);
        }
    }
}
 
startImage();
(<any>window).toggleMaximize = toggleMaximize;
(<any>window).selectImage = selectImage;
(<any>window).changeTurnHead = changeTurnHead;