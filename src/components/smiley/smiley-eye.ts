import { IPoint } from "face-api.js";
import { TweenLite } from "gsap";

export class SmileyEye {

    constructor(public element:HTMLDivElement) {
    }

    public setPosition(position:IPoint){
        TweenLite.to(this.element, .5, {
            x:position.x, 
            y:position.y
        });
    }

    public setShape(points:IPoint[], refWidth:number) {
    }

}