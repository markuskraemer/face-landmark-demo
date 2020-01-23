import * as faceapi from 'face-api.js';
import { IPoint, resizeResults as resizeDetections, FaceLandmarks68 } from 'face-api.js';

export class Geo {
    
    /* roll Z axis
    * pitch: X axis (nicken)
    * yaw: Y axis (drehen)
    */
    
    public static getRoll(results:faceapi.WithFaceLandmarks<any>):number {
        const rightEyeCenter = Geo.getCenterOfEye(results.landmarks.getRightEye());
        const leftEyeCenter = Geo.getCenterOfEye(results.landmarks.getLeftEye());
        // const roll = Math.atan2(rightEyeCenter.y - leftEyeCenter.y, rightEyeCenter.x - leftEyeCenter.x);
        const roll = Math.atan2(rightEyeCenter.x - leftEyeCenter.x, rightEyeCenter.y - leftEyeCenter.y) - Math.PI / 2;
  
        return roll;
    }

    public static getPitch(results:faceapi.WithFaceLandmarks<any>):number {
        const rightEyeCenter = Geo.getCenterOfEye(results.landmarks.getRightEye());
        const leftEyeCenter = Geo.getCenterOfEye(results.landmarks.getLeftEye());
        const jaw = results.landmarks.getJawOutline();
        const leftJawTop = jaw[0];
        const rightJawTop = jaw[jaw.length-1];

        const r = 4;
        const leftJawRef = jaw[r];
        const rightJawRef = jaw[jaw.length - 1 - r];

        const centerBetweenEyes = {
            x:leftEyeCenter.x + (rightEyeCenter.x - leftEyeCenter.x) / 2,
            y:leftEyeCenter.y + (rightEyeCenter.y - leftEyeCenter.y) / 2,
        };
    
        const centerBetweenJawTopPoints = {
            x:leftJawTop.x + (rightJawTop.x - leftJawTop.x) / 2,
            y:leftJawTop.y + (rightJawTop.y - leftJawTop.y) / 2,
        }

        const centerBetweenJawRefPoints = {
            x:leftJawRef.x + (rightJawRef.x - leftJawRef.x) / 2,
            y:leftJawRef.y + (rightJawRef.y - leftJawRef.y) / 2,
        }


        const localY = centerBetweenEyes.y - centerBetweenJawTopPoints.y; 
        let f = .5 * localY / ((centerBetweenJawTopPoints.y - centerBetweenJawRefPoints.y) / 2); 
        
        if(f > 1){
            f = 1;
        }else if(f < -1){
            f = -1;
        }

        return Math.PI / 2 * f;
    }

    public static getYaw(results:faceapi.WithFaceLandmarks<any>):number {
        const rightEyeCenter = Geo.getCenterOfEye(results.landmarks.getRightEye());
        const leftEyeCenter = Geo.getCenterOfEye(results.landmarks.getLeftEye());
        const noseCenter = results.landmarks.getNose()[3];
        const centerBetweenEyes = {
            x:leftEyeCenter.x + (rightEyeCenter.x - leftEyeCenter.x) / 2,
            y:leftEyeCenter.y + (rightEyeCenter.y - leftEyeCenter.y) / 2,
        };
    
        const localX = noseCenter.x - centerBetweenEyes.x;
        let f = localX / ((rightEyeCenter.x - leftEyeCenter.x) / 2); 
        
        if(f > 1){
            f = 1;
        }else if(f < -1){
            f = -1;
        }

        return Math.PI / 2 * f;
    }

    public static getCenterOfEye(eyePositions:IPoint[]):IPoint{
        const left = eyePositions[0].x;
        const right = eyePositions[3].x;
        const top = eyePositions[2].y;
        const bottom = eyePositions[5].y;

        return {
            x:left + (right-left)/2,
            y:top + (bottom-top)/2
        }
    }

    public static between(min:number, n:number, max:number):number {

        if(n < min){
            n = min;
        }
        if(n > max){
            n = max;
        }
        return n;
    }

    public static getLeftEyebrowOffset(results:faceapi.WithFaceLandmarks<any>):IPoint {
        const rightEyeCenter = Geo.getCenterOfEye(results.landmarks.getRightEye());
        const leftEyeCenter = Geo.getCenterOfEye(results.landmarks.getLeftEye());
        const eyebrowCenter = results.landmarks.getLeftEyeBrow()[2];
        return Geo.getEyebrowOffset(leftEyeCenter, eyebrowCenter, rightEyeCenter.x - leftEyeCenter.x | 0);
    }

    public static getRightEyebrowOffset(results:faceapi.WithFaceLandmarks<any>):IPoint {
        const rightEyeCenter = Geo.getCenterOfEye(results.landmarks.getRightEye());
        const leftEyeCenter = Geo.getCenterOfEye(results.landmarks.getLeftEye());
        const eyebrowCenter = results.landmarks.getRightEyeBrow()[2];
        return Geo.getEyebrowOffset(rightEyeCenter, eyebrowCenter, rightEyeCenter.x - leftEyeCenter.x | 0);
    }

    public static getEyebrowOffset(eyeCenter:IPoint, eyebrowCenter:IPoint, refDistance:number):IPoint {
        return {
            x: Geo.between(0, (eyeCenter.x - eyebrowCenter.x) / refDistance, 1),
            y: Geo.between(0.1, (eyeCenter.y - eyebrowCenter.y) / (refDistance/6) - 2, 1)
        }
    }
}