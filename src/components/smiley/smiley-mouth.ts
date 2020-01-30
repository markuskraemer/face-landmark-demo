import { IPoint } from "face-api.js";
import { TweenLite } from "gsap";
import { Math2 } from '../../utils/math2';

export class SmileyMouth {

    constructor(public element:HTMLDivElement) {
    }

    public setPosition(position:IPoint){
        TweenLite.to(this.element, .5, {
            x:position.x, 
            y:position.y
        });
    }

    private mapPoint(p:IPoint, center:IPoint, refWidth:number, pathWidth:number, pathHeight:number){
        return { 
            x: 40 * (p.x - center.x) / refWidth + 20 * pathWidth,  
            y: 40 * (p.y - center.y) / refWidth + 20 * pathHeight
        }
    }

    private drawPath(points:IPoint[]):string {        
        
        let result = '';
        const t = .4;
        
        for(let i = 0; i <= points.length + 1; ++i) {
            const idx0 = (i - 1 + points.length) % points.length;
            const idx1 = i % points.length;
            const idx2 = (i + 1) % points.length;

            const controllPoints = Math2.splineCurve (
                points[idx0],
                points[idx1],
                points[idx2],
                t
            );

            if(i === 0){
                result += 'M' + points[idx1].x + ' ' + points[idx1].y;
            } 
            result += ' S' 
                    + controllPoints.previous.x + ' ' + controllPoints.previous.y + ', ' 
                    + points[idx1].x + ' ' + points[idx1].y;
            
        }        
        return result;
    }

    public setShape(points:IPoint[], refWidth:number) {
        const outerMouth = points.slice(0, 12);
        const innerMouth = points.slice(12);

        const center = {
            x:outerMouth[0].x + (outerMouth[6].x - outerMouth[0].x)/2,
            y:outerMouth[2].y + (outerMouth[9].y - outerMouth[2].y)/2,
        }

        const pathWidth = Math.abs((outerMouth[6].x - outerMouth[0].x) / refWidth);
        const pathHeight = Math.abs((outerMouth[9].y - outerMouth[2].y) / refWidth);

        const mappedOuterMouth = outerMouth.map((p:IPoint) => 
            this.mapPoint(p, center, refWidth, pathWidth, pathHeight)
        );

        const mappedInnerMouth = innerMouth.map((p:IPoint) => 
            this.mapPoint(p, center, refWidth, pathWidth, pathHeight)
        ); 

        const elem:any = this.element;
        const extraspace = 40;
//        elem.setAttribute ('width', 40 * pathWidth + extraspace);
//        elem.setAttribute ('height', 40 * pathHeight + extraspace);
        const w = 40 * pathWidth + extraspace;
        const h = 40 * pathHeight + extraspace;
        elem.setAttribute ('viewbox', (-w/2) + ' ' + (-h/2) + ' ' + w + ' ' + h);          
        /*
        const outerPathElem:any = this.element.children[0];
        outerPathElem.setAttribute ('d', this.drawPath(mappedOuterMouth));
        outerPathElem.setAttribute ('stroke', 'black');
        outerPathElem.setAttribute ('stroke-width', '2');
        outerPathElem.setAttribute ('fill', 'none');
        */
        const innerPathElem:any = this.element.children[1];
        innerPathElem.setAttribute ('d', this.drawPath(mappedInnerMouth));
        innerPathElem.setAttribute ('stroke', 'black');
        innerPathElem.setAttribute ('stroke-width', '2');
        innerPathElem.setAttribute ('fill', 'none');

    }

}