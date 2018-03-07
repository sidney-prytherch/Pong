import Player from './Player.js';

const players = [
    new Player(1, {up: 87, down: 83}),
    new Player(2, {up: 38, down: 40})
];

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
                player.keyDown(event.keyCode);
                player.setMovementInterval(property);
                break keySearch;
            }
        }
    }
});

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
                player.keyDown(null);
                player.clearMovementInterval();
                break keySearch;
            }
        }
    }
});
