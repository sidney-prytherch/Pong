let maxTop = 100;
let minTop = 0;
let paddleTopChange = 5;
let start;

class Player {

    /** @type {number} */
    //_playerNumber;
    /** @type {{up: number, down: number}} */
    //keyMap;
    /** @type {number} */
    //_paddleMovementInterval
    /** @type {number} */
    //keyDown;

    /**
     * 
     * @param {number} num player number - 1 or 2
     * @param {{up: number, down: number}} keyMap player keyboard map
     */
    constructor(num, keyMap) {
        /** @type {number} */
        this._playerNumber = num;
        /** @type {{up: number, down: number}} */
        this._keyMap = keyMap;
        /** @type {number} */
        this.keyDown = null;
        /** @type {number} */
        this._paddleMovementInterval = null
    }
    
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
     * @param {string} direction 'up' or 'down' - matches property names of keyMap
     */
    setMovementInterval(direction) {
        if (direction !== 'up' && direction !== 'down') {
            console.log('error - inconsistent property names?');
        } else {
            clearMovementInterval();
            function step(timestamp) {
                if (!start) start = timestamp;
                console.warn(timestamp);
                var progress = timestamp - start;
                //element.style.left = Math.min(progress / 10, 200) + 'px';
                if (progress < 10) {
                  window.requestAnimationFrame(step);
                }
              }
              
              window.requestAnimationFrame(step);

            //onst pixelDifference = paddleTopChange * (direction === 'up') ? -1 : 1;
            //this._paddleMovementInterval = setInterval(() => {
             //   this._top(this._top + pixelDifference);
            //}, 1000/60);
        }
    }
    
    clearMovementInterval() {
        window.cancelAnimationFrame(this._paddleMovementInterval);
    }
    
}

export default Player;
