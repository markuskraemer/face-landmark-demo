import { IPoint } from "face-api.js";
import { TweenLite } from "gsap";

export class SmileyMouth {

    constructor(public element:HTMLDivElement) {
    }

    public setPosition(position:IPoint){
        TweenLite.to(this.element, .5, {
            x:position.x, 
            y:position.y
        });
    }

    public setShape(points:IPoint[], refWidth:number) {
        const outerMouth = points.slice(0, 12);

        const center = {
            x:outerMouth[0].x + (outerMouth[6].x - outerMouth[0].x)/2,
            y:outerMouth[2].y + (outerMouth[9].y - outerMouth[2].y)/2,
        }

        const pathWidth = (outerMouth[6].x - outerMouth[0].x) / refWidth;
        const pathHeight = (outerMouth[9].y - outerMouth[2].y) / refWidth;

        const mapped = outerMouth.map((p:IPoint) => {
            return { 
                x: 40 * (p.x - center.x) / refWidth + 20 * pathWidth,  
                y: 40 * (p.y - center.y) / refWidth + 20 * pathHeight
            }
        });
        const elem:any = this.element;
        elem.setAttribute ('width', 40 * pathWidth);
        elem.setAttribute ('height', 40 * pathHeight);

        let path = '';
        for(let i = 0; i <= mapped.length; ++i){
            const idx = i % mapped.length;
            if(i === 0){
                path += 'M' + mapped[idx].x + ' ' + mapped[idx].y;
            } else {
                path += ' L' + mapped[idx].x + ' ' + mapped[idx].y;
                if(i === mapped.length - 1){
                   // path += ' Z';
                }
            }
        }        
        const pathElem:any = this.element.children[0];
        pathElem.setAttribute ('d', path);
        pathElem.setAttribute ('stroke', 'black');
        pathElem.setAttribute ('stroke-width', '2');
        pathElem.setAttribute ('fill', 'grey');

    }

}