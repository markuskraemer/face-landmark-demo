import hotkeys from 'hotkeys-js';

export class World {

    private _rotationY:number = 0;
    private _zoom:number = 40;

    constructor(public element:HTMLElement){
        this.addEventListeners();
        this.update();
    }

    public addEventListeners(){
        hotkeys('left', { keydown:true, keyup:false }, (ev:KeyboardEvent) => {
            this._rotationY -= 2;
            this.update();
        });

        hotkeys('right', { keydown:true, keyup:false }, (ev:KeyboardEvent) => {
            this._rotationY += 2;
            this.update();
        });

        hotkeys('up', { keydown:true, keyup:false }, (ev:KeyboardEvent) => {
            this._zoom += 2;
            this.update();
        });

        hotkeys('down', { keydown:true, keyup:false }, (ev:KeyboardEvent) => {
            this._zoom -= 2;
            this.update();
        });

    }

    public update() {
        this.element.style.transform = 'translateZ(' + this._zoom + 'px) ' + 'rotateY(' + this._rotationY + 'deg)';
    }

}
