import * as faceapi from 'face-api.js';
import { Geo } from '../../utils/geo';
import { TweenLite } from 'gsap';
import { Mouth } from './mouth';
import { Eyebrow } from './eyebrow';
import { IPoint } from 'face-api.js';
import { Eye } from './eye';

export class Head {

    public static headWidth = 150;
    public static headHeight = 200;
    public static headDepth = 75;

    private _eyeOrigin:IPoint = {
        x: Head.headWidth/4,
        y:- Head.headHeight/6
    };

    private _refWidth:number = 0;

    private _pitch:number = 0;
    private _yaw:number = 0;

    private _leftEyebrow:Eyebrow;
    private _rightEyebrow:Eyebrow;
    private _leftEye:Eye;
    private _rightEye:Eye;
    private _mouth:Mouth;

    constructor(public element:HTMLDivElement) {
        this._leftEyebrow = new Eyebrow(element.querySelector('#eyebrow-left'));
        this._rightEyebrow = new Eyebrow(element.querySelector('#eyebrow-right'));
        this._leftEye = new Eye(element.querySelector('#eye-left'));
        this._rightEye = new Eye(element.querySelector('#eye-right'));
        this._mouth = new Mouth(element.querySelector('#mouth'));
    }

    public setData(results:faceapi.WithFaceLandmarks<any>) {

        this.updateRefWidth(results);

        if(this._yaw != 0){
           // return;
        }

        this._yaw = Geo.getYaw(results);
        this._pitch = Geo.getPitch(results);

        const leftEyebrowOffset = Geo.getLeftEyebrowOffset(results);
        this._leftEyebrow.setShape(results.landmarks.getLeftEyeBrow());
        this._leftEyebrow.setPosition({
            x: (-this._eyeOrigin.x) + Head.headHeight/4 * leftEyebrowOffset.x,
            y: this._eyeOrigin.y - Head.headHeight/10 - Head.headHeight/4 * leftEyebrowOffset.y
        });

        const rightEyebrowOffset = Geo.getRightEyebrowOffset(results);
        this._rightEyebrow.setShape(results.landmarks.getRightEyeBrow());
        this._rightEyebrow.setPosition({
            x: this._eyeOrigin.x - Head.headHeight/4 * rightEyebrowOffset.x,
            y: this._eyeOrigin.y - Head.headHeight/10 - Head.headHeight/4 * rightEyebrowOffset.y
        });

        this._leftEye.setShape(results.landmarks.getLeftEye(), this._refWidth * 0.6);
        this._leftEye.setPosition({
            x: (- this._eyeOrigin.x) + Head.headHeight/4 * leftEyebrowOffset.x,
            y: this._eyeOrigin.y - Head.headHeight/13 * leftEyebrowOffset.y
        });

        this._rightEye.setShape(results.landmarks.getRightEye(), this._refWidth * 0.6);
        this._rightEye.setPosition({
            x: this._eyeOrigin.x - Head.headHeight/4 * rightEyebrowOffset.x,
            y: this._eyeOrigin.y - Head.headHeight/13 * rightEyebrowOffset.y
        });

        this._mouth.setShape(results.landmarks.getMouth(), this._refWidth * 0.5);
        this._mouth.setPosition({
            x: 0,
            y: Head.headHeight/4
        });

        this.update();
    }

    private updateRefWidth(results:faceapi.WithFaceLandmarks<any>){
        const leftEyeCenter = Geo.getCenterOfEye(results.landmarks.getLeftEye());
        const rightEyeCenter = Geo.getCenterOfEye(results.landmarks.getRightEye());
        this._refWidth = rightEyeCenter.x - leftEyeCenter.x;
    }

    public update() {
        TweenLite.to(this.element, 1, {
            rotateY:this._yaw / Math.PI * 180, 
            rotateX:this._pitch / Math.PI * 180
        });
    }

}