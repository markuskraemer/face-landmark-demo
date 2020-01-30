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
    
    public setShape(points:IPoint[]) {
        const width = Math.abs(points[points.length-1].x - points[0].x);
        const height = width/2;
        let mapped = points.map((p:IPoint) => {
            return { 
                x: 40 * (p.x - points[0].x) / width + (width + 20 - 40) / 2,  
                y: 20 * (p.y - points[2].y) / height + (height) / 2
            }
        });
        
        const elem:any = this.element;
        elem.setAttribute ('width', width + 20);
        elem.setAttribute ('height', height + 20);

        let path = '';
        for(let i = 0; i < mapped.length; ++i){
            if(i === 0){
                path += 'M' + mapped[i].x + ' ' + mapped[i].y;
            } else {
                path += ' L' + mapped[i].x + ' ' + mapped[i].y;
                if(i === mapped.length - 1){
                   // path += ' Z';
                }
            }
        }        
        const pathElem:any = this.element.children[0];
        pathElem.setAttribute ('d', path);
        pathElem.setAttribute ('stroke', 'black');
        pathElem.setAttribute ('stroke-width', '10');
        pathElem.setAttribute ('fill', 'none');
    }
}