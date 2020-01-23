import { IPoint } from 'face-api.js';
import { TweenLite } from 'gsap';
import { Math2 } from '../../utils/math2';

export class Mouth {

    constructor(public element:HTMLDivElement) {
    }

    public setPosition(position:IPoint){
        TweenLite.to(this.element, 1, {
            x:position.x, 
            y:position.y
        });
    }

    public setShape(points:IPoint[], refWidth:number) {
        const innerMouth = points.slice(0, 12);
        const center = {
            x:innerMouth[0].x + (innerMouth[6].x - innerMouth[0].x)/2,
            y:innerMouth[0].y + (innerMouth[6].y - innerMouth[0].y)/2,
        }
        const height = refWidth/2;
        const mapped = innerMouth.map((p:IPoint) => {
            return { 
                x: 40 * (p.x - center.x) / refWidth,  
                y: 20 * (p.y - center.y) / height  
            }
        });

        const mouthSeqments = this.element.querySelector('#mouth-seqments');
        for(let i = 0; i < innerMouth.length; ++i){
            const nextIdx = (i + 1)%innerMouth.length;
            const child:any = mouthSeqments.children[i];

            const startPoint = mapped[i];
            const endPoint = mapped[nextIdx];

            TweenLite.to(child, .5, {
                x:startPoint.x , 
                y:startPoint.y ,
                rotation:Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) / Math.PI * 180 + '_short',
                width:Math2.distanceBetweenPoints(startPoint, endPoint) * 1.2,
                overwrite:true
            });
        }        
    }
    
}