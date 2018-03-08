let maxTop = .7 * window.innerHeight;
let minTop = 0;
let pixelPerMs = window.innerHeight / 1600;
let ballPixelPerMs = window.innerHeight / 1400;
let players;
document.addEventListener('keydown', (event) => {
    event.preventDefault();
    keySearch: for (let player of players) {
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
    keySearch: for (let player of players) {
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
        };
        this.setTop(maxTop / 2);
    }
    get _paddleId() {
        return 'paddle' + this._playerNumber;
    }
    get top() {
        return parseInt(document.getElementById(this._paddleId).style.top, 10);
    }
    setTop(newTop) {
        newTop = Math.min(maxTop, Math.max(minTop, newTop));
        document.getElementById(this._paddleId).style.top = newTop + 'px';
        this.topRatio = newTop / maxTop;
    }
    setMovementInterval(direction) {
        if (direction !== 'up' && direction !== 'down') {
            console.log('error - inconsistent property names?');
        }
        else {
            this._direction = (direction === 'up') ? -1 : 1;
            this.clearMovementInterval(direction);
            window.requestAnimationFrame(this.step);
        }
    }
    clearMovementInterval(direction) {
        window.cancelAnimationFrame(this._paddleMovementInterval);
        this.lastTimestamp = null;
        for (let property in this.keyMap) {
            if (direction !== property && this.keyMap[property].isPressed) {
                this.setMovementInterval(property);
            }
        }
    }
}
