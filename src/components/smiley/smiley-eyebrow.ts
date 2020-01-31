import { IPoint } from 'face-api.js';
import { TweenLite } from 'gsap';
import { Math2 } from '../../utils/math2';
import { SmileyEye } from './smiley-eye';

export class SmileyEyebrow {

    constructor(public element:HTMLDivElement) {
    }

    public setPosition(position:IPoint){
        
        TweenLite.to(this.element, 1, {
            x:position.x, 
            y:position.y
        });
    }
    
    public setShape(rawPoints:IPoint[]) {
        const width = Math.abs(rawPoints[rawPoints.length-1].x - rawPoints[0].x);
        const height = width/2;
        const t = .4;

        let points = rawPoints.map((p:IPoint) => {
            return { 
                x: 40 * (p.x - rawPoints[0].x) / width + (width + 20 - 40) / 2,  
                y: 20 * (p.y - rawPoints[2].y) / height + (height) / 2
            }
        });
        
        const elem:any = this.element;
        elem.setAttribute ('width', width + 20);
        elem.setAttribute ('height', height + 20);

        let path = '';
        for(let i = 1; i < points.length; ++i){

            const idx0 = (i - 1 + points.length) % points.length;
            const idx1 = i % points.length;
            const idx2 = (i + 1) % points.length;

            const controllPoints = Math2.splineCurve (
                points[idx0],
                points[idx1],
                points[idx2],
                t
            );

            if(i === 1){
                path += 'M' + points[i].x + ' ' + points[i].y;
            } 
            path += ' S' 
                + controllPoints.previous.x + ' ' + controllPoints.previous.y + ', ' 
                + points[idx1].x + ' ' + points[idx1].y;

        }        
        const pathElem:any = this.element.children[0];
        pathElem.setAttribute ('d', path);
        pathElem.setAttribute ('stroke', 'black');
        pathElem.setAttribute ('stroke-width', '5');
        pathElem.setAttribute ('fill', 'none');
    }
}