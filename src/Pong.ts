let maxTop = .7 * window.innerHeight;
let minTop = 0;
let pixelPerMs = window.innerHeight / 1600;
let ballPixelPerMs = window.innerHeight / 1400;
let players: Player[];

document.addEventListener('keydown', (event) => {
    event.preventDefault();
    keySearch:
    for (let player of players) {
        for (let property in player.keyMap) {
            if (event.keyCode === player.keyMap[property].keyCode && !player.keyMap[property].isPressed) {
                player.keyMap[property].isPressed = true;
                player.setMovementInterval(property);
                break keySearch;
            }
        }
    }
}, false);

document.addEventListener('keyup', (event) => {
    event.preventDefault();
    keySearch:
    for (let player of players) {
        for (let property in player.keyMap) {
            if (event.keyCode === player.keyMap[property].keyCode) {
                player.keyMap[property].isPressed = false;
                player.clearMovementInterval(property);
                break keySearch;
            }
        }
    }
}, false);

document.addEventListener('DOMContentLoaded', () => {
    players = [
        new Player(1, {
            up: {
                isPressed: false,
                keyCode: 87
            },
            down: {
                isPressed: false,
                keyCode: 83
            }
        }),
        new Player(2, {
            up: {
                isPressed: false,
                keyCode: 38
            }, 
            down: {
                isPressed: false,
                keyCode: 40
            }
        })
    ];
}, false);

window.addEventListener('resize', () => {
    pixelPerMs = window.innerHeight / 1600;
    maxTop = .7 * window.innerHeight;
    for (let player of players) {
        player.setTop(player.topRatio * maxTop);
    }
}, false);

class Player {

    public keyMap: {[direction: string]: {isPressed: boolean, keyCode: number}};
    public lastTimestamp: number;
    public topRatio: number;
    public step: (timestamp: number) => void;
    private _playerNumber: number;
    private _paddleMovementInterval: number;
    private _direction: number;

    constructor(num, keyMap) {
        this._playerNumber = num;
        this.keyMap = keyMap;
        this.step = (timestamp) => {
            if (!this.lastTimestamp) {
                this.lastTimestamp = timestamp;
            } 
            var timeDifference = timestamp - this.lastTimestamp;
            const pixelDifference = Math.round(timeDifference * pixelPerMs * this._direction);
            this.setTop(this.top + pixelDifference);
            this.lastTimestamp = timestamp;
            this._paddleMovementInterval = window.requestAnimationFrame(this.step);
        }
        this.setTop(maxTop / 2);
    }
    
    private get _paddleId() {
        return 'paddle' + this._playerNumber;
    }

    public get top() {
        return parseInt(document.getElementById(this._paddleId).style.top, 10);
    }

    public setTop(newTop) {
        newTop = Math.min(maxTop, Math.max(minTop, newTop));
        document.getElementById(this._paddleId).style.top = newTop + 'px';
        this.topRatio = newTop / maxTop;
    }

    public setMovementInterval(direction) {
        if (direction !== 'up' && direction !== 'down') {
            console.log('error - inconsistent property names?');
        } else {
            this._direction = (direction === 'up') ? -1 : 1
            this.clearMovementInterval(direction);
            window.requestAnimationFrame(this.step);
        }
    }
    
    public clearMovementInterval(direction: string) {
        window.cancelAnimationFrame(this._paddleMovementInterval);
        this.lastTimestamp = null;
        for (let property in this.keyMap) {
            if (direction !== property && this.keyMap[property].isPressed) {
                this.setMovementInterval(property);
            }
        }
    }
}

let ballPixelsPerSecond = 15;

class Ball {

	private _x: number;
	private _y: number;
	private _lastTimestamp: number;
	private _moveBall: (timestamp) => void;
	private _angleOfMovement: number;
	private _diameter: number;
	private _maxX = window.innerWidth - this._diameter;
	private _maxY = window.innerHeight - this._diameter;
	private _p1p: {left: number, top: number, width: number, right: number};
	private _p2p: {left: number, top: number, width: number, right: number};

	constructor() {
		this._moveBall = (timestamp) => {
			if (!this._lastTimestamp) {
				this._lastTimestamp = timestamp;
			}
			const timeDiff = timestamp - this._lastTimestamp;
			const distance = ballPixelsPerSecond * timeDiff;
			let newX = this._x + distance * Math.sin(this._angleOfMovement);
			let newY = this._y + distance * Math.cos(this._angleOfMovement);
			if (newY < 0) {
				newY = Math.abs(newY);
				this.calculateAngle(3 * Math.PI / 2);
			}
			if (newY > this._maxY) {
				newY = this._maxY - newY;
				this.calculateAngle(3 * Math.PI);
			}
			if (newX < this._p1p.right) {
				if (newX < 0 && this._x - newX < this._p1p.right) {
					newX = Math.abs(newX);
				} else {
					newX = this._p1p.right - newX;
				}
				this.calculateAngle(0);
			}
			if (newX > this._p2p.left) {
				if (newX > this._maxX && this._x - newX < this._p1p.right) {
					newX = this._maxX - this._diameter - newX;
				} else {
					newX = this._p2p.left - this._diameter - newX;
				}
				this.calculateAngle(Math.PI);
			}
		}
	}

	calculateAngle(reflectionAngle: number) {
		this._angleOfMovement = reflectionAngle - (this._angleOfMovement - reflectionAngle) % 2 * Math.PI;
	}
}
