import * as faceapi from 'face-api.js';
import { Geo } from '../../utils/geo';
import { TweenLite } from 'gsap';
import { IPoint } from 'face-api.js';
import { SmileyEye } from './smiley-eye';
import { SmileyMouth } from './smiley-mouth';
import { SmileyEyebrow } from './smiley-eyebrow';

export class SmileyHead {

    public static headWidth = 300;
    public static headHeight = 300;

    private _eyeOrigin:IPoint = {
        x: SmileyHead.headWidth/5,
        y:- SmileyHead.headHeight/6
    };

    private _refWidth:number = 0;

    private _leftEyebrow:SmileyEyebrow;
    private _rightEyebrow:SmileyEyebrow;
    private _leftEye:SmileyEye;
    private _rightEye:SmileyEye;
    private _mouth:SmileyMouth;

    constructor(public element:HTMLDivElement) {
        this._leftEyebrow = new SmileyEyebrow(element.querySelector('#eyebrow-left'));
        this._rightEyebrow = new SmileyEyebrow(element.querySelector('#eyebrow-right'));
        this._leftEye = new SmileyEye(element.querySelector('#eye-left'));
        this._rightEye = new SmileyEye(element.querySelector('#eye-right'));
        this._mouth = new SmileyMouth(element.querySelector('#mouth'));
    }

    public setData(results:faceapi.WithFaceLandmarks<any>) {
        this.element.classList.remove('invisible');
        this.updateRefWidth(results);

        const leftEyebrowOffset = Geo.getLeftEyebrowOffset(results);
        this._leftEyebrow.setShape(results.landmarks.getLeftEyeBrow());
        this._leftEyebrow.setPosition({
            x: (-this._eyeOrigin.x) + SmileyHead.headHeight/4 * leftEyebrowOffset.x,
            y: this._eyeOrigin.y - SmileyHead.headHeight/10 - SmileyHead.headHeight/4 * leftEyebrowOffset.y
        });

        const rightEyebrowOffset = Geo.getRightEyebrowOffset(results);
        this._rightEyebrow.setShape(results.landmarks.getRightEyeBrow());
        this._rightEyebrow.setPosition({
            x: this._eyeOrigin.x - SmileyHead.headHeight/4 * rightEyebrowOffset.x,
            y: this._eyeOrigin.y - SmileyHead.headHeight/10 - SmileyHead.headHeight/4 * rightEyebrowOffset.y
        });

        this._leftEye.setShape(results.landmarks.getLeftEye(), this._refWidth * 0.6);
        this._leftEye.setPosition({
            x: (- this._eyeOrigin.x) + SmileyHead.headHeight/4 * leftEyebrowOffset.x,
            y: this._eyeOrigin.y - SmileyHead.headHeight/13 * leftEyebrowOffset.y
        });

        this._rightEye.setShape(results.landmarks.getRightEye(), this._refWidth * 0.6);
        this._rightEye.setPosition({
            x: this._eyeOrigin.x - SmileyHead.headHeight/4 * rightEyebrowOffset.x,
            y: this._eyeOrigin.y - SmileyHead.headHeight/13 * rightEyebrowOffset.y
        });

        this._mouth.setShape(results.landmarks.getMouth(), this._refWidth * 0.5);
        this._mouth.setPosition({
            x: 0,
            y: SmileyHead.headHeight/3
        });

    }

    private updateRefWidth(results:faceapi.WithFaceLandmarks<any>){
        const leftEyeCenter = Geo.getCenterOfEye(results.landmarks.getLeftEye());
        const rightEyeCenter = Geo.getCenterOfEye(results.landmarks.getRightEye());
        this._refWidth = rightEyeCenter.x - leftEyeCenter.x;
    }

    public setRotationByResults(results:faceapi.WithFaceLandmarks<any>){
        this.setRotation(Geo.getYaw(results), Geo.getPitch(results)); 
    }

    public setRotation(yaw:number, pitch:number){
        TweenLite.to(this.element, 1, {
            rotateY: yaw / Math.PI * 180, 
            rotateX: pitch / Math.PI * 180
        });
    }

}