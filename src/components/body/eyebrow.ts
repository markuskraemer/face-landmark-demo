import { IPoint } from 'face-api.js';
import { TweenLite } from 'gsap';
import { Math2 } from '../../utils/math2';

export class Eyebrow {

    constructor(public element:HTMLDivElement) {
    }

    public setPosition(position:IPoint){
        TweenLite.to(this.element, 1, {
            x:position.x, 
            y:position.y
        });
    }
    
    public setShape(points:IPoint[]) {
        const width = Math.abs(points[points.length-1].x - points[0].x);
        const height = width/2;
        const topmostIdx = 2; 

        const mapped = points.map((p:IPoint) => {
            return { 
                x: 40 * (p.x - points[topmostIdx].x) / width,  
                y: 20 * (p.y - points[topmostIdx].y) / height  
            }
        });

        for(let i = 0; i < this.element.children.length - 1; ++i){
            const nextIdx = i + 1;
            const child:any = this.element.children[i];

            const startPoint = mapped[i];
            const endPoint = mapped[nextIdx];

            TweenLite.to(child, 1, {
                x:startPoint.x, 
                y:startPoint.y,
                rotation:Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) / Math.PI * 180,
                width:Math2.distanceBetweenPoints(startPoint, endPoint) * 1.2,
            });
        }        
    }
}