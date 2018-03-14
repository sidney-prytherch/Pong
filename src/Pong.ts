const ballDiameterPercent = 0.035;
const paddleHeightPercent = 0.3;
const paddleWidthPercent = .01;
const minPaddlePadding = 15;
const minPaddleWidth = 15;
let paddleWidth: number;
let paddlePadding: number;
let distBetweenPaddles: number;
const widthToHeightRatio = 5 / 3;
const maxScore = 10;

let maxTop = (1 - paddleHeightPercent) * window.innerHeight;
let innerHeightBallFrames = 900;
const minHeightBallFrames = 500;
const innerHeightPaddleFrames = 1600;
let pixelPerMs = window.innerHeight / innerHeightPaddleFrames;
const lowestAngle = Math.PI / 5;
const startingAngle = Math.PI / 4;

let pauseDiv: HTMLElement;
let paused = true;
let started = false;

let players: Player[];
let ball: Ball;

type Paddle = {top: number, right: number, bottom: number, left: number, width: number, height: number, direction: number};

document.addEventListener('keydown', (event) => {
    if (!paused) {
        for (let player of players) {
            for (let property in player.keyMap) {
                if (event.keyCode === player.keyMap[property].keyCode && !player.keyMap[property].isPressed) {
                    player.keyMap[property].isPressed = true;
                    player.setMovementInterval(property);
                    return;
                }
            }
        }
    }   
}, false);

document.addEventListener('keyup', (event) => {
    if (!paused) {
        for (let player of players) {
            for (let property in player.keyMap) {
                if (event.keyCode === player.keyMap[property].keyCode) {
                    player.keyMap[property].isPressed = false;
                    player.clearMovementInterval(true, property);
                    return;
                }
            }
        }
        if (event.keyCode === 32) {
            pause();
        }
    } else if (event.keyCode === 32) {
        pauseDiv.style.visibility = 'hidden';
        paused = false;
        ball.unpause();
    }
}, false);

document.addEventListener('DOMContentLoaded', () => {
    paddleWidth = Math.max(Math.round(window.innerWidth * paddleWidthPercent), minPaddleWidth);
    distBetweenPaddles = Math.min(window.innerWidth - 2 * (paddleWidth + minPaddlePadding), widthToHeightRatio * window.innerHeight);
    paddlePadding = Math.round((window.innerWidth - distBetweenPaddles - 2 * paddleWidth) / 2);
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
    ball = new Ball();
    pauseDiv = document.getElementById('pause');
}, false);

window.addEventListener('resize', () => {
    if (!paused) {
        pause();
    }
    pixelPerMs = window.innerHeight / innerHeightPaddleFrames;
    maxTop = (1 - paddleHeightPercent) * window.innerHeight;
    paddleWidth = Math.max(Math.round(window.innerWidth * paddleWidthPercent), minPaddleWidth);
    distBetweenPaddles = Math.min(window.innerWidth - 2 * (paddleWidth + minPaddlePadding), widthToHeightRatio * window.innerHeight);
    paddlePadding = Math.round((window.innerWidth - distBetweenPaddles - 2 * paddleWidth) / 2);
    for (let player of players) {
        player.resize();
    }
    ball.resize();
}, false);

function restart(playerNum: number) {
    pause();
    started = false;
    pauseDiv.innerHTML = '<p>PLAYER ' + playerNum + ' WINS! PRESS SPACE TO RESTART</p>';
    innerHeightBallFrames = 900;
    ball.init();
    for (let player of players) {
        player.init();
    }
}

function pause() {
    paused = true;
    if (!started) {
        pauseDiv.innerHTML = '<p>PRESS SPACE TO UNPAUSE</p>';
        started = true;
    }
    for (let player of players) {
        player.pause();
    }
    ball.pause();
    pauseDiv.style.visibility = 'visible';
}

class Player {

    public keyMap: {[direction: string]: {isPressed: boolean, keyCode: number}};
    private _lastTimestamp: number;
    public topRatio: number;
    public _step: (timestamp: number) => void;
    public playerNumber: number;
    private _paddleMovementInterval: number;
    public _direction: string;
    public _score: number;
    public paddle: HTMLElement;
    private _directionToNum = {
        'up': -1,
        'down': 1,
        'none': 0
    }

    constructor(num, keyMap) {
        this.playerNumber = num;
        this.paddle = document.getElementById('paddle' + this.playerNumber);
        this.keyMap = keyMap;
        this._direction = 'none';
        this._step = (timestamp) => {
            if (!this._lastTimestamp) {
                this._lastTimestamp = timestamp;
            } 
            const timeDifference = timestamp - this._lastTimestamp;
            const pixelDistance = Math.round(timeDifference * pixelPerMs * this._directionToNum[this._direction]);
            this.setTop(this.top + pixelDistance);
            this._lastTimestamp = timestamp;
            this._paddleMovementInterval = window.requestAnimationFrame(this._step);
        }
        this.init();
    }

