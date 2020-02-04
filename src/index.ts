import './styles/global';
import * as faceapi from 'face-api.js';
import { IPoint, resizeResults as resizeDetections } from 'face-api.js';
import { Geo } from './utils/geo';
import { World } from './components/world';
import { Head } from './components/body/head';
import { SmileyHead } from './components/smiley/smiley-head';
import { sources } from './sources.model';

const video: HTMLVideoElement = <HTMLVideoElement>document.getElementById('video');
const image: HTMLImageElement = <HTMLImageElement>document.getElementById('image');
let imageCanvas: HTMLCanvasElement;
let videoCanvas: HTMLCanvasElement;
let canvas: HTMLCanvasElement;

let world:World;
let head:Head | SmileyHead;
let isMaximized = false;
let sourceIdx = 0;
let doTurnHead:boolean = true;
let mode: 'video' | 'image';
let intervalId:NodeJS.Timeout;

function setMode(value:'video' | 'image') {
   
    if(mode != value){
        mode = value;

        const imageContainer = <HTMLDivElement>document.getElementById('image-container');
        const videoContainer = <HTMLDivElement>document.getElementById('video-container');

        switch(mode){
            case 'video':
                videoContainer.classList.remove('invisible');
                imageContainer.classList.add('invisible');
                break;
            case 'image':
                videoContainer.classList.add('invisible');
                imageContainer.classList.remove('invisible');
                break;
        }
    }
}


function clearUpdateInterval(){
    clearInterval(intervalId);
}

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
    isMaximized = !isMaximized;
    updateMaximized();
}

function selectImage(idx:number){
    if(sourceIdx != idx){
        sourceIdx = idx;
        const source = sources[sourceIdx];
        clearUpdateInterval();
        if(source.title == 'Camera'){
            onVideoChanged();
        }else{
            image.src = source.src;
            onImageChanged();
        }
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

    const imageSelect = <HTMLSelectElement>document.querySelector('#image-select');
    sources.forEach((source, i) => {
        const optionElem = document.createElement('option');
        optionElem.innerHTML = source.title;
        imageSelect.appendChild(optionElem);
    })
    imageSelect.selectedIndex = sourceIdx;
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
    sourceIdx = 1;
    init();
    loadLibraries().then(onImageChanged);
}

function onImageChanged(){    
    console.log('libries loaded image complete: ', image.complete);
    setMode('image');
    if (image.complete) {
        startDetectingImage ();
    } else {
        image.addEventListener('load', startDetectingImage);
    }
}

function onVideoChanged(){
    console.log('##### onVideoChanged ####### ', video.readyState);
    setMode('video');
    
    if(video.readyState == 0){
        navigator.getUserMedia(
            { video: { } },
            stream => {
                video.srcObject = stream
            },
            err => console.error(err)
        )

        video.addEventListener('canplay', (ev:Event) => {
            console.log('--- canplay ---', ev);
            const videoWidth = ev.target['videoWidth'];
            const videoHeight = ev.target['videoHeight'];

            video.height = videoHeight * (400 / videoWidth);

            console.log('targetvideo: ' + videoWidth + '|' + videoHeight + ' - ' + video.width + '|' + video.height); 

            startDetectingVideo();
        })           
    }else{
        startDetectingVideo();
    }
}

function startVideo() {
    sourceIdx = 0;
    init();
    loadLibraries().then(onVideoChanged);
}

function startDetectingImage () {
    const imageContainer = <HTMLDivElement>document.getElementById('image-container');

    if(imageCanvas == undefined){
        imageCanvas = faceapi.createCanvasFromMedia(image);
        imageCanvas.classList.add('canvas');
        imageContainer.appendChild(imageCanvas);    
    }
    canvas = imageCanvas;
    canvas.width = image.width;
    canvas.height = image.height;        

    faceapi.matchDimensions(canvas, { width:canvas.width, height:canvas.height });

    requestAnimationFrame(update);
}


function startDetectingVideo () {    
    const videoContainer = <HTMLDivElement>document.getElementById('video-container');

    if(videoCanvas == undefined){
        videoCanvas = faceapi.createCanvasFromMedia(video);
        videoCanvas.classList.add('canvas');
        videoContainer.appendChild(videoCanvas);    
    }
    canvas = videoCanvas;
    canvas.width = video.width;
    canvas.height = video.height;

    faceapi.matchDimensions(canvas, { width:canvas.width, height:canvas.height });

    intervalId = setInterval(async () => {
        update();
    }, 2000)
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