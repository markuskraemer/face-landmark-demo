import { IPoint } from 'face-api.js';
export class Math2 {
    public static distanceBetweenPoints(p1:IPoint, p2:IPoint):number {
        const a = p2.x - p1.x | 0;
        const b = p2.y - p1.y | 0;
        return Math.sqrt(a * a + b * b);
    }

    public static subtractPoint(p1:IPoint, origin:IPoint):IPoint {
        return {
            x:p1.x - origin.x,
            y:p1.y - origin.y,
        }
    }
}