    public set score(newScore: number) {
        this._score = newScore;
        document.getElementById('score' + this.playerNumber).innerHTML = '<p>' + newScore + '</p>';
    }

    public get score() {
        return this._score;
    }

    public init() {
        this.score = 0;
        this.setTop(maxTop / 2);
        this.paddle.style.height = Math.round(window.innerHeight * paddleHeightPercent) + 'px';
        this.paddle.style.left = ((this.playerNumber === 1) ? paddlePadding : window.innerWidth - paddlePadding - paddleWidth) + 'px';
        this.paddle.style.width = paddleWidth + 'px';
    }

    public get paddleDetails(): Paddle {
        const left = parseInt(this.paddle.style.left, 10);
        const top = parseInt(this.paddle.style.top, 10);
        const width = parseInt(this.paddle.style.width, 10);
        const height = parseInt(this.paddle.style.height, 10);
        return {
            top,
            right: left + width,
            bottom: top + height,
            left,
            width,
            height,
            direction: this._directionToNum[this._direction]
        };

    }

    public get top() {
        return parseInt(this.paddle.style.top, 10);
    }

    public resize() {
        this.setTop(this.topRatio * maxTop);
        this.paddle.style.height = Math.round(window.innerHeight * paddleHeightPercent) + 'px';
        this.paddle.style.left = ((this.playerNumber === 1) ? paddlePadding : window.innerWidth - paddlePadding - paddleWidth) + 'px';
        this.paddle.style.width = paddleWidth + 'px';
    }

    public setTop(newTop: number) {
        newTop = Math.min(maxTop, Math.max(0, Math.round(newTop)));
        this.paddle.style.top = newTop + 'px';
        this.topRatio = newTop / maxTop;
    }

    public setMovementInterval(direction: string) {
        if (direction !== 'up' && direction !== 'down') {
            console.log('error - inconsistent property names?');
        } else {
            this._direction = direction;
            window.cancelAnimationFrame(this._paddleMovementInterval);
            window.requestAnimationFrame(this._step);
        }
    }

    public pause() {
        this.clearMovementInterval(false);
        for (let property in this.keyMap) {
            this.keyMap[property].isPressed = false;
        }
    }
    
    public clearMovementInterval(onKeyup: boolean, direction?: string) {
        window.cancelAnimationFrame(this._paddleMovementInterval);
        this._lastTimestamp = null;
        this._direction = 'none';
        if (onKeyup) {
            for (let property in this.keyMap) {
                if (direction !== property && this.keyMap[property].isPressed) {
                    this.setMovementInterval(property);
                }
            }
        }
    }
}

class Ball {
    private _angle: number;
    private _lastTimestamp: number;
    private _ballMovementInterval: number;
    private _topRatio: number;
    private _leftRatio: number;
    private _left: number;
    private _top: number;
    private _ballStyle = document.getElementById('ball').style;
    private _diameter = Math.round(Math.max(ballDiameterPercent * window.innerHeight, paddleWidth));
    private _maxBallTop = window.innerHeight - this._diameter;
    private _maxBallLeft = window.innerWidth - this._diameter;
    private _ballPixelPerMs: number;
    private _missed: boolean;
    private _step = (timestamp) => {
        if (!this._lastTimestamp) {
            this._lastTimestamp = timestamp;
        }
        const timeDifference = timestamp - this._lastTimestamp;
        const pixelDistance = Math.round(timeDifference * this._ballPixelPerMs);
        let newX = Math.round(this._left + pixelDistance * Math.sin(this._angle));
        let newY = Math.round(this._top + pixelDistance * Math.cos(this._angle));
        const p1p = players[0].paddleDetails;
        const p2p = players[1].paddleDetails;
        let extra = 0;
        const right = this._left + this._diameter;
        if (newX < p1p.right) {
            if (!this._missed) {
                const yAtPaddle = (this._top - newY) / (this._left - newX) * (p1p.right - this._left) + this._top;
                if (yAtPaddle > p1p.top - this._diameter * .75 && yAtPaddle < p1p.bottom + this._diameter * .3) {
                    newX = 2 * p1p.right - newX;
                    extra = p1p.direction * -0.1;
                    if (yAtPaddle < p1p.top - this._diameter * .4) {
                        extra += 0.25;
                    } else if (yAtPaddle > p1p.bottom + this._diameter * .1) {
                        extra -= 0.25;
                    }
                    this._reflectAngle(0, extra);
                } else {
                    players[1].score++;
                    this._missed = true;
                }
            }
            if (newX < 0) {
                newX = Math.abs(newX);
                this._reflectAngle(0);
            }
        } else if (newX > p2p.left - this._diameter) {
            if (!this._missed) {
                const yAtPaddle = (newY - this._top) / (newX - this._left) * ((p2p.left - this._diameter) - this._left) + this._top;
                if (yAtPaddle > p2p.top - this._diameter * .75 && yAtPaddle < p2p.bottom + this._diameter * .3) {
                    newX = 2 * (p2p.left - this._diameter) - newX;
                    extra = p2p.direction * 0.1;
                    if (yAtPaddle < p2p.top - this._diameter * .4) {
                        extra -= 0.25;
                    } else if (yAtPaddle > p2p.bottom + this._diameter * .1) {
                        extra += 0.25;
                    }
                    this._reflectAngle(Math.PI, extra);
                } else {
                    players[0].score++;
                    this._missed = true;
                }
            }
            if (newX > this._maxBallLeft) {
                newX = 2 * this._maxBallLeft - newX;
                this._reflectAngle(Math.PI);
            }
        } else if (this._missed) {
            this._missed = false;
        }
        if (newY < 0) {
            newY = Math.abs(newY);
            this._reflectAngle(3 * Math.PI / 2);
        }
        if (newY > this._maxBallTop) {
            newY = 2 * this._maxBallTop - newY;
            this._reflectAngle(Math.PI / 2);
        }
        this._setLocation(newX, newY);
        this._lastTimestamp = timestamp;
        for (let player of players) {
            if (player.score === maxScore) {
                restart(player.playerNumber);
                return;
            }
        }
        this._ballMovementInterval = window.requestAnimationFrame(this._step);
    }

