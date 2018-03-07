import Player from './Player.js';

const players = [
    new Player(1, {up: 87, down: 83}), 
    new Player(2, {up: 38, down: 40})
];

/**
 * 
 * @param {KeyboardEvent} event 
 */
document.onkeydown = function(event) {
    event = event || window.event;
    keySearch:
    for (let player of players) {
        for (let property in player.keyMap) {
            if (event.keyCode === player.keyMap[property]) {
                player.setMovementInterval(property);
                break keySearch;
            }
        }
    }
}
