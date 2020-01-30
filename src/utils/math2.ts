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

    public static getControlPoints(x0:number, y0:number, x1:number, y1:number, x2:number, y2:number, t:number):number[]{
        //  x0,y0,x1,y1 are the coordinates of the end (knot) pts of this segment
        //  x2,y2 is the next knot -- not connected here but needed to calculate p2
        //  p1 is the control point calculated here, from x1 back toward x0.
        //  p2 is the next control point, calculated here and returned to become the 
        //  next segment's p1.
        //  t is the 'tension' which controls how far the control points spread.
        
        //  Scaling factors: distances from this knot to the previous and following knots.
        var d01=Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2));
        var d12=Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
       
        var fa=t*d01/(d01+d12);
        var fb=t-fa;
      
        var p1x=x1+fa*(x0-x2);
        var p1y=y1+fa*(y0-y2);
    
        var p2x=x1-fb*(x0-x2);
        var p2y=y1-fb*(y0-y2);  
        
        return [p1x,p1y,p2x,p2y]
    }

    public static splineCurve(firstPoint:IPoint, middlePoint:IPoint, afterPoint:IPoint, t:number):{previous:IPoint, next:IPoint} {
        // Props to Rob Spencer at scaled innovation for his post on splining between points
        // http://scaledinnovation.com/analytics/splines/aboutSplines.html
    
        // This function must also respect "skipped" points
    
        var previous = firstPoint;
        var current = middlePoint;
        var next = afterPoint;
    
        var d01 = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
        var d12 = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));
    
        var s01 = d01 / (d01 + d12);
        var s12 = d12 / (d01 + d12);
    
        // If all points are the same, s01 & s02 will be inf
        s01 = isNaN(s01) ? 0 : s01;
        s12 = isNaN(s12) ? 0 : s12;
    
        var fa = t * s01; // scaling factor for triangle Ta
        var fb = t * s12;
    
        return {
            previous: {
                x: current.x - fa * (next.x - previous.x),
                y: current.y - fa * (next.y - previous.y)
            },
            next: {
                x: current.x + fb * (next.x - previous.x),
                y: current.y + fb * (next.y - previous.y)
            }
        };
    }
}