    constructor() {
        this.init();
    }

    public init() {
        this._angle = startingAngle;
        this._missed = false;
        this._setLocation(this._maxBallLeft / 2, this._maxBallTop / 2);
        this.calculateRatio();
        this.resize();
    }

    public resize() {
        this._ballPixelPerMs = window.innerHeight / innerHeightBallFrames;
        this._diameter = Math.round(Math.max(ballDiameterPercent * window.innerHeight, paddleWidth));
        this._maxBallTop = window.innerHeight - this._diameter;
        this._maxBallLeft = window.innerWidth - this._diameter;
        let style = this._ballStyle;
        style.height = style.width = this._diameter + 'px';
        style.borderRadius = Math.round(this._diameter / 2) + 'px';
        this._setLocation(Math.max(0, Math.min(this._leftRatio * distBetweenPaddles + paddlePadding + paddleWidth,
            this._maxBallLeft)), Math.max(0, Math.min(this._topRatio * window.innerHeight, this._maxBallTop)));
        this._left = parseInt(this._ballStyle.left, 10);
        this._top = parseInt(this._ballStyle.top, 10);
    }

    private _reflectAngle(reflectionAngle: number, extra: number = 0) {
        this._angle = (2 * (reflectionAngle + extra) - this._angle) % (2 * Math.PI);
        if (extra !== 0) {
            if (innerHeightBallFrames > minHeightBallFrames) {
                innerHeightBallFrames -= 10;
                this._ballPixelPerMs = window.innerHeight / innerHeightBallFrames;
            }
            if (this._angle < 0) {
                this._angle += 2 * Math.PI;
            }
            if (this._angle < Math.PI / 2) {
                this._angle = Math.max(lowestAngle, this._angle);
            } else if (this._angle < Math.PI) {
                this._angle = Math.min(Math.PI - lowestAngle, this._angle);                
            } else if (this._angle < 3 * Math.PI / 2) {
                this._angle = Math.max(Math.PI + lowestAngle, this._angle);
            } else {
                this._angle = Math.min(2 * Math.PI - lowestAngle, this._angle);
            }
        }
        if (this._angle < Math.PI / 2) {
            this._angle += 2 * Math.PI;
        } else if (this._angle > Math.PI / 2) {
            this._angle -= 2 * Math.PI;
        }
    }

    private _setLocation(left: number, top: number) {
        this._top = top;
        this._left = left;
        this._ballStyle.top = top + 'px';
        this._ballStyle.left = left + 'px';
        if (!paused) {
            this.calculateRatio();
        }
    }

    public calculateRatio() {
        this._topRatio = this._top / this._maxBallTop;
        this._leftRatio = (this._left - paddlePadding - paddleWidth) / distBetweenPaddles;
    }

    pause() {
        this.clearMovementInterval();
    }

    unpause() {
        this._ballMovementInterval = window.requestAnimationFrame(this._step);
    }

    public clearMovementInterval() {
        window.cancelAnimationFrame(this._ballMovementInterval);
        this._lastTimestamp = null;
    }
}