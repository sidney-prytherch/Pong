let maxTop = .7 * window.innerHeight;
let minTop = 0;
let pixelPerMs = window.innerHeight / 1600;
let ballPixelPerMs = window.innerHeight / 1400;

class Player {

    /**
     * 
     * @param {number} num player number - 1 or 2
     * @param {{up: number, down: number}} keyMap player keyboard map
     */
    constructor(num, keyMap) {
        /** @type {number} */
        this._playerNumber = num;

        /** @type {{up: number, down: number}} */
        this.keyMap = keyMap;

        /** @type {number} */
        this.keyDown = null;

        /** @type {number} */
        this._paddleMovementInterval = null;

        /** @type {number} */
        this.lastTimestamp = null;

        /** @type {number} */
        this.direction = null;

        /** @type {number} */
        this.topRatio = null;

        /** @type {number} */
        this.step = (timestamp) => {
            if (!this.lastTimestamp) {
                this.lastTimestamp = timestamp;
            } 
            var timeDifference = timestamp - this.lastTimestamp;
            const pixelDifference = Math.round(timeDifference * pixelPerMs * this.direction);
            this.setTop(this.top + pixelDifference);
            this.lastTimestamp = timestamp;
            this._paddleMovementInterval = window.requestAnimationFrame(this.step);
        }

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

    /**
     * 
     * @param {string} direction 'up' or 'down' - matches property names of keyMap
     */
    setMovementInterval(direction) {
        if (direction !== 'up' && direction !== 'down') {
            console.log('error - inconsistent property names?');
        } else {
            this.direction = (direction === 'up') ? -1 : 1
            this.clearMovementInterval();
            window.requestAnimationFrame(this.step);
        }
    }
    
    clearMovementInterval() {
        this.lastTimestamp = null;
        window.cancelAnimationFrame(this._paddleMovementInterval);
    }
    
}

let players;

/**
 * 
 * @param {KeyboardEvent} event 
 */
document.addEventListener('keydown', (event) => {
    event = event || window.event;
    event.preventDefault();
    keySearch:
    for (let player of players) {
        for (let property in player.keyMap) {
            if (event.keyCode === player.keyMap[property] && event.keyCode !== player.keyDown) {
                player.keyDown = event.keyCode;
                player.setMovementInterval(property);
                break keySearch;
            }
        }
    }
}, false);

/**
 * 
 * @param {KeyboardEvent} event 
 */
document.addEventListener('keyup', (event) => {
    event = event || window.event;
    event.preventDefault();
    keySearch:
    for (let player of players) {
        for (let property in player.keyMap) {
            if (event.keyCode === player.keyMap[property] && event.keyCode === player.keyDown) {
                player.keyDown = null;
                player.clearMovementInterval();
                break keySearch;
            }
        }
    }
}, false);

document.addEventListener('DOMContentLoaded', () => {
    players = [
        new Player(1, {up: 87, down: 83}),
        new Player(2, {up: 38, down: 40})
    ];
}, false);

window.addEventListener('resize', () => {
    pixelPerMs = window.innerHeight / 1600;
    maxTop = .7 * window.innerHeight;
    for (let player of players) {
        player.setTop(player.topRatio * maxTop);
    }
}, false);