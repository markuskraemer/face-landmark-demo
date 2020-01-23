import { IPoint } from "face-api.js";
import { TweenLite } from "gsap";

export class Eye {

    constructor(public element:HTMLDivElement) {
    }

    public setPosition(position:IPoint){
        TweenLite.to(this.element, .5, {
            x:position.x, 
            y:position.y
        });
    }

    public setShape(points:IPoint[], refWidth:number) {
        /*
        const width = points[3].x - points[0].x | 0;
        TweenLite.to(this.element, .25, {
            scaleX:width/refWidth,
            scaleY:width/refWidth/1.5
        });
        */
    }

}