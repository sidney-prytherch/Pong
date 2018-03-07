let maxTop = 100;
let minTop = 0;
const PADDLE_TOP_CHANGE = 5;

class Player {

    /** @type {number} */
    _playerNumber;
    /** @type {{up: number, down: number}} */
    keyMap;
    /** @type {number} */
    _paddleMovementInterval
    
    get _paddleId() {
        return 'paddle' + this._playerNumber;
    }

    get _top() {
        return Number(document.getElementById(this._paddleId).style.top);
    }

    set _top(newTop) {
        newTop = Math.min(maxTop, Math.max(minTop, newTop));
        document.getElementById(this._paddleId).style.top = newTop;
    }

    /**
     * 
     * @param {number} num player number - 1 or 2
     * @param {{up: number, down: number}} keyMap player keyboard map
     */
    constructor(num, keyMap) {
        this._playerNumber = num;
        this._keyMap = keyMap;
    }

    /**
     * 
     * @param {string} direction 'up' or 'down' - matches property names of keyMap
     */
    setMovementInterval(direction) {
        if (direction !== 'up' && direction !== 'down') {
            console.log('error - inconsistent property names?');
        } else {
            clearMovementInterval();
            const pixelDifference = PADDLE_TOP_CHANGE * (direction === 'up') ? -1 : 1;
            this._paddleMovementInterval = setInterval(() => {
                this._top(this._top + pixelDistance);
            }, 1000/60);
        }
    }
    
    clearMovementInterval() {
        clearInterval(this._paddleMovementInterval);
    }
    
}

export default Player;
