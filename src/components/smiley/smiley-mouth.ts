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
            x: 40 * (p.x - center.x) / refWidth + pathWidth,  
            y: 40 * (p.y - center.y) / refWidth + pathHeight
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

        const w = (outerMouth[6].x - outerMouth[0].x);
        const h = (outerMouth[9].y - outerMouth[2].y);
        const extraspace = 40;

        const center = {
            x:outerMouth[0].x + w/2,
            y:outerMouth[2].y + h/2,
        }

        const pathWidth = Math.abs(w / refWidth);
        const pathHeight = Math.abs(h / refWidth);
        const elemWidth = 40 * pathWidth + 40;
        const elemHeight = 40 * pathHeight + 40;

        const mappedOuterMouth = outerMouth.map((p:IPoint) => 
            this.mapPoint(p, center, refWidth, elemWidth / 2, elemHeight / 2)
        );

        const mappedInnerMouth = innerMouth.map((p:IPoint) => 
            this.mapPoint(p, center, refWidth, elemWidth / 2, elemHeight / 2)
        ); 

        const elem:any = this.element;
        elem.setAttribute ('width', elemWidth);
        elem.setAttribute ('height', elemHeight);
        
        const outerPathElem:any = this.element.children[0];
        outerPathElem.setAttribute ('d', this.drawPath(mappedOuterMouth));
        outerPathElem.setAttribute ('stroke', 'black');
        outerPathElem.setAttribute ('stroke-width', '2');
        outerPathElem.setAttribute ('fill', 'none');
        
        const innerPathElem:any = this.element.children[1];
        innerPathElem.setAttribute ('d', this.drawPath(mappedInnerMouth));
        innerPathElem.setAttribute ('stroke', 'black');
        innerPathElem.setAttribute ('stroke-width', '2');
        innerPathElem.setAttribute ('fill', 'none');

    }

}