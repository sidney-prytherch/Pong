import Player from './Player.js';

const players = [
    new Player(1, {up: 87, down: 83}, false),
    new Player(2, {up: 38, down: 40}, false)
];

/**
 * 
 * @param {KeyboardEvent} event 
 */
document.onkeydown = (event) => {
    event = event || window.event;
    keySearch:
    for (let player of players) {
        for (let property in player.keyMap) {
            if (event.keyCode === player.keyMap[property] && event.keyCode !== player.keyDown) {
                player.keyDown(event.keyCode);
                player.setMovementInterval(property);
                break keySearch;
            }
        }
    }
}

/**
 * 
 * @param {KeyboardEvent} event 
 */
document.onkeyup = (event) => {
    event = event || window.event;
    keySearch:
    for (let player of players) {
        for (let property in player.keyMap) {
            if (event.keyCode === player.keyMap[property] && event.keyCode === player.keyDown) {
                player.keyDown(null);
                player.clearMovementInterval();
                break keySearch;
            }
        }
    }
